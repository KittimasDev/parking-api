import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/api/images',
      serveStaticOptions: { index: false },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_PUBLIC_URL,
      port: parseInt(process.env.DATABASE_PUBLIC_URL_PORT!, 10),
      username: process.env.PGUSER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [join(process.cwd(), 'dist/**/*.entity.js')],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
