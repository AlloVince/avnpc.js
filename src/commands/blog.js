import { Command, DI } from 'evaengine';
import BlogPost from '../models/blog_post';
import entities from '../entities';

export default class BlogSync extends Command {
  static getName() {
    return 'blog:sync';
  }

  static getDescription() {
    return 'Sync remote repo content to blog post';
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
        blogModel.syncContent(post.id);
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

