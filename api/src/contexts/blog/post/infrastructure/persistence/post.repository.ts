import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Post } from '../../domain/post.entity.js';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repo: EntityRepository<Post>,
  ) {}

  async findPublished(options: {
    limit: number;
    offset: number;
    sort: string;
    order: 'asc' | 'desc';
  }): Promise<[Post[], number]> {
    return this.repo.findAndCount(
      { status: 'published' },
      {
        limit: options.limit,
        offset: options.offset,
        orderBy: { [options.sort]: options.order } as any,
      },
    );
  }
}
