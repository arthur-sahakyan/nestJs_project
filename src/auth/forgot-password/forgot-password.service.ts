import { Injectable } from '@nestjs/common';
import {ForgetPasswordDocument} from "./schemas/forget.password.schema";
import {ForgetPasswordRepository} from "../../repositories/base/forget.password.repository";
import {ForgetPasswordDto} from "./dtos/forget.password.dto";
import {UserRepository} from "../../repositories/base/user.repository";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class ForgotPasswordService {
    constructor(
        private readonly forgetPasswordRepository: ForgetPasswordRepository
    ) {}

    async create(data: ForgetPasswordDto): Promise<boolean> {

        const dataForInsert = {
            email: data.email,
            token: 'asas',
            count: 0
        }
        await this.forgetPasswordRepository.create(dataForInsert);
        return  true;
    }
}
