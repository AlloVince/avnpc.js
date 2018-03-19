import moment from 'moment-timezone';
import yaml from 'js-yaml';
import fs from 'fs';
import assert from 'assert';
import { DI, exceptions } from 'evaengine';
import mkdirp from 'mkdirp';
import BlogPost from './blog_post';

export default class HexoManager {
  /**
   * @param rawText
   * @param filename
   * @returns {{frontMatter: *, content: string}}
   */
  static hexoTextParser(rawText, filename) {
    const splitMark = '---';
    if (!rawText.startsWith(splitMark)) {
      throw new SyntaxError(`Unrecognizable hexo file ${filename}, no front matter found`);
    }
    const [, frontMatter, ...contents] = rawText.split(splitMark);
    if (contents.length < 1) {
      throw new SyntaxError(`Unrecognizable hexo file ${filename}, no content found`);
    }
    return {
      frontMatter: yaml.load(frontMatter),
      content: contents.join(splitMark).trim()
    };
  }

  /**
   * @param rawText
   * @param filename
   * @returns {{title: *, slug, status: string,
   *   createdAt: *, tags, username: *, text: {content: *}}}
   */
  static hexoFileToPost({ rawText, contentRemoteHash }, filename) {
    const slug = filename.split('.').slice(0, -1).join('.');
    const {
      frontMatter: {
        published,
        date,
        tags,
        author,
        title
      }, content
    } = HexoManager.hexoTextParser(rawText, filename);
    return {
      title,
      slug,
      status: published ? 'published' : 'draft',
      createdAt: moment(date).unix(),
      tags: tags.map(t => ({ tagName: t })),
      username: author,
      contentStorage: 'remote',
      contentRemoteHash,
      contentSynchronizedAt: moment().unix(),
      text: {
        content
      }
    };
  }

  /**
   * @param post
   * @returns {{filename: string, year: string, month: string, day: string, hexoText: string}}
   */
  static postToHexoFile(post) {
    const createAt = moment.unix(post.createdAt).format('YYYY-MM-DD HH:mm:ss');
    const frontMatter = {
      published: post.status === 'published',
      date: createAt,
      tags: post.tags.map(t => t.tagName),
      author: post.username,
      title: post.title
    };
    return {
      filename: `${post.slug}.md`,
      year: createAt.split('-')[0],
      month: createAt.split('-')[1],
      day: createAt.split('-')[2],
      hexoText: `---
${yaml.safeDump(frontMatter)}---

${post.text.content}
`
    };
  }

  /**
   * @param post
   * @param fileRootPath
   * @returns {Promise<string>}
   */
  static async exportPostToLocalHexoFile(post, fileRootPath) {
    const { filename, hexoText, year } = HexoManager.postToHexoFile(post);
    mkdirp.sync(`${fileRootPath}/${year}`);
    const fullPath = `${fileRootPath}/${year}/${filename}`;
    fs.writeFileSync(fullPath, hexoText);
    return fullPath;
  }

  static async syncHexoFileFromGithub(oldPost) {
    const filename = `${oldPost.slug}.md`;
    const { rawText, contentRemoteHash } =
      await HexoManager.getHexoFileFromGithub(`source/_posts/${moment.unix(oldPost.createdAt).format('YYYY')}/${filename}`);

    if (contentRemoteHash === oldPost.contentRemoteHash) {
      DI.get('logger').warn('Post not updated by same hash', contentRemoteHash);
      return false;
    }

    const newPost = HexoManager.hexoFileToPost(rawText, filename);
    return (new BlogPost()).upsert(newPost, 0);
  }

  static async importHexoFileFromGithub(hexoFileName) {
    const { name, path } = hexoFileName;
    assert(name && path, 'Import hexo file require name and path');
    const slug = name.split('.').slice(0, -1).join('.');
    const hexoFile = await HexoManager.getHexoFileFromGithub(`${path}/${name}`);
    const blogModel = new BlogPost();

    let oldPost = null;
    try {
      oldPost = await blogModel.get(slug, {});
    } catch (e) {
      if (!(e instanceof exceptions.ResourceNotFoundException)) {
        throw e;
      }
    }

    if (oldPost && hexoFile.contentRemoteHash === oldPost.contentRemoteHash) {
      DI.get('logger').warn('Post %s not updated by same hash %s', oldPost.id, hexoFile.contentRemoteHash);
      return false;
    }

    const newPost = HexoManager.hexoFileToPost(hexoFile, name);
    return (new BlogPost()).upsert(newPost, 0);
  }

  /**
   * @param year
   * @returns {Promise<Array{{name:string, type:string, mode:integer, path:string}}>}
   */
  static async getHexoFileListFromGithub(year, slug) {
    const path = `source/_posts/${year}`;
    const files = await DI.get('github').getFileTrees(path);
    if (files.length < 1) {
      return files;
    }
    return files
      .map(file => Object.assign(file, { path }))
      .filter(file => (slug ? file.name === `${slug},md` : true));
  }

  static async getHexoFileFromGithub(filepath) {
    const config = DI.get('config');
    const {
      repository:
        {
          object: { commitUrl, text }
        }
    } = await DI.get('github').queryGraphQL(`
    {
      repository(owner: "${config.get('blog.githubOwner')}", name: "${config.get('blog.githubRepo')}") {
        object(expression: "${config.get('blog.githubBranch')}:${filepath}") {
          commitUrl
          ... on Blob {
            text
          }
        }
      }
    }
    `);
    return {
      contentRemoteHash: commitUrl.split('/').pop(),
      //TODO updatedAt:
      rawText: text
    };
  }
}
