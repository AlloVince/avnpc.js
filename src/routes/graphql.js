import { EvaEngine } from 'evaengine';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express/dist/index';
import { typeDefs, resolvers, getGraphqlBoot } from '../graphql';

const router = EvaEngine.createRouter();
const graphqlBoot = getGraphqlBoot();
router.use('/api', graphqlExpress({
  schema: graphqlBoot.getSchema({
    typeDefs,
    resolvers
  })
}));

router.use('/ui', graphiqlExpress({ endpointURL: '/v1/graphql/api' }));

module.exports = router;
