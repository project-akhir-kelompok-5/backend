import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  console.log('Database Host:', process.env.DB_USERNAME);
  
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(2009);
}
bootstrap()
