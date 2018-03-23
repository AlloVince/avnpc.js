import { test } from '../bootstrap';
import HexoManager from '../../src/models/hexo_manager';

test('Hexo parser', async (t) => {
  t.throws(() => HexoManager.hexoTextParser('foo'), SyntaxError);
  t.throws(() => HexoManager.hexoTextParser('---foo'), SyntaxError);

  t.deepEqual(HexoManager.hexoTextParser('---\nfoo: bar---\n\ncontent'), {
    frontMatter: { foo: 'bar' },
    content: 'content'
  });
  t.deepEqual(HexoManager.hexoTextParser('---\r\nfoo: bar---\r\n\r\ncontent'), {
    frontMatter: { foo: 'bar' },
    content: 'content'
  });
});
