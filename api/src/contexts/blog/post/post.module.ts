import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Post } from './domain/post.entity.js';
import { PostRepository } from './infrastructure/persistence/post.repository.js';
import { ListPostsHandler } from './application/queries/list-posts.handler.js';
import { PostsController } from './infrastructure/http/posts.controller.js';

@Module({
  imports: [MikroOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostRepository, ListPostsHandler],
})
export class PostModule {}
