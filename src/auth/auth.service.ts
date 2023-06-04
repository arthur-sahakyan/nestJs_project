import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserRepository} from '../repositories/base/user.repository';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {UserDocument} from '../users/schemas/user.schema';
import {UserDto} from '../users/dtos/user.dto';
import {LoginPayloadInterface, LoginReturnInterface} from './interfaces/login.payload';
import {ForgetPasswordRepository} from "../repositories/base/forget.password.repository";
import {VerificationRepository} from "../repositories/base/verification.repository";
import {EmailService} from "../email/email.service";
import {createHash} from "../utils/create.hash";
import * as moment from 'moment';
import {EXPIRES_MINUTES, TIME_FORMAT} from "../constants/auth.constants";


@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly forgetPasswordRepository: ForgetPasswordRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly emailService: EmailService
  ) {}

  async create(createUserDto: UserDto): Promise<void> {
    const existUser = await this.userRepository.findOneByQuery({
      email: createUserDto.email,
    });
    if (existUser) {
      throw new HttpException(
        'This user is already exist.Please log in',
        HttpStatus.CONFLICT,
      );
    }
    createUserDto.password = await createHash(createUserDto.password);

    const createdUser = await this.userRepository.create(createUserDto);

    const verificationHash = await createHash(createdUser._id + createdUser.email);
    const dateTime = moment.utc().add(EXPIRES_MINUTES, 'minutes').format(TIME_FORMAT);
    await this.verificationRepository.create({
      time: dateTime,
      token: verificationHash,
      userId: createdUser._id
    });

    await this.emailService.sendVerificationEmail(createUserDto.email, verificationHash);

  }

  async validateUser(username: string, pass: string): Promise<UserDocument> {
    const user: UserDocument = await this.userRepository.findOneByQuery({
      email: username,
    });

    if (user) {
      const isMatch: boolean = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        return null;
      }
      return user;
    }
    return null;
  }

  async login(user: UserDocument): Promise<LoginReturnInterface> {
    const payload: LoginPayloadInterface = {
      username: user.email,
      sub: user._id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
