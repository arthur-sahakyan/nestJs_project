import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';
import {ForgetPasswordRepository} from '../../repositories/base/forget.password.repository';
import {ForgetPasswordDto} from './dtos/forget.password.dto';
import {UserRepository} from '../../repositories/base/user.repository';
import {ForgetPasswordDocument} from './schemas/forget.password.schema';
import {ConfigService} from '@nestjs/config';
import {createHash} from '../../utils/create.hash';
import {checkTimeDiff, createDateTimeByMinutes} from '../../utils/date-time';
import {
  BLOCK_MINUTES,
  EXPIRES_MINUTES,
  TIME_FORMAT,
} from '../../constants/auth.constants';
import {
  notFound,
  inValid,
  expired,
  maxLimitForResetPassword,
  blocked,
  emailHasSent, resetPasswordSubject,
} from '../../constants/messages.constants';
import {textReplacer} from '../../utils/text.replacer';
import {CreatePasswordDto} from './dtos/create.password.dto';
import {EmailService} from "../../email/email.service";

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly forgetPasswordRepository: ForgetPasswordRepository,
    private readonly usersRepository: UserRepository,
    private configService: ConfigService,
    private emailService: EmailService
  ) {}

  /**
   * Create or update reset password data
   * @param data
   */

  async create(data: ForgetPasswordDto): Promise<string> {
    const existsUser = await this.usersRepository.findOneByQuery({
      email: data.email,
    });

    if (!existsUser)
      throw new HttpException(
        {
          success: false,
          message: textReplacer(notFound, {item: 'user'}),
        },
        HttpStatus.NOT_FOUND,
      );
    const token = await createHash(data.email + existsUser._id);
    const existsForgetDocument =
      await this.forgetPasswordRepository.findOneByQuery({
        email: data.email,
      });

    if (existsForgetDocument) {
      await this.isCanSendResetPasswordEmail(existsForgetDocument, token);
    } else {
      const expirationTime = createDateTimeByMinutes(EXPIRES_MINUTES);
      await this.forgetPasswordRepository.create({
        email: data.email,
        token,
        count: 1,
        expirationTime,
      });
    }

    const forgetPasswordUrl = `${this.configService.get(
        'BASE_URL',
    )}/auth/forget-password/confirm/${data.email}/${token}`;
    const templatePath = path.join(path.resolve(), 'src', 'templates', 'forgot.password.ejs');
    const template = await new Promise((res, rej) => {
      fs.readFile(templatePath, 'utf8', function(err, data){
        if (err) rej(textReplacer(inValid, {item: 'path'}))
        res(data)
      });
    });

    const html = ejs.render(template, {email: data.email, forgetPasswordUrl})

    await this.emailService.sendEmail({
      email: data.email,
      subject: resetPasswordSubject,
      html,
    });

    return textReplacer(emailHasSent, {item: 'reset password'});
  }

  /**
   * Check can user send reset password email
   * @param forgetDocument
   * @param token
   */
  async isCanSendResetPasswordEmail(
    forgetDocument: ForgetPasswordDocument,
    token: string,
  ): Promise<boolean | never> {
    let update: Partial<ForgetPasswordDocument>;

    if (forgetDocument.block) {
      const diff = checkTimeDiff(forgetDocument.blockTime);

      if (diff <= 0) {
        update = {
          count: 0,
          block: false,
        };
        await this.forgetPasswordRepository.update(forgetDocument._id, update);
        return true;
      } else {
        throw new HttpException(
          {success: false, message: blocked},
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const currentCount = forgetDocument['count'];

    if (currentCount >= 5) {
      const dateTime = createDateTimeByMinutes(BLOCK_MINUTES);
      update = {
        block: true,
        blockTime: dateTime,
      };
      await this.forgetPasswordRepository.update(forgetDocument._id, update);

      throw new HttpException(
        {
          message: maxLimitForResetPassword,
          success: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const expirationTime = createDateTimeByMinutes(EXPIRES_MINUTES);
      console.log(expirationTime);
      update = {
        token,
        count: forgetDocument['count'] + 1,
        expirationTime,
      };
      await this.forgetPasswordRepository.update(forgetDocument._id, update);
    }
    return true;
  }

  async confirmForgetPasswordToken(params: {
    [key: string]: string;
  }): Promise<string | never> {
    const existsForgetDocument =
      await this.forgetPasswordRepository.findOneByQuery({token: params[0]});

    console.log(existsForgetDocument);
    if (!existsForgetDocument) {
      throw new HttpException(
        {
          message: textReplacer(inValid, {item: 'token'}),
          success: false,
        },
        HttpStatus.NOT_FOUND,
      );
    } else if (params['email'] !== existsForgetDocument.email) {
      throw new HttpException(
        {
          message: textReplacer(inValid, {item: 'token'}),
          success: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const diff = checkTimeDiff(existsForgetDocument.expirationTime);
    if (diff <= 0) {
      throw new HttpException(
        {success: false, message: textReplacer(expired, {item: 'token'})},
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.forgetPasswordRepository.delete(existsForgetDocument.id);
    return `${this.configService.get(
      'FRONT_END_BASE_URL',
    )}/createNewPassword/?email=${existsForgetDocument.email}`;
  }

  async createNewPassword(body: CreatePasswordDto): Promise<boolean | never> {
    const {password, email} = body;
    const user = await this.usersRepository.findOneByQuery({email});
    const existResetPasswordDocument = await this.forgetPasswordRepository.findOneByQuery({
      email
    });

    if (!user) {
      throw new HttpException(
        {success: false, message: textReplacer(notFound, {item: 'user'})},
        HttpStatus.NOT_FOUND,
      );
    }

    if (!existResetPasswordDocument) {
      throw new HttpException(
          {success: false, message: textReplacer(notFound, {item: 'reset password request'})},
          HttpStatus.NOT_FOUND,
      );
    }

    const newPassword = await createHash(password);

    await this.usersRepository.update(user._id, {password: newPassword});

    return true;
  }
}
