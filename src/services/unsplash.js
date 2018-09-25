import core from 'evaengine';
import Unsplash from 'unsplash-js';

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

class UnsplashClient {
  constructor(config) {
    const {
      applicationId,
      secret,
      callbackUrl,
      bearerToken
    } = config.get('unsplash');
    this.client = new Unsplash({
      applicationId,
      secret,
      callbackUrl,
      bearerToken
    });
  }

  getClient() {
    return this.client;
  }
}

export class UnsplashClientProvider extends ServiceProvider {
  get name() {
    return 'unsplash';
  }

  register() {
    DI.bindClass(this.name, UnsplashClient);
  }
}
