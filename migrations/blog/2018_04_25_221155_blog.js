/* eslint-disable object-shorthand, func-names, no-param-reassign */
const fs = require('fs');

module.exports = {
  /**
   * Run the migrations.
   * @param {Builder} schema
   */
  up: function (schema) {
    schema.raw(fs.readFileSync(`${__dirname}/blog_init.sql`).toString('utf-8'));
  },

  /**
   * Reverse the migrations.
   * @param {Builder} schema
   */
  down: function (schema) {
  }
};
