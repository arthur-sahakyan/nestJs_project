import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ForgetPasswordRepository} from "../../repositories/base/forget.password.repository";
import {ForgetPasswordDto} from "./dtos/forget.password.dto";
import {UserRepository} from "../../repositories/base/user.repository";
import {ForgetPasswordDocument} from "./schemas/forget.password.schema";
import {createHash} from "../../utils/create.hash";


@Injectable()
export class ForgotPasswordService {
    private readonly BLOCK_MINUTES = 30;
    private readonly ESTIMATE_MINUTES = 60;
    constructor(
        private readonly forgetPasswordRepository: ForgetPasswordRepository,
        private readonly usersRepository: UserRepository,
    ) {
    }

    /**
     * Create or update reset password data
     * @param data
     */

    async create(data: ForgetPasswordDto): Promise<string> {
        const existsUser = await this.usersRepository.findByQuery({
            email: data.email
        });
        if (!existsUser[0]) throw new HttpException({
            success: false,
            message: 'The User is not found'
        }, HttpStatus.NOT_FOUND);
        const token = await createHash(data.email + existsUser[0]._id);
        const existsForgetDocuments = await this.forgetPasswordRepository.findByQuery({
            email: data.email
        });
        const [existsForgetDocument] = existsForgetDocuments;

        if (existsForgetDocument) {
            await this.isCanSendResetPasswordEmail(existsForgetDocument, token);
        } else {
            await this.forgetPasswordRepository.create({
                email: data.email,
                token,
                count: 1
            });
        }
        return 'The message was sent successfully check your email';
    }

    /**
     * Check can user send reset password email
     * @param forgetDocument
     * @param token
     */
    async isCanSendResetPasswordEmail(forgetDocument: ForgetPasswordDocument, token: string): Promise<boolean | never> {
        let update: Partial<ForgetPasswordDocument>;

        if (forgetDocument.block) {
            if (Date.now() - forgetDocument['time'] > 1000 * 60 * this.BLOCK_MINUTES) {
                update = {
                    count: 0,
                    block: false,
                }
                await this.forgetPasswordRepository.update(forgetDocument._id, update);
                return true
            } else {
                throw new HttpException({success: false, message: 'You are blocked try later'}, HttpStatus.BAD_REQUEST);
            }
        }

        const currentCount = forgetDocument['count'];

        if (currentCount >= 5) {
            update = {
                block: true,
                time: Date.now()
            };
            await this.forgetPasswordRepository.update(forgetDocument._id, update);

            throw new HttpException(
                {message: 'You\'ve reached maximum number of password reset link requests.Try later', success: true},
                HttpStatus.BAD_REQUEST
            );

        } else {
            console.log('here s', forgetDocument)
            update = {
                token,
                count: forgetDocument['count'] + 1
            };
            await this.forgetPasswordRepository.update(forgetDocument._id, update);
        }
        return true;
    }
}
