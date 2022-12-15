import {IsEmail, IsNotEmpty} from 'class-validator';
export class UserDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  surname: string;
  @IsNotEmpty()
  age: number;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
