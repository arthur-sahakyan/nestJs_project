import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';
import {PasswordMatch} from '../../../customDecorators/password.match.decorator';
import {textReplacer} from '../../../utils/text.replacer';
import {
  tooShort,
  twoItemsMustMatch,
} from '../../../constants/messages.constants';

export class CreatePasswordDto {
  @IsNotEmpty()
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
}
