import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ForgetPasswordRepository} from '../../repositories/base/forget.password.repository';
import {ForgetPasswordDto} from './dtos/forget.password.dto';
import {UserRepository} from '../../repositories/base/user.repository';
import {ForgetPasswordDocument} from './schemas/forget.password.schema';
import {createHash} from '../../utils/create.hash';
import {BLOCK_MINUTES, TIME_FORMAT} from '../../constants/auth.constants';
import moment from 'moment';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly forgetPasswordRepository: ForgetPasswordRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  /**
   * Create or update reset password data
   * @param data
   */

  async create(data: ForgetPasswordDto): Promise<string> {
    const existsUser = await this.usersRepository.findByQuery({
      email: data.email,
    });

    if (!existsUser[0])
      throw new HttpException(
        {
          success: false,
          message: 'The User is not found',
        },
        HttpStatus.NOT_FOUND,
      );
    const token = await createHash(data.email + existsUser[0]._id);
    const existsForgetDocuments =
      await this.forgetPasswordRepository.findByQuery({
        email: data.email,
      });
    const [existsForgetDocument] = existsForgetDocuments;

    if (existsForgetDocument) {
      await this.isCanSendResetPasswordEmail(existsForgetDocument, token);
    } else {
      await this.forgetPasswordRepository.create({
        email: data.email,
        token,
        count: 1,
      });
    }
    return 'The message was sent successfully check your email';
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
      const diff = moment
        .utc(forgetDocument.time, TIME_FORMAT)
        .diff(moment.utc(), 'minutes');

      if (diff <= 0) {
        update = {
          count: 0,
          block: false,
        };
        await this.forgetPasswordRepository.update(forgetDocument._id, update);
        return true;
      } else {
        throw new HttpException(
          {success: false, message: 'You are blocked try later'},
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const currentCount = forgetDocument['count'];

    if (currentCount >= 5) {
      const dateTime = moment
        .utc()
        .add(BLOCK_MINUTES, 'minutes')
        .format(TIME_FORMAT);
      update = {
        block: true,
        time: dateTime,
      };
      await this.forgetPasswordRepository.update(forgetDocument._id, update);

      throw new HttpException(
        {
          message: "You've·reached·maximum·number·of·password·reset·link·requests.Try·later",
          success: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      update = {
        token,
        count: forgetDocument['count'] + 1,
      };
      await this.forgetPasswordRepository.update(forgetDocument._id, update);
    }
    return true;
  }
}
