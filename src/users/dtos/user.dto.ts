import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsAlpha,
  IsNumber,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import {Role} from '../../enums/role.enum';
import {PasswordMatch} from '../../customDecorators/password.match.decorator';
import { textReplacer } from "../../utils/text.replacer";
import { tooShort, twoItemsMustMatch } from "../../constants/messages.constants";

export class UserDto {
  @IsNotEmpty()
  @IsAlpha('en-US')
  @MinLength(2, {
    message: textReplacer(tooShort, {item: 'name'}),
  })
  name: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: textReplacer(tooShort, {item: 'surname'}),
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
    message: textReplacer(tooShort, {item: 'password'}),
  })
  password: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: textReplacer(tooShort, {item: 'confirm password'}),
  })
  @PasswordMatch('password', {
    message: textReplacer(twoItemsMustMatch, {
      item1: 'confirm password',
      item2: 'password',
    }),
  })
  confirm_password: string;

  @IsEnum(Role)
  roleType: Role;
}
