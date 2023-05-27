import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from '../users/schemas/user.schema';
import {ForgetPassword, ForgetPasswordSchema} from "./forgot-password/schemas/forget.password.schema";
import {UsersModule} from '../users/users.module';
import {PassportModule} from '@nestjs/passport';
import {LocalStrategy} from './local.strategy';
import {JwtStrategy} from './jwt.strategy';
import {JwtModule} from '@nestjs/jwt';
import {jwtConstants} from './constants';
import {UserRepository} from '../repositories/base/user.repository';
import { ForgotPasswordService } from './forgot-password/forgot-password.service';
import {ForgetPasswordRepository} from "../repositories/base/forget.password.repository";

@Module({
  imports: [

    PassportModule,
    UsersModule,
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}, {name: ForgetPassword.name, schema: ForgetPasswordSchema}]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '3600s'},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, UserRepository, ForgetPasswordRepository, ForgotPasswordService],
})
export class AuthModule {}
