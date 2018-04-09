import { EvaEngine } from 'evaengine';
import merge from 'lodash/merge';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express/dist/index';
import { makeExecutableSchema } from 'graphql-tools';
import bodyParser from 'body-parser';
import Graphqls from '../graphql';
import * as postResolver from '../graphql/resolvers/posts';

const router = EvaEngine.createRouter();
const resolvers = [postResolver];

// The GraphQL endpoint
router.use('/api', bodyParser.json(), graphqlExpress({
  schema: makeExecutableSchema({
    typeDefs: [...Graphqls.getSchemas(), ...resolvers.map(({ schema }) => schema)],
    resolvers: merge(...resolvers.map(({ resolver }) => resolver))
  })
}));

// GraphiQL, a visual editor for queries
router.use('/ui', graphiqlExpress({ endpointURL: '/v1/graphql/api' }));

module.exports = router;
