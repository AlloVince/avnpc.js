import { test } from '../bootstrap';
import HexoManager from '../../src/models/hexo_manager';

test('Hexo parser', async (t) => {
  t.throws(() => HexoManager.hexoParser('foo'), SyntaxError);
  t.throws(() => HexoManager.hexoParser('---foo'), SyntaxError);

  t.deepEqual(HexoManager.hexoParser('---\nfoo: bar---\n\ncontent'), {
    frontMatter: { foo: 'bar' },
    content: 'content'
  });
  t.deepEqual(HexoManager.hexoParser('---\r\nfoo: bar---\r\n\r\ncontent'), {
    frontMatter: { foo: 'bar' },
    content: 'content'
  });
});
