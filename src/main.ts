import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('/api');
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
