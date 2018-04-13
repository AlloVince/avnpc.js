import fs from 'fs';
import path from 'path';
import glob from 'glob';

export default class GraphqlBoot {
  static getDefaultSchema() {
    return `type Query {
  health: Boolean!
}`;
  }

  static getDefaultResolver() {
    return {
      Query: { health: () => true }
    };
  }

  static getSchemas() {
    const schemas = [GraphqlBoot.getDefaultSchema()];
    const schemaFiles = glob.sync(path.normalize(`${__dirname}/../*/**/*.graphqls`));
    schemaFiles.forEach((file) => {
      schemas.push(fs.readFileSync(file).toString());
    });
    return schemas;
  }
}
