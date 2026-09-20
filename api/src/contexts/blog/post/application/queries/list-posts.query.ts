export class ListPostsQuery {
  constructor(
    public readonly limit: number = 10,
    public readonly offset: number = 0,
    public readonly sort: string = 'createdAt',
    public readonly order: 'asc' | 'desc' = 'asc',
  ) {}
}
