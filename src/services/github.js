import core from 'evaengine';
import { format } from 'util';

const {
  DI,
  dependencies: {
    constitute: {
      Dependencies
    }
  },
  services: {
    Config
  },
  providers: {
    services: {
      ServiceProvider
    }
  }
} = core;

export default @Dependencies(Config)

class GithubAPIClient {
  /**
   * @param {Config} config
   */
  constructor(config) {
    this.config = config;
  }

  async getIssue(label) {
    const { owner, repo } = this.config.get('blog.github');
    const { repository: { issues: { nodes: [issue] } } } = await this.queryGraphQL(`
    {
      repository(owner: "${owner}", name: "${repo}") {
        issues(labels: "${label}", first: 1) {
          nodes {
            ... on Issue {
              id
              number
              title
              state
              body
              createdAt
            }
          }
        }
      }
    }
    `);
    return issue;
  }

  async createIssue(inputIssue) {
    const { owner, repo } = this.config.get('blog.github');
    const issue = await DI.get('http_client').request({
      method: 'POST',
      url: format('https://api.github.com/repos/%s/%s/issues', owner, repo),
      headers: {
        'User-Agent': 'EvaEngine.js',
        Authorization: `token ${this.config.get('blog.github.token')}`
      },
      json: true,
      body: inputIssue
    });
    return issue;
  }

  async updateIssue(issueNumber, inputIssue) {
    const { owner, repo } = this.config.get('blog.github');
    const issue = await DI.get('http_client').request({
      method: 'PATCH',
      url: format('https://api.github.com/repos/%s/%s/issues/%s', owner, repo, issueNumber),
      headers: {
        'User-Agent': 'EvaEngine.js',
        Authorization: `token ${this.config.get('blog.github.token')}`
      },
      json: true,
      body: inputIssue
    });
    return issue;
  }

  /**
   * @param path
   * @returns {Promise<Array{{name:string, type:string, mode:integer}}>}
   */
  async getFileTrees(path) {
    const { owner, repo, branch } = this.config.get('blog.github');
    const { repository: { object: { entries = [] } } } = await this.queryGraphQL(`
    {
      repository(owner: "${owner}", name: "${repo}") {
        object(expression: "${branch}:${path}") {
          ... on Tree {
            entries {
              name,
              type,
              mode
            }
          }
        }
      }
    }
    `);
    return entries || [];
  }

  async getFileTreesRecursive(owner, repo, branch, sha) {
    let treeSha;
    if (sha) {
      treeSha = sha;
    } else {
      const shaRes = await DI.get('http_client').request({
        method: 'GET',
        url: format('https://api.github.com/repos/%s/%s/branches/%s', owner, repo, branch),
        headers: {
          'User-Agent': 'EvaEngine.js',
          Authorization: `token ${this.config.get('blog.github.token')}`
        },
        json: true
      });
      treeSha = shaRes.commit.commit.tree.sha;
    }

    return DI.get('http_client').request({
      method: 'GET',
      url: format('https://api.github.com/repos/%s/%s/git/trees/%s?recursive=1', owner, repo, treeSha),
      headers: {
        'User-Agent': 'EvaEngine.js',
        Authorization: `token ${this.config.get('blog.github.token')}`
      },
      json: true
    });
  }

  async queryGraphQL(queryText) {
    const { data } = await DI.get('http_client').request({
      method: 'POST',
      url: 'https://api.github.com/graphql',
      headers: {
        'User-Agent': 'EvaEngine.js',
        Authorization: `bearer ${this.config.get('blog.github.token')}`
      },
      json: true,
      body: {
        query: queryText
      }
    });
    return data;
  }
}

export class GithubAPIClientProvider extends ServiceProvider {
  get name() {
    return 'github';
  }

  register() {
    DI.bindClass(this.name, GithubAPIClient);
  }
}
