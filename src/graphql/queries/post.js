import DataLoader from 'dataloader';
import { graphql, GraphqlSchema, Types, Connection } from 'graphql-boot';
import { sequelize } from 'evaengine';
import entities from '../../entities';
import BlogPost from '../../models/blog_post';

export const schema = '';

const textDataLoader = new DataLoader(async ids =>
  entities.get('BlogTexts').findAll({
    where: {
      postId: ids
    },
    order: [[sequelize.fn('FIELD', sequelize.col('postId'), ...ids)]]
  }));

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
    text: post => textDataLoader.load(post.id),

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
        type PostListingEdge {
            cursor: String!
            node: Post
        }
        type PostListingConnection {
            totalCount: Int!
            pageInfo: PageInfo!
            edges: [PostListingEdge]
            nodes: [Post]
        }
        extend type Query {
            postListings(first: Int, after:String, last:Int, before: String, order:SortOrder): PostListingConnection
        }
    `)
    postListings: async (source, args) => {
      const {
        first, after, last, before, order = {
          field: 'id',
          direction: 'ASC'
        }
      } = args;

      const connection = new Connection({
        first,
        after,
        last,
        before,
        primaryKey: 'id',
        order: (new Types.SortOrder(order)).toString()
      });

      const query = connection.getSqlQuery();
      const { count, rows } = await entities.get('BlogPosts').findAndCountAll(query);
      connection.setTotalCount(count);
      connection.setNodes(rows);
      return connection.toJSON();
    }
  }
};

