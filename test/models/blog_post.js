import { test } from '../bootstrap';
import BlogPost from '../../src/models/blog_post';

test('Hexo parser', async (t) => {
  t.throws(() => BlogPost.hexoParser('foo'), SyntaxError);
  t.throws(() => BlogPost.hexoParser('---foo'), SyntaxError);

  t.deepEqual(BlogPost.hexoParser('---\nfoo: bar---\n\ncontent'), {
    frontMatter: { foo: 'bar' },
    content: 'content'
  });
  t.deepEqual(BlogPost.hexoParser('---\r\nfoo: bar---\r\n\r\ncontent'), {
    frontMatter: { foo: 'bar' },
    content: 'content'
  });
});
