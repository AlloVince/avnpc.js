import { DI } from 'evaengine';
import BlogComment from '../models/blog_comment';

export const actions = [
  'create',
  'update'
];

export class BlogPostListener {
  get prefix() {
    return 'blog_post';
  }

  get actions() {
    return actions;
  }

  async afterCreate(post) {
    DI.get('logger').info('Event blog_post:create:after be triggered by post %s', post.id);
    return BlogComment.upsert(post.id);
  }

  async afterUpdate(post) {
    DI.get('logger').info('Event blog_post:update:after be triggered by post %s', post.id);
    return BlogComment.upsert(post.id);
  }
}
