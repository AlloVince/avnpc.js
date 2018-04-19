import { EvaEngine } from 'evaengine';
import GraphqlBoot from 'graphql-boot/lib';
import * as postsQuery from '../graphql/queries/posts';
import * as notesQuery from '../graphql/queries/notes';

const router = EvaEngine.createRouter();
const queries = [postsQuery, notesQuery];
const graphqlBoot = new GraphqlBoot({
  schemaScanPath: `${__dirname}/../*/**/*.graphqls`
});

router.use('/api', graphqlBoot.getMiddleware({
  typeDefs: queries.map(({ schema }) => schema),
  resolvers: queries.map(({ resolver }) => resolver)
}));

router.use('/ui', graphqlBoot.getUI({ endpointURL: '/v1/graphql/api' }));

module.exports = router;
