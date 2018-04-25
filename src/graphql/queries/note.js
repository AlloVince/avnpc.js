import { graphql, GraphqlSchema } from 'graphql-boot';
import { exceptions } from 'evaengine';
import EvernoteManager, { ORDERS } from '../../models/evernote_manager';

export const schema = '';

export const resolver = {
  Query: {
    @GraphqlSchema(graphql`
        extend type Query {
            note(slug: String!): Note
        }
    `)
    note: async (source, args) => {
      const em = new EvernoteManager();
      const { slug } = args;
      const note = await em.getNote(slug);
      if (!note) {
        throw new exceptions.ResourceNotFoundException('Note not exists');
      }
      return note;
    },


    @GraphqlSchema(graphql`
        type Notes {
            pagination: Pagination
            results: [NoteSummary]
        }
        extend type Query {
            notes(offset: Int, limit: Int, order: String): Notes
        }
    `)
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

