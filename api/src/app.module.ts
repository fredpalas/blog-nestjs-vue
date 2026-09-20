import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Post } from './contexts/blog/post/domain/post.entity.js';
import { PostModule } from './contexts/blog/post/post.module.js';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      user: process.env.DB_USER ?? 'app',
      password: process.env.DB_PASSWORD ?? '!ChangeMe!',
      dbName: process.env.DB_NAME ?? 'app',
      entities: [Post],
      allowGlobalContext: true,
      pool: {
        min: 1,
        max: 2,
      },
      driverOptions: {
        connection: {
          // Keep connections alive
          keepAlive: true,
          keepAliveInitialDelayMillis: 0,
          pool: {
            min: 1,
            max: 2,
          }
        }
      }
    }),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
