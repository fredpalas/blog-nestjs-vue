import { Injectable } from '@nestjs/common';
import { Post } from '../../domain/post.entity.js';
import { PostRepository } from '../../infrastructure/persistence/post.repository.js';
import { ListPostsQuery } from './list-posts.query.js';
import { PostListDto } from '../dto/post-list.dto.js';
import { PostDto } from '../dto/post.dto.js';

@Injectable()
export class ListPostsHandler {
  constructor(private readonly repository: PostRepository) {}

  async execute(query: ListPostsQuery): Promise<PostListDto> {
    const [posts, total] = await this.repository.findPublished({
      limit: query.limit,
      offset: query.offset,
      sort: query.sort,
      order: query.order,
    });

    const page = Math.floor(query.offset / query.limit) + 1;

    return {
      data: posts.map((post) => this.toDto(post)),
      total,
      page,
      per_page: query.limit,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
  }

  private toDto(post: Post): PostDto {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      author: post.author,
      authorId: post.authorId,
      showTitle: post.showTitle,
      status: post.status,
      createdAt: this.formatDate(post.createdAt),
      updatedAt: this.formatDate(post.updatedAt),
    };
  }
}
