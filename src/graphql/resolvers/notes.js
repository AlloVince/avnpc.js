import gql from 'graphql-tag';
import EvernoteManager, { ORDERS } from '../../models/evernote_manager';

export const schema = gql`  
type Notes {
    pagination: Pagination
    results: [Note]
}
extend type Query {
    notes(offset: Int, limit: Int, order: String): Notes
}
`;

export const resolver = {
  Query: {
    notes: async (source, args) => {
      const { offset, limit = 10, order: rawOrder = '-createdAt' } = args;
      const [order, ascending] = ({
        createdAt: [ORDERS.CREATED, true],
        '-createdAt': [ORDERS.CREATED, false]
      })[rawOrder];
      const em = new EvernoteManager();
      const { total, notes } = await em.listNotes({
        offset,
        limit,
        order,
        ascending
      });
      return {
        pagination: {
          total,
          offset,
          limit
        },
        results: notes
      };
    }
  }
};

