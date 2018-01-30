import { utils } from 'evaengine';
import marked from 'marked';
import schema from './schemas/eva_blog_texts';

module.exports = function define(sequelize, DataTypes) {
  const { columns, table } = schema(DataTypes);
  const entity = sequelize.define('BlogTexts', utils.merge(columns, {}), utils.merge(table, {
    getterMethods: {
      markedContent: function () { //eslint-disable-line
        return marked(this.content);
      }
    }
  }));
  return entity;
};
