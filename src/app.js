import { EvaEngine, DI, express } from 'evaengine';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import init from './init';


const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`,
  port: process.env.PORT || 3000
});
const logger = DI.get('logger');
global.p = (...args) => logger.dump(...args);

(async () => {
  await init(engine);
  engine.bootstrap();

  const app = EvaEngine.getApp();
  app.set('logger', logger);
  app.set('views', path.join(__dirname, '/../views'));
  app.set('view engine', 'pug');
  app.set('trust proxy', () => true);

  //-----------Middleware Start
  app.use(DI.get('trace')('eva_skeleton'));
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


  app.use('/v1/graphql', require('./routes/graphql'));
  app.use('/v1/blog', require('./routes/api/blog'));
  app.use('/v1/evernote', require('./routes/api/evernote'));
  app.use('/v1/manage/blog', session, auth, require('./routes/manage/blog'));
  //-----------Routers End
  engine.run();
})();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection:', reason, promise);
});
