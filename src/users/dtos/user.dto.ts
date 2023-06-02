import { IsEmail, IsNotEmpty, IsEnum, IsAlpha, IsNumber, MaxLength, MinLength, Matches,  } from 'class-validator';
import { Role } from "../../enums/role.enum";
import { PasswordMatch } from '../../customDecorators/password.match.decorator'

export class UserDto {
  @IsNotEmpty()
  @IsAlpha('en-US')
  @MinLength(2, {
    message: 'Name is too short',
  })
  name: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'Surname is too short',
  })
  @IsAlpha('en-US')
  surname: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'Password is too short',
  })
  password: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'Confirm Password is too short',
  })
  @PasswordMatch('password', {
    message: 'Confirm Password must match the password',
  })
  confirm_password: string;

  @IsEnum(Role)
  roleType: Role;
}
