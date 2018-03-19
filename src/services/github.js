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

@Dependencies(Config) //eslint-disable-line new-cap
export default class GithubAPIClient {
  /**
   * @param {Config} config
   */
  constructor(config) {
    this.config = config;
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
