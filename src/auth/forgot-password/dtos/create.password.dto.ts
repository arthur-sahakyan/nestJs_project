import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';
import {PasswordMatch} from "../../../customDecorators/password.match.decorator";

export class CreatePasswordDto {
    @IsNotEmpty()
    @IsEmail()

    email: string;
    @IsNotEmpty()
    @MinLength(6, {
        message: 'password is too short',
    })
    password: string;

    @IsNotEmpty()
    @MinLength(6, {
        message: 'confirm Password is too short',
    })
    @PasswordMatch('password', {
        message: 'confirm Password must match the password',
    })
    confirm_password: string;
}
