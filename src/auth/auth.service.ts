import {Model} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import {User, UserDocument} from '../users/schemas/user.schema';
import {UserDto} from '../users/dtos/userDto';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {UserInterface} from '../users/interfaces/user.interface';
import {
  LoginPayloadInterface,
  LoginReturnInterface,
} from './interfaces/login.payload';
const salt: number = 10;

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
    private userModel: Model<UserDocument>,
        private usersService: UsersService,
        private jwtService: JwtService
    ) {
    }

    /**
     * create new user
   * @param createUserDto
     */
    async create(createUserDto: UserDto): Promise<User> | never {
        const existUser = await this.userModel.findOne({email: createUserDto.email});
        if (existUser) throw new HttpException('This user is already exist', HttpStatus.CONFLICT);
        const hash: string =  await bcrypt.hash(createUserDto.password, salt);

        createUserDto.password = hash;
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    /**
     * validate user by local passport strategy
     * @param username
     * @param pass
     */
    async validateUser(username: string, pass: string): Promise<UserInterface> {
        const user: UserInterface = await this.usersService.findByQuery({email: username});

        if (user) {
            const isMatch: boolean = await bcrypt.compare(pass, user.password);
            if (!isMatch) return null;
            return user;
        }
        return null;
    }

    /**
     * user login
     * @param user
     */
    async login(user: UserInterface): Promise<LoginReturnInterface> {
        const payload: LoginPayloadInterface = {username: user.email, sub: user._id};
        return {
      access_token: this.jwtService.sign(payload),
        };
    }

}
