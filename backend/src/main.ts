import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';
  app.enableCors({ origin: corsOrigin, credentials: true });
    app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
  console.log('NestJS server listening on http://localhost:3000');
}

void bootstrap();
