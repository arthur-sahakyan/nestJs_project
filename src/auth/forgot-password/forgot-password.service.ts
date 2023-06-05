import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
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
  emailHasSent,
} from '../../constants/messages.constants';
import {textReplacer} from '../../utils/text.replacer';
import {CreatePasswordDto} from './dtos/create.password.dto';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly forgetPasswordRepository: ForgetPasswordRepository,
    private readonly usersRepository: UserRepository,
    private configService: ConfigService,
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
    return `${this.configService.get(
      'FRONT_END_BASE_URL',
    )}/createNewPassword/?email=${existsForgetDocument.email}`;
  }

  async createNewPassword(body: CreatePasswordDto): Promise<boolean | never> {
    const {password, email} = body;
    const user = await this.usersRepository.findOneByQuery({email});

    if (!user) {
      throw new HttpException(
        {success: false, message: textReplacer(notFound, {item: 'user'})},
        HttpStatus.NOT_FOUND,
      );
    }
    const newPassword = await createHash(password);

    await this.usersRepository.update(user._id, {password: newPassword});

    return true;
  }
}
