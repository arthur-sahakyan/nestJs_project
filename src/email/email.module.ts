import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {EmailService} from './email.service';
import * as nodemailer from 'nodemailer';
import * as process from 'process';
import {isRequired} from '../constants/messages.constants';
import {textReplacer} from '../utils/text.replacer';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailService,
    {
      provide: 'MAILER_TRANSPORTER',
      useFactory: async (configService: ConfigService) => {
        const emailService = configService.get('EMAIL_SERVICE');
        const emailUsername = configService.get('EMAIL_USERNAME');
        const emailPassword = configService.get('EMAIL_PASSWORD');
        console.log(emailPassword);

        if (!emailService || !emailUsername || !emailPassword) {
          throw new Error(
            textReplacer(isRequired, {item: 'email configuration'}),
          );
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          secure: true,
          port: 465,
          auth: {
            user: emailUsername,
            pass: emailPassword,
          },
        });
        return transporter;
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
