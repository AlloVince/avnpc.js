import fs from 'fs';
import path from 'path';
import glob from 'glob';

const schemas = [];
export default class {
  static getSchemas() {
    if (schemas.length > 0) {
      return schemas;
    }
    const schemaFiles = glob.sync(path.normalize(`${__dirname}/../*/**/*.graphqls`));
    schemaFiles.forEach((file) => {
      schemas.push(fs.readFileSync(file).toString());
    });
    return schemas;
  }
}
