import { EvaEngine, DI, express } from 'evaengine';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import Raven from 'raven';
import SentryLogger from 'winston-raven-sentry';
import init from './init';

const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`,
  port: process.env.PORT || 3000
});
const app = EvaEngine.getApp();

const logger = DI.get('logger');
global.p = (...args) => logger.dump(...args);

(async () => {
  await init(engine);
  engine.bootstrap();

  const ravenTags = {
    node_role: process.env.ROLE || 'web'
  };
  const config = DI.get('config');
  const sentryConfig = config.get('sentry') || { enabled: false, dsn_web: false };
  if (sentryConfig.enabled) {
    Raven.config(sentryConfig.enabled && config.get('sentry').dsn_web).install();
    Raven.setContext({
      tags: ravenTags
    });
    logger.getInstance().add(SentryLogger, {
      dsn: sentryConfig.dsn_web,
      level: 'error',
      label: 'web',
      tags: ravenTags
    });
    app.use(Raven.requestHandler());
  }

  app.set('logger', logger);
  app.set('views', path.join(__dirname, '/../views'));
  app.set('view engine', 'pug');
  app.set('trust proxy', () => true);

  //-----------Middleware Start
  app.use(DI.get('trace')('avnpc.js'));
  app.use(DI.get('debug')());
  app.use(express.static(path.join(__dirname, '/../public')));
  app.use(cors({
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  //-----------Middleware End


  //-----------Routers Start
  const session = DI.get('session')();
  const auth = DI.get('auth')();

  /* eslint-disable global-require */
  app.use(require('./routes/api/github'));
  app.use('/v1/graphql', require('./routes/graphql'));
  app.use('/v1/blog', require('./routes/api/blog'));
  app.use('/v1/evernote', require('./routes/api/evernote'));
  app.use('/v1/search', require('./routes/api/search'));
  app.use('/v1/unsplash', require('./routes/api/unsplash'));
  app.use('/v1/manage/blog', session, auth, require('./routes/manage/blog'));
  app.use('/', require('./routes/index'));
  //-----------Routers End

  if (sentryConfig.enabled) {
    app.use(Raven.errorHandler());
  }

  engine.run();
})();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection:', reason, promise);
});


for (const signal of ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGTERM', 'SIGABRT', 'SIGTSTP']) {
  process.on(signal, () => {
    logger.info('Received signal %s', signal);
    setInterval(() => {
      logger.info('Process exit by signal %s', signal);
      process.exit(0);
    }, 10000);
  });
}
