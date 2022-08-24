import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {User, UserDocument} from "./schemas/user.schema";
import {UserInterface} from "./interfaces/user.interface";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}


    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findOne({_id: id}).lean();
    }
    async delete(id: string): Promise<string> {
        await this.userModel.deleteOne({_id: id});
        return 'User was deleted successfully';
    }

    async update(id: string, data: UserInterface): Promise<User | null> {
        return this.userModel.findOneAndUpdate({_id: id}, {$set: data}, {new: true});
    }
    async findByQuery<T>(filter: T): Promise<User | null> {
        return this.userModel.findOne(filter).lean();
    }
}
