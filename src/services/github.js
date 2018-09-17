import core from 'evaengine';

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

  /**
   * @param path
   * @returns {Promise<Array{{name:string, type:string, mode:integer}}>}
   */
  async getFileTrees(path) {
    const { repository: { object: { entries = [] } } } = await this.queryGraphQL(`
    {
      repository(owner: "${this.config.get('blog.githubOwner')}", name: "${this.config.get('blog.githubRepo')}") {
        object(expression: "${this.config.get('blog.githubBranch')}:${path}") {
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

  async queryGraphQL(queryText) {
    const { data } = await DI.get('http_client').request({
      method: 'POST',
      url: 'https://api.github.com/graphql',
      headers: {
        'User-Agent': 'EvaEngine.js',
        Authorization: `bearer ${this.config.get('blog.githubPersonalAccessToken')}`
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
