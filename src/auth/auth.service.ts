import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserRepository} from '../repositories/base/user.repository';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {UserDocument} from '../users/schemas/user.schema';
import {UserDto} from '../users/dtos/userDto';
import {
  LoginPayloadInterface,
  LoginReturnInterface,
} from './interfaces/login.payload';

const salt = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: UserDto): Promise<UserDocument> {
    const existUser = await this.userRepository.findByQuery({
      email: createUserDto.email,
    });
    if (existUser[0]) {
      console.log('exists user --->', existUser)
      throw new HttpException(
        'This user is already exist',
        HttpStatus.CONFLICT,
      );
    }

    const hash: string = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hash;

    return this.userRepository.create(createUserDto);
  }

  async validateUser(username: string, pass: string): Promise<UserDocument> {
    const user: UserDocument[] = await this.userRepository.findByQuery({
      email: username,
    });

    if (user && user.length > 0) {
      const isMatch: boolean = await bcrypt.compare(pass, user[0].password);
      if (!isMatch) {
        return null;
      }
      return user[0];
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
