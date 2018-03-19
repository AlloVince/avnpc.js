import { exceptions, utils } from 'evaengine';
import assert from 'assert';
import entities from '../entities';

export default class BlogPost {
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

  async get(idOrSlug, additionalCondition = { deletedAt: 0 }) {
    const where = /^\d+$/.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
    const post = await entities.get('BlogPosts').findOne({
      where: Object.assign(where, additionalCondition),
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

  async getWithNeighbor(idOrSlug, additionalCondition = { deletedAt: 0, status: 'published' }) {
    const post = await this.get(idOrSlug, additionalCondition);
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
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
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

  async upsert(input, userId) {
    const { slug } = input;
    assert(slug, 'Slug must exists for upsert a post');
    const post = await entities.get('BlogPosts').findOne({
      where: {
        slug
      }
    });
    return post ? this.update(post.id, input, userId) : this.create(input, userId);
  }
}
