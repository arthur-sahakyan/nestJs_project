import {IsEmail, IsNotEmpty, IsEnum, IsAlpha, IsNumber} from 'class-validator';
import {Role} from "../../enums/role.enum";
export class UserDto {
  @IsNotEmpty()
  @IsAlpha('en-US')
  name: string;
  @IsNotEmpty()
  @IsAlpha('en-US')
  surname: string;
  @IsNotEmpty()
  @IsNumber()
  age: number;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
 @IsEnum(Role)
  roleType: Role;
}
