import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {BaseRepository} from './base.repository';
import {ForgetPassword, ForgetPasswordDocument} from "../../auth/forgot-password/schemas/forget.password.schema";

@Injectable()
export class ForgetPasswordRepository extends BaseRepository<ForgetPasswordDocument> {
    constructor(
        @InjectModel(ForgetPassword.name) private readonly forgetPasswordDocumentModel: Model<ForgetPasswordDocument>,
    ) {
        super(forgetPasswordDocumentModel);
    }

}
