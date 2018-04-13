import { EvaEngine } from 'evaengine';
import merge from 'lodash/merge';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express/dist/index';
import { makeExecutableSchema } from 'graphql-tools';
import bodyParser from 'body-parser';
import GraphqlBoot from '../graphql';
import * as postResolver from '../graphql/resolvers/posts';
import * as noteResolver from '../graphql/resolvers/notes';

const router = EvaEngine.createRouter();
const resolvers = [postResolver, noteResolver];

router.use('/api', bodyParser.json(), graphqlExpress({
  schema: makeExecutableSchema({
    typeDefs: [...GraphqlBoot.getSchemas(), ...resolvers.map(({ schema }) => schema)],
    resolvers: merge(GraphqlBoot.getDefaultResolver(), ...resolvers.map(({ resolver }) => resolver))
  })
}));

router.use('/ui', graphiqlExpress({ endpointURL: '/v1/graphql/api' }));

module.exports = router;
