import {Controller, Post, Body, UseGuards, Request, HttpStatus} from '@nestjs/common';
import {UserDto} from '../users/dtos/user.dto';
import {AuthService} from './auth.service';
import {HttpResponse} from '../globalTypes';
import {LocalAuthGuard} from './local-auth.guard';
import {LoginReturnInterface} from './interfaces/login.payload';
import {ForgetPasswordDto} from "./forgot-password/dtos/forget.password.dto";
import {ForgotPasswordService} from "./forgot-password/forgot-password.service";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private forgetPasswordService: ForgotPasswordService) {}

  /**
   * create user
   * @param body
   */
  @Post('signup')
  async create(@Body() body: UserDto): Promise<HttpResponse<null>> {
    await this.authService.create(body);
    return {
      data: null,
      errors: [],
      message: 'User was created successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  /**
   * user login
   * @param req
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<HttpResponse<LoginReturnInterface>> {
    const token: LoginReturnInterface = await this.authService.login(req.user);
    return {
      data: token,
      success: true,
      status: HttpStatus.OK,
    };
  }

  @Post('forget-password')
  async forgetPassword(@Body() body: ForgetPasswordDto): Promise<HttpResponse<string>> {
    await this.forgetPasswordService.create(body);

    return {
      data: 'success',
      success: true,
      status: HttpStatus.OK
    }

  }
}
