import { DI } from 'evaengine';
import assert from 'assert';
import moment from 'moment-timezone';
import entities from '../entities';

export default class BlogComment {
  static async upsert(postId) {
    const github = DI.get('github');
    const post = await entities.get('BlogPosts').findOne({
      where: {
        id: postId
      },
      order: 'id DESC'
    });
    assert(post, `Post ${postId} not exsit`);

    const issue = await github.getIssue(`POST_${post.id}`);
    const issueInfo = {
      title: `[评论]${post.title} | avnpc.com/p/${post.id}`,
      body: `- [编辑内容](https://github.com/AlloVince/avnpc.content/blob/master/source/_posts/${moment.unix(post.createdAt).format('YYYY')}/${post.slug}.md)
- [阅读原文《${post.title}》](https://avnpc.com/pages/${post.slug})`,
      labels: [
        'Gitalk',
        `POST_${post.id}`
      ]
    };
    return issue ? github.updateIssue(issue.number, issueInfo) : github.createIssue(issueInfo);
  }
}
