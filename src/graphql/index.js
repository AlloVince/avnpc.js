import GraphqlBoot from 'graphql-boot';
import * as postQuery from './queries/post';
import * as noteQuery from './queries/note';

let graphqlBoot = null;
const queries = [postQuery, noteQuery];
export const typeDefs = queries.map(({ schema }) => schema);
export const resolvers = queries.map(({ resolver }) => resolver);
export const getGraphqlBoot = () => {
  if (graphqlBoot) {
    return graphqlBoot;
  }
  graphqlBoot = new GraphqlBoot({
    schemaScanPath: `${__dirname}/../*/**/*.graphqls`
  });
  return graphqlBoot;
};
