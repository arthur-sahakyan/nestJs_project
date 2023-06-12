import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import {UserRepository} from '../repositories/base/user.repository';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {UserDocument} from '../users/schemas/user.schema';
import {UserDto} from '../users/dtos/user.dto';
import {
  LoginPayloadInterface,
  LoginReturnInterface,
} from './interfaces/login.payload';
import {ForgetPasswordRepository} from '../repositories/base/forget.password.repository';
import {VerificationRepository} from '../repositories/base/verification.repository';
import {EmailService} from '../email/email.service';
import {createHash} from '../utils/create.hash';
import * as moment from 'moment';
import {EXPIRES_MINUTES} from '../constants/auth.constants';
import {textReplacer} from '../utils/text.replacer';
import {
  alreadyExists,
  inValid,
  verifyEmail,
  verifyEmailSubject,
} from '../constants/messages.constants';
import {ConfigService} from '@nestjs/config';
import {createDateTimeByMinutes} from "../utils/date-time";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly forgetPasswordRepository: ForgetPasswordRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: UserDto): Promise<void> {
    const existUser = await this.userRepository.findOneByQuery({
      email: createUserDto.email,
    });
    if (existUser) {
      throw new HttpException(
        {
          message: textReplacer(alreadyExists, {item: 'user'}),
        },
        HttpStatus.CONFLICT,
      );
    }
    createUserDto.password = await createHash(createUserDto.password);

    const createdUser = await this.userRepository.create(createUserDto);

    const verificationHash = await createHash(
      createdUser._id + createdUser.email,
    );
    const dateTime = createDateTimeByMinutes(EXPIRES_MINUTES);
    await this.verificationRepository.create({
      time: dateTime,
      token: verificationHash,
      userId: createdUser._id,
    });
    const verificationUrl = `${this.configService.get(
      'BASE_URL',
    )}/auth/verify/${verificationHash}`;
    const templatePath = path.join(path.resolve(), 'src', 'templates', 'account.verification.ejs');
    const template = await new Promise((res, rej) => {
      fs.readFile(templatePath, 'utf8', function(err, data){
        if (err) rej(textReplacer(inValid, {item: 'path'}))
        res(data)
      });
    });

    const html = ejs.render(template, {email: createUserDto.email, verificationUrl})

    await this.emailService.sendEmail({
      email: createUserDto.email,
      subject: verifyEmailSubject,
      html,
    });
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

  async verifyAccount(token): Promise<boolean> {
    const verificationDocument =
      await this.verificationRepository.findOneByQuery({
        token,
      });

    if (!verificationDocument?.userId) {
      throw new HttpException(
        {
          message: textReplacer(inValid, {item: 'token'}),
          success: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userRepository.update(verificationDocument.userId.toString(), {
      active: true,
    });

    await this.verificationRepository.delete(
      verificationDocument._id.toString(),
    );
    return true;
  }
}
