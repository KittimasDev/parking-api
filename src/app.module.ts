import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/api/images',
      serveStaticOptions: { index: false },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DATABASE_PUBLIC_URL');
        const port = parseInt(config.get<string>('DATABASE_PUBLIC_URL_PORT') ?? '5432', 10);
        const username = config.get<string>('PGUSER');
        const password = config.get<string>('POSTGRES_PASSWORD');
        const database = config.get<string>('POSTGRES_DB');

        console.log('===== DATABASE CONFIG =====');
        console.log('DB HOST:', host);
        console.log('DB PORT:', port);
        console.log('DB USER:', username);
        console.log('DB NAME:', database);
        console.log('NODE_ENV:', config.get('NODE_ENV'));
        console.log('SSL ENABLED:', true);
        console.log('===========================');

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          entities: [join(process.cwd(), 'dist/**/*.entity.js')],
          synchronize: true,
          ssl: { rejectUnauthorized: false },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
