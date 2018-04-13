import DataLoader from 'dataloader';
import { sequelize, utils } from 'evaengine';
import gql from 'graphql-tag';
import entities from '../../entities';
import BlogPost from '../../models/blog_post';

export const schema = gql`  
type Posts {
    pagination: Pagination
    results: [Post]
}
extend type Query {
    posts(offset: Int, limit: Int, order: String): Posts
}
extend type Post {
    tags: [Tag]
    text: Text
    prev: Post
    next: Post
}
`;

export const resolver = {
  Post: {
    tags: async (post) => {
      const rels = await entities.get('BlogTagsPosts').findAll({ where: { postId: post.id } });
      if (!rels || rels.length < 1) {
        return [];
      }
      return entities.get('BlogTags').findAll({ where: { id: rels.map(r => r.tagId) } });
    },
    text: post => (
      new DataLoader(async ids =>
        entities.get('BlogTexts').findAll({
          where: {
            postId: ids
          },
          order: [[sequelize.fn('FIELD', sequelize.col('postId'), ...ids)]]
        }))
    ).load(post.id),
    prev: async post => BlogPost.getPrev(post),
    next: async post => BlogPost.getNext(post)
  },
  Query: {
    posts: async (source, args) => {
      const { offset, limit = 10 } = args;
      let { order } = args;
      const orderScaffold = new utils.apiScaffold.OrderScaffold();
      orderScaffold.setFields([
        'createdAt'
      ], 'createdAt', 'DESC');
      order = orderScaffold.getOrderByQuery(order);

      const { rows, count } = await entities.get('BlogPosts').findAndCountAll({
        offset,
        limit,
        order
      });
      return {
        pagination: {
          total: count,
          offset,
          limit
        },
        results: rows
      };
    }
  }
};

