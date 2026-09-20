import { Controller, Get, Query } from '@nestjs/common';
import { ListPostsHandler } from '../../application/queries/list-posts.handler.js';
import { ListPostsQuery } from '../../application/queries/list-posts.query.js';
import { PostListDto } from '../../application/dto/post-list.dto.js';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly handler: ListPostsHandler) {}

  @Get()
  async list(
    @Query('limit') limit = '10',
    @Query('offset') offset = '0',
    @Query('sort') sort = 'createdAt',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ): Promise<PostListDto> {
    const query = new ListPostsQuery(
      parseInt(limit),
      parseInt(offset),
      sort,
      order,
    );

    return this.handler.execute(query);
  }
}
