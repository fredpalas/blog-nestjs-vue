import { Migration } from '@mikro-orm/migrations';

export class Migration20260920153640 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "posts" ("id" uuid not null, "title" varchar(255) not null, "content" text not null, "slug" varchar(255) not null, "author" varchar(255) not null, "author_id" uuid not null, "show_title" boolean not null, "status" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "posts_pkey" primary key ("id"));`);
    this.addSql(`alter table "posts" add constraint "posts_slug_unique" unique ("slug");`);
  }

}
