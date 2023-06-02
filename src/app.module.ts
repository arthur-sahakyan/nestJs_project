import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import * as process from "process";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`, // Use the correct variable name from the .env file
      }),
    }),
    UsersModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
