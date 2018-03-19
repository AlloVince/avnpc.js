import { Command, DI } from 'evaengine';
import fs from 'fs';
import mkdirp from 'mkdirp';
import BlogPost from '../models/blog_post';
import entities from '../entities';

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
        await blogModel.syncHexo(post.id);
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
        const { filename, content, year } = await blogModel.exportToHexo(post.id);
        mkdirp.sync(`${root}/${year}`);
        fs.writeFileSync(`${root}/${year}/${filename}`, content);
        success += 1;
        logger.info('Export blog post No.%s success', post.id);
      } catch (e) {
        logger.error('Export blog post %s failed by ', post.id, e);
        failed += 1;
      }
    }
    return logger.info('Blog posts export finished, %d total, %d success, %d failed', posts.length, success, failed);
  }
}

