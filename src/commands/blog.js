import { Command, DI } from 'evaengine';
import BlogPost from '../models/blog_post';
import HexoManager from '../models/hexo_manager';
import entities from '../entities';


export class SyncDbToFile extends Command {
  static getName() {
    return 'sync:db:file';
  }

  static getDescription() {
    return 'Sync all database posts to a markdown files folder';
  }

  static getSpec() {
    return {
      id: {
        required: false,
        description: 'PostID'
      },
      root: {
        required: false,
        description: 'Markdown file root path'
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const {
      id,
      root = DI.get('config').get('blog.hexo.postsPath')
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


export class SyncGithubToDb extends Command {
  static getName() {
    return 'sync:github:db';
  }

  static getDescription() {
    return 'Sync all github markdown files to database';
  }

  static getSpec() {
    return {
      filename: {
        required: false
      },
      path: {
        required: false
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const {
      owner,
      repo,
      branch,
      postsPath
    } = DI.get('config').get('blog.github');
    const {
      path = postsPath,
      filename = '*'
    } = this.getOptions();

    const uri = `github.com/${owner}/${repo}:${branch}:/${path}`;
    const root = `github.com/${owner}/${repo}:${branch}:`;
    logger.info('Start sync:github:db %s/%s', uri, filename);

    let hexoFiles = [];
    if (filename.startsWith('*')) {
      hexoFiles = await HexoManager.getHexoFileListFromGithub(path, filename);
    } else {
      hexoFiles = [{
        path: [path, filename].join('/')
      }];
    }
    if (!hexoFiles || hexoFiles.length < 1) {
      return logger.warn('No file found github for %s/%s', uri, filename);
    }
    logger.info('Found %s files to sync', hexoFiles.length);

    let success = 0;
    let failed = 0;
    let count = 1;
    for (const hexoFile of hexoFiles) {
      try {
        await HexoManager.importHexoFileFromGithub(hexoFile.path);
        success += 1;
        logger.info('[%s/%s] sync:github:db %s/%s success', count, hexoFiles.length, root, hexoFile.path);
      } catch (e) {
        logger.error('[%s/%s] sync:github:db %s/%s failed by ', count, hexoFiles.length, root, hexoFile.path, e);
        failed += 1;
      } finally {
        count += 1;
      }
    }
    return logger.info('Blog post sync:github:db finished, %d total, %d success, %d failed', hexoFiles.length, success, failed);
  }
}

export class IteratorDb extends Command {
  static getName() {
    return 'iterator:db:sync:github';
  }

  static getDescription() {
    return 'Iterator db to sync from github';
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
