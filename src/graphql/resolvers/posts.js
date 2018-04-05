import entities from '../../entities';

export const schema = `
type PostFeed {
    pagination: Pagination
    results: [Post]
}
type Query {
    posts(offset: Int, limit: Int, order: String): PostFeed
}
`;

export const resolver = {
  posts: async (group, { offset, limit = 10 }) => {
    const { rows, count } = await entities.get('BlogPosts').findAndCountAll({ offset, limit });
    return {
      pagination: {
        total: count,
        offset,
        limit
      },
      results: rows
    };
  }
};

