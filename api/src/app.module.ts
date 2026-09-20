import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config.js';
import { PostModule } from './contexts/blog/post/post.module.js';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
