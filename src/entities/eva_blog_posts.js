import { utils, DI } from 'evaengine';
import schema from './schemas/eva_blog_posts';

module.exports = function define(sequelize, DataTypes) {
  const { columns, table } = schema(DataTypes);
  const BlogPosts = sequelize.define('BlogPosts', utils.merge(columns, {}), utils.merge(table, {
    classMethods: {
      associate: (entities) => {
        BlogPosts.hasOne(entities.BlogTexts, {
          as: 'text',
          foreignKey: 'postId'
        });
        BlogPosts.hasMany(entities.BlogTagsPosts, {
          as: 'tagsPosts',
          foreignKey: 'postId'
        });
        BlogPosts.belongsToMany(entities.BlogTags, {
          as: 'tags',
          through: {
            model: entities.BlogTagsPosts,
            unique: false
          },
          constraints: false,
          foreignKey: 'postId',
          otherKey: 'tagId'
        });
      }
    }
  }));

  BlogPosts.beforeCreate((entity) => {
    Object.assign(entity, { createdAt: DI.get('now').getTimestamp() });
    Object.assign(entity, { updatedAt: DI.get('now').getTimestamp() });
  });
  BlogPosts.beforeUpdate((entity) => {
    Object.assign(entity, { updatedAt: DI.get('now').getTimestamp() });
  });
  return BlogPosts;
};
