import { registerAs } from '@nestjs/config';
import * as process from "process";

export default registerAs('app', () => ({
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    port: process.env.PORT,
    emailUsername: process.env.EMAIL_USERNAME,
    emailPassword: process.env.EMAIL_PASSWORD,
    salt: +process.env.SALT
}));

