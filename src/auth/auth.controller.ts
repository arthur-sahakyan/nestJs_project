import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {UserDto} from '../users/dtos/user.dto';
import {AuthService} from './auth.service';
import {HttpResponse} from '../globalTypes';
import {LocalAuthGuard} from '../guards/local-auth.guard';
import {LoginReturnInterface} from './interfaces/login.payload';
import {ForgetPasswordDto} from './forgot-password/dtos/forget.password.dto';
import {ForgotPasswordService} from './forgot-password/forgot-password.service';
import {CreatePasswordDto} from './forgot-password/dtos/create.password.dto';
import {textReplacer} from '../utils/text.replacer';
import {
  emailHasSent,
  updated,
  uploadedSuccessfully,
} from '../constants/messages.constants';
import {FileInterceptor} from '@nestjs/platform-express';
import {S3Service} from '../aws/s3.service';
import {UserInterface} from '../users/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private forgetPasswordService: ForgotPasswordService,
    private s3Service: S3Service
  ) {
  }

  /**
   * create user
   * @param body
   */
  @Post('signup')
  async create(@Body() body: UserDto): Promise<HttpResponse<null>> {
    await this.authService.create(body);
    return {
      data: null,
      message: textReplacer(emailHasSent, {item: 'verification'}),
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

  @Get('verify/:token')
  async verifyUserAccount(
    @Param('token') token: string,
  ): Promise<HttpResponse<string>> {
    await this.authService.verifyAccount(token);
    return {
      data: 'success',
      message: 'ok',
      success: true,
      status: HttpStatus.OK,
    };
  }

  /**
   * get reset password request
   * @param body
   */
  @Post('forget-password')
  async forgetPassword(
    @Body() body: ForgetPasswordDto,
  ): Promise<HttpResponse<string>> {
    const message = await this.forgetPasswordService.create(body);

    return {
      data: 'success',
      message,
      success: true,
      status: HttpStatus.OK,
    };
  }

  /**
   * confirm reset password link and verify
   * @param params
   */
  @Get('forget-password/confirm/:email/**')
  async confirmForgetPassword(
    @Param() params: { [key: string]: string },
  ): Promise<HttpResponse<string>> {
    const url = await this.forgetPasswordService.confirmForgetPasswordToken(
      params,
    );
    return {
      data: url,
      status: 200,
      success: true,
      message: 'Success',
    };
  }

  /**
   * create new password
   * @param body
   */
  @Patch('forget-password/create-password')
  async createNewPassword(
    @Body() body: CreatePasswordDto,
  ): Promise<HttpResponse<null>> {
    await this.forgetPasswordService.createNewPassword(body);
    return {
      data: null,
      status: 200,
      success: true,
      message: textReplacer(updated, {item: 'password'}),
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpResponse<UserInterface>> {
    const {url} = await this.s3Service.fileUpload(file);
    const data = await this.authService.updateUserAvatar(
      '64f1f17593d403214a93dfdb', // todo add req.user
      url,
    );
    return {
      data: data,
      status: 200,
      success: true,
      message: textReplacer(uploadedSuccessfully, {item: 'User avatar'}),
    };


  }

}
