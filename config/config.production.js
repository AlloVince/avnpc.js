module.exports = {
  blog: {
    googleCustomSearchKey: process.env.GOOGLE_CUSTOM_SEARCH_KEY || '',
    googleCustomSearchCx: process.env.GOOGLE_CUSTOM_SEARCH_CX || '005909242293933576388:h9kkzcmu7y8'
  },
  sequelize: {
    logging: false
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  },
  evernote: {
    consumerKey: 'allovince',
    consumerSecret: process.env.EVERNOTE_CONSUMERSECRET || '',
    sandbox: false,
    china: false,
    callbackDomain: process.env.EVERNOTE_CALLBACK_DOMAIN || 'https://api.avnpc.com',
    sharedId: 's7',
    defaultNotebookId: '4127acd7-f384-4d16-bed2-2aa3084a7d5c'
  },
  db: {
    database: 'avnpc',
    replication: {
      write: {
        host: process.env.DB_REPLICATION_WRITE_HOST || 'db',
        username: process.env.DB_REPLICATION_WRITE_USERNAME || 'avnpc',
        password: process.env.DB_REPLICATION_WRITE_PASSWORD || 'MySQL_password'
      },
      read: [
        {
          host: process.env.DB_REPLICATION_READ0_HOST || 'db',
          username: process.env.DB_REPLICATION_READ0_USERNAME || 'avnpc',
          password: process.env.DB_REPLICATION_READ0_PASSWORD || 'MySQL_password'
        }
      ]
    }
  }
};
