import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UserInterface} from '../users/interfaces/user.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        console.log('aann');
        super();
    }

    async validate(username: string, password: string): Promise<UserInterface | never> {
        console.log('aaaaaaaaaaaaaaaa');
        const user: UserInterface = await this.authService.validateUser(username, password);
        if (!user) {
            throw new NotFoundException('Data is incorrect');
        }
        return user;
    }
}