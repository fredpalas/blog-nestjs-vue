import { PostDto } from './post.dto.js';

export interface PostListDto {
  data: PostDto[];
  total: number;
  page: number;
  per_page: number;
}
