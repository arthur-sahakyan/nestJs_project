import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {AppModule} from './app.module';
import * as process from "process";


const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
  console.log(`Server connected on port = ${PORT}`);
}
bootstrap();
