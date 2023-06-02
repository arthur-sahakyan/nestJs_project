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

    async findAndUpdate(data: Partial<ForgetPassword>, update: Partial<ForgetPassword>): Promise<ForgetPasswordDocument> {
        const {email, token} = data;
        const filter = {email};


        const defaultUpdate = {
            $inc: {count: 1},
            $setOnInsert: {email, count: 0},
            $set: {token},
        };
        const options = {upsert: true, new: true, setDefaultsOnInsert: true};

        const finalUpdate = {...defaultUpdate, ...update};

        return this.forgetPasswordDocumentModel.findOneAndUpdate(filter, finalUpdate, options).exec();
    }

}
