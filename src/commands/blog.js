import { Command, DI } from 'evaengine';
import moment from 'moment-timezone';
import BlogPost from '../models/blog_post';
import HexoManager from '../models/hexo_manager';
import entities from '../entities';


export class BlogExportHexo extends Command {
  static getName() {
    return 'blog:export:hexo';
  }

  static getDescription() {
    return 'Export all posts to hexo source folder';
  }

  static getSpec() {
    return {
      id: {
        required: false
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const {
      id
    } = this.getOptions();

    const posts = id ? [{ id }] : await entities.get('BlogPosts').findAll({
      attributes: ['id'],
      where: {
        contentStorage: 'remote'
      },
      order: 'id DESC'
    });
    const blogModel = new BlogPost();
    let success = 0;
    let failed = 0;
    const root = DI.get('config').get('blog.hexoSourcePath');
    for (const post of posts) {
      try {
        const path = await HexoManager
          .exportPostToLocalHexoFile(await blogModel.get(post.id), root);
        success += 1;
        logger.info('Export blog post No.%s success to %s', post.id, path);
      } catch (e) {
        logger.error('Export blog post %s failed by ', post.id, e);
        failed += 1;
      }
    }
    return logger.info('Blog posts export finished, %d total, %d success, %d failed', posts.length, success, failed);
  }
}


export class BlogSync extends Command {
  static getName() {
    return 'blog:sync:hexo';
  }

  static getDescription() {
    return 'Sync remote hexo repo content to blog post';
  }

  static getSpec() {
    return {
      id: {
        required: false
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const {
      id
    } = this.getOptions();
    const posts = id ? await entities.get('BlogPosts').findAll({
      where: {
        id,
        contentStorage: 'remote'
      },
      order: 'id DESC'
    }) : await entities.get('BlogPosts').findAll({
      where: {
        contentStorage: 'remote'
      },
      order: 'id DESC'
    });
    let success = 0;
    let failed = 0;
    for (const post of posts) {
      try {
        await HexoManager.syncHexoFileFromGithub(post);
        success += 1;
        logger.info('Sync blog post No.%s success', post.id);
      } catch (e) {
        logger.error('Sync blog post %s failed by ', post.id, e);
        failed += 1;
      }
    }
    return logger.info('Blog posts sync finished, %d total, %d success, %d failed', posts.length, success, failed);
  }
}


export class BlogImportHexo extends Command {
  static getName() {
    return 'blog:import:hexo';
  }

  static getDescription() {
    return 'Import recent 1 year posts from a hexo github repo';
  }

  static getSpec() {
    return {
      slug: {
        required: false
      },
      year: {
        required: true
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const {
      year,
      slug
    } = this.getOptions();

    const hexoFileNames = await HexoManager.getHexoFileListFromGithub(year || moment().format('YYYY'), slug);
    if (!hexoFileNames || hexoFileNames.length < 1) {
      return logger.warn('No file found in github for year %s', year);
    }

    let success = 0;
    let failed = 0;
    for (const hexoFileName of hexoFileNames) {
      try {
        await HexoManager.importHexoFileFromGithub(hexoFileName);
        success += 1;
        logger.info('Import blog post %s success', hexoFileName.name);
      } catch (e) {
        logger.error('Import blog post %s failed by ', hexoFileName.name, e);
        failed += 1;
      }
    }
    return logger.info('Blog posts import finished, %d total, %d success, %d failed', hexoFileNames.length, success, failed);
  }
}
