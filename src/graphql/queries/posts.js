import DataLoader from 'dataloader';
import { graphql, GraphqlSchema } from 'graphql-boot/lib';
import { sequelize, utils } from 'evaengine';
import entities from '../../entities';
import BlogPost from '../../models/blog_post';

export const schema = '';

export const resolver = {
  Post: {

    @GraphqlSchema(graphql`
        extend type Post {
            tags: [Tag]
        }
    `)
    tags: async (post) => {
      const rels = await entities.get('BlogTagsPosts').findAll({ where: { postId: post.id } });
      if (!rels || rels.length < 1) {
        return [];
      }
      return entities.get('BlogTags').findAll({ where: { id: rels.map(r => r.tagId) } });
    },

    @GraphqlSchema(graphql`
        extend type Post {
            text: Text
        }
    `)
    text: post => (
      new DataLoader(async ids =>
        entities.get('BlogTexts').findAll({
          where: {
            postId: ids
          },
          order: [[sequelize.fn('FIELD', sequelize.col('postId'), ...ids)]]
        }))
    ).load(post.id),

    @GraphqlSchema(graphql`
        extend type Post {
            prev: Post
        }
    `)
    prev: async post => BlogPost.getPrev(post),


    @GraphqlSchema(graphql`
        extend type Post {
            next: Post
        }
    `)
    next: async post => BlogPost.getNext(post)
  },
  Query: {

    @GraphqlSchema(graphql`
        type Posts {
            pagination: Pagination
            results: [Post]
        }
        extend type Query {
            posts(offset: Int, limit: Int, order: String): Posts
        }
    `)
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

