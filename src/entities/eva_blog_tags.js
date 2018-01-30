import { utils } from 'evaengine';
import schema from './schemas/eva_blog_tags';

module.exports = function define(sequelize, DataTypes) {
  const { columns, table } = schema(DataTypes);
  const BlogTags = sequelize.define('BlogTags', utils.merge(columns, {}), utils.merge(table, {
    classMethods: {
      associate: (entities) => {
        BlogTags.belongsToMany(entities.BlogPosts, {
          as: 'tags',
          through: {
            model: entities.BlogTagsPosts,
            unique: false
          },
          constraints: false,
          foreignKey: 'tagId'
        });
      }
    }
  }));
  return BlogTags;
};
