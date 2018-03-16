import { EvaEngine, DI, express } from 'evaengine';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import moment from 'moment-timezone';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import entities from './entities';

moment.tz.setDefault('Asia/Shanghai');
const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`,
  port: process.env.PORT || 3000
});
engine.bootstrap();

const app = EvaEngine.getApp();
const logger = DI.get('logger');
global.p = (...args) => {
  logger.debug(...args);
};

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

// The GraphQL endpoint
app.use('/v1/graphql', bodyParser.json(), graphqlExpress({
  schema: makeExecutableSchema({
    typeDefs: `
      type Query { 
        posts(offset: Int, limit: Int, order: String): PostFeed
      }
      type Pagination {
        "总数"
        total: Int,
        offset: Int,
        limit: Int
      }
      type Post { 
        id: ID, title: String, slug: String 
      }
      type PostFeed {
        pagination: Pagination
        results: [Post]
      }
    `,
    resolvers: {
      Query: {
        posts: async (group, { offset, limit = 10 }) => {
          return {
            pagination: {
              total: 10
            },
            results: await entities.get('BlogPosts').findAll({ offset, limit })
          };
        }
      },
    },
  })
}));
// GraphiQL, a visual editor for queries
app.use('/v1/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.use('/v1/blog', require('./routes/api/blog'));
app.use('/v1/manage/blog', session, auth, require('./routes/manage/blog'));
//-----------Routers End


engine.run();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection:', reason, promise);
});
