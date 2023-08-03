import {registerAs} from '@nestjs/config';
import * as process from 'process';

export default registerAs('app', () => ({
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  port: +process.env.PORT,
  emailUsername: process.env.EMAIL_USERNAME,
  emailPassword: process.env.EMAIL_PASSWORD,
  salt: +process.env.SALT,
  emailService: process.env.EMAIL_SERVICE,
  frontEndBaseUrl: process.env.FRONT_END_BASE_URL,
  baseUrl: process.env.BASE_URL,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsBucketRegion: process.env.AWS_BUCKET_REGION,
  awsBucketName: process.env.AWS_BUCKET_NAME
}));
