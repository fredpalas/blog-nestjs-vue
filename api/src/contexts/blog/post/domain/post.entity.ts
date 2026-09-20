import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'posts' })
export class Post {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ unique: true })
  slug!: string;

  @Property()
  author!: string;

  @Property({ fieldName: 'author_id', type: 'uuid' })
  authorId!: string;

  @Property({ fieldName: 'show_title' })
  showTitle!: boolean;

  @Property()
  status!: string;

  @Property({ fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ fieldName: 'updated_at' })
  updatedAt!: Date;
}
