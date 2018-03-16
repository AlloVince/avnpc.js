import { DI, exceptions, utils } from 'evaengine';
import assert from 'assert';
import moment from 'moment-timezone';
import yaml from 'js-yaml';
import entities from '../entities';

export default class BlogPost {
  async exportToHexo(id) {
    const post = await this.get(id);
    const createAt = moment.unix(post.createdAt).format('YYYY-MM-DD HH:mm:ss');
    const frontMatter = {
      slug: post.slug,
      date: createAt,
      title: post.title,
      id: post.id,
      tags: post.tags.map(t => t.tagName)
    };
    return {
      filename: `${post.slug}.md`,
      year: createAt.split('-')[0],
      month: createAt.split('-')[1],
      day: createAt.split('-')[2],
      content: `---
${yaml.safeDump(frontMatter)}---

${post.text.content}
`
    };
  }

  async syncHexo(id) {
    const [post, text] = await Promise.all([
      entities.get('BlogPosts').findOne({ where: { id } }),
      entities.get('BlogTexts').findOne({ where: { postId: id } })
    ]);
    assert(post && text, 'Blog post or text not exists');

    const rawText = await this.getContentFromGithub(post);
    const { frontMatter: { title, date, tags }, content }
      = this.constructor.hexoParser(rawText, post.id);
    return this.update(id, {
      title,
      createdAt: moment(date).unix(),
      tags: tags.map(tagName => ({ tagName })),
      contentSynchronizedAt: DI.get('now').getTimestamp(),
      text: {
        content
      }
    }, 0);
  }

  static hexoParser(rawText, filename) {
    const splitMark = '---\n';
    if (!rawText.startsWith(splitMark)) {
      throw new SyntaxError(`Unrecognizable hexo file ${filename}`);
    }

    const [, frontMatter, ...contents] = rawText.split(splitMark);
    return {
      frontMatter: yaml.load(frontMatter),
      content: contents.join(splitMark).trimLeft()
    };
  }

  async getContentFromGithub(post) {
    const config = DI.get('config');
    const year = moment.unix(post.createdAt).format('YYYY');
    return DI.get('http_client').request({
      url: `https://raw.githubusercontent.com/${config.get('blog.repo')}/master/source/_posts/${year}/${post.slug}.md`
    });
  }

  async getPrev(post) {
    return entities.get('BlogPosts').findOne({
      where: {
        id: {
          $ne: post.id
        },
        createdAt: {
          $lte: post.createdAt
        }
      },
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
  }

  async getNext(post) {
    return entities.get('BlogPosts').findOne({
      where: {
        id: {
          $ne: post.id
        },
        createdAt: {
          $gte: post.createdAt
        }
      },
      order: [['createdAt', 'ASC'], ['id', 'ASC']]
    });
  }

  async get(idOrslug, deletedAt = 0) {
    const where = /^\d+$/.test(idOrslug) ? { id: idOrslug } : { slug: idOrslug };
    const post = await entities.get('BlogPosts').findOne({
      where: Object.assign(where, {
        deletedAt
      }),
      include: [{
        model: entities.get('BlogTexts'),
        as: 'text'
      }, {
        model: entities.get('BlogTags'),
        as: 'tags'
      }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
    if (!post) {
      throw new exceptions.ResourceNotFoundException('Blog post not exists');
    }
    return post;
  }

  async getWithNeibor(idOrslug, deletedAt = 0) {
    const post = await this.get(idOrslug, deletedAt);
    const [prev, next] = await Promise.all([
      this.getPrev(post),
      this.getNext(post)
    ]);
    return Object.assign(post.get(), {
      prev,
      next
    });
  }

  async create(input, userId) {
    Object.assign(input, { createdBy: userId, updatedBy: userId });
    const errors = await entities.get('BlogPosts').build(input).validate();
    if (errors) {
      throw new exceptions.ModelInvalidateException(errors);
    }
    let { tags } = input;
    if (tags && Array.isArray(tags)) {
      tags = await Promise.all(tags.map(tag => entities.get('BlogTags').findOne({ where: { tagName: tag.tagName } }).then(t => t || tag)));
      Object.assign(input, {
        tagsPosts: tags.filter(t => t.id > 0).map(t => ({ tagId: t.id })),
        tags: tags.filter(t => !t.id)
      });
    }
    let post = {};
    const transaction = await entities.getTransaction();
    try {
      post = await entities.get('BlogPosts').create(input, {
        include: [{
          model: entities.get('BlogTexts'),
          as: 'text'
        }, {
          model: entities.get('BlogTags'),
          as: 'tags'
        }, {
          model: entities.get('BlogTagsPosts'),
          as: 'tagsPosts'
        }],
        transaction
      });
      transaction.commit();
    } catch (e) {
      transaction.rollback();
      throw new exceptions.DatabaseIOException(e);
    }
    return this.get(post.id);
  }

  async update(id, input, userId) {
    const entity = entities.get('BlogPosts');
    const post = await this.get(id);
    if (!post) {
      throw new exceptions.ResourceNotFoundException(`Post ${id} not found`);
    }

    let { tags = [] } = input;
    tags = await Promise.all(tags.map(tag => entities.get('BlogTags').findOne({ where: { tagName: tag.tagName } }).then(t => t || tag)));
    Object.assign(input, {
      tagsPosts: tags.filter(t => t.id > 0).map(t => ({ tagId: t.id, postId: post.id })),
      tags: tags.filter(t => !t.id)
    });


    // const errors = await entity.build(input).validate();
    // if (errors) {
    //   throw new exceptions.ModelInvalidateException(errors);
    // }
    Object.assign(input, { userId });
    const transaction = await entities.getTransaction();
    try {
      for (const tag of post.tags) {
        await tag.BlogTagsPosts.destroy({ transaction });
      }
      for (const tag of input.tags) {
        const t = await entities.get('BlogTags').create(tag, { transaction });
        await post.addTags([t], { transaction });
      }
      // post.addTagsPosts(input.tagsPosts, { transaction });
      for (const tagPost of input.tagsPosts) {
        await entities.get('BlogTagsPosts').create(tagPost, { transaction });
      }

      //NOTE: update relations MUST before update main entity
      await post.text.update(input.text, { transaction });
      await post.update(Object.assign(input, {
        updatedBy: userId
      }), { transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new exceptions.DatabaseIOException(e);
    }
    return entity.findById(id, { useMaster: true });
  }

  async remove(id) {
    const post = await entities.get('BlogPosts').findOne({
      where: {
        id
      }
    });

    if (!post) {
      throw new exceptions.ResourceNotFoundException('Post not found');
    }

    await post.update({
      deletedAt: utils.getTimestamp()
    });
    return post;
  }
}
