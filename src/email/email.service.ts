import {Injectable, Inject} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as process from 'process';

@Injectable()
export class EmailService {
  constructor(
    @Inject('MAILER_TRANSPORTER') private transporter: nodemailer.Transporter,
  ) {}

  async sendVerificationEmail({
    email,
    text,
    subject,
  }: {
    [key: string]: string;
  }): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
