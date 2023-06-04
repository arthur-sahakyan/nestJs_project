import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ForgetPasswordRepository} from '../../repositories/base/forget.password.repository';
import {ForgetPasswordDto} from './dtos/forget.password.dto';
import {UserRepository} from '../../repositories/base/user.repository';
import {ForgetPasswordDocument} from './schemas/forget.password.schema';
import {ConfigService} from "@nestjs/config";
import {createHash} from '../../utils/create.hash';
import {checkTimeDiff, createDateTimeByMinutes} from "../../utils/date-time";
import {BLOCK_MINUTES, EXPIRES_MINUTES, TIME_FORMAT} from '../../constants/auth.constants';
import {CreatePasswordDto} from './dtos/create.password.dto'
import * as moment from 'moment';

@Injectable()
export class ForgotPasswordService {
    constructor(
        private readonly forgetPasswordRepository: ForgetPasswordRepository,
        private readonly usersRepository: UserRepository,
        private configService: ConfigService
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
                    message: 'The User is not found',
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
                expirationTime
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
                    {success: false, message: 'You are blocked try later'},
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
                    message: "You've·reached·maximum·number·of·password·reset·link·requests.Try·later",
                    success: true,
                },
                HttpStatus.BAD_REQUEST,
            );
        } else {
            const expirationTime = createDateTimeByMinutes(EXPIRES_MINUTES);
            console.log(expirationTime)
            update = {
                token,
                count: forgetDocument['count'] + 1,
                expirationTime
            };
            await this.forgetPasswordRepository.update(forgetDocument._id, update);
        }
        return true;
    }

    async confirmForgetPasswordToken(params: {}): Promise<string | never> {

        const existsForgetDocument = await this.forgetPasswordRepository.findOneByQuery({token: params[0]});


        console.log(existsForgetDocument)
        if (!existsForgetDocument) {
            throw new HttpException({
                    message: "Your token is not found send the request again",
                    success: false
                },
                HttpStatus.NOT_FOUND
            );
        } else if (params['email'] !== existsForgetDocument.email) {
            throw new HttpException({
                message: 'Invalid token',
                success: false
            }, HttpStatus.BAD_REQUEST);
        }

        const diff = checkTimeDiff(existsForgetDocument.expirationTime);
        if (diff <= 0) {
            throw new HttpException(
                {success: false, message: 'your token has expired'},
                HttpStatus.BAD_REQUEST,
            );
        }
        return `${this.configService.get('FRONT_END_BASE_URL')}/createNewPassword/?email=${existsForgetDocument.email}`
    }

    async createNewPassword(body: CreatePasswordDto): Promise<boolean | never> {
        const {password, email} = body;
        const user = await this.usersRepository.findOneByQuery({email});

        if (!user) {
            throw new HttpException(
                {success: false, message: 'The user is not found'},
                HttpStatus.NOT_FOUND,
            );
        }
        const newPassword = await createHash(password);

        await this.usersRepository.update(user._id, {password: newPassword});

        return true;
    }
}
