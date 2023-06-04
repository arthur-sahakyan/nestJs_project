import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UserInterface} from '../users/interfaces/user.interface';
import {UserDocument} from '../users/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<UserInterface | never> {
    const user: UserDocument = await this.authService.validateUser(
      username,
      password,
    );
    if (!user) {
      throw new NotFoundException('Data is incorrect');
    } else if (!user.active) {
      throw new BadRequestException('You are not active please verify your email.');
    }
    return user;
  }
}
