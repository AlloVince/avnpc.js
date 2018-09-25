module.exports = {
  blog: {
    hexo: {
      postsPath: process.env.BLOG_HEXO_POSTSPATH || '/opt/htdocs/avnpc.content/source/_posts'
    },
    github: {
      owner: process.env.BLOG_GITHUB_OWNER || 'AlloVince',
      repo: process.env.BLOG_GITHUB_REPO || 'avnpc.content',
      branch: process.env.BLOG_GITHUB_BRANCH || 'master',
      token: process.env.BLOG_GITHUB_TOKEN || '',
      webhookSecret: process.env.BLOG_GITHUB_WEBHOOKSECRET || '',
      postsPath: process.env.BLOG_GITHUB_POSTSPATH || 'source/_posts'
    },
    search: {
      googleKey: process.env.BLOG_SEARCH_GOOGLEKEY || '',
      googleCx: process.env.BLOG_SEARCH_GOOGLECX || ''
    }
  },
  evernote: {
    consumerKey: process.env.EVERNOTE_CONSUMERKEY || '',
    consumerSecret: process.env.EVERNOTE_CONSUMERSECRET || '',
    sandbox: true,
    china: false,
    token: process.env.EVERNOTE_TOKEN || '',
    callbackDomain: process.env.EVERNOTE_CALLBACK_DOMAIN || '',
    defaultNotebookId: '',
    sharedId: ''
  },
  sequelize: {
    logging: true
  },
  logger: {
    file: `${__dirname}/../logs/application.log`
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  },
  sentry: {
    enabled: process.env.SENTRY_ENABLED || false,
    dsn_cli: process.env.SENTRY_DSN_CLI || '',
    dsn_worker: process.env.SENTRY_DSN_WORKER || '',
    dsn_web: process.env.SENTRY_DSN_WEB || ''
  },
  db: {
    migrationPaths: [
      'migrations/blog'
    ],
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_DATABASE || '',
    dialectOptions: {
      multipleStatements: true,
      timeout: 3
    },
    replication: {
      write: {
        host: process.env.DB_REPLICATION_WRITE_HOST || '',
        username: process.env.DB_REPLICATION_WRITE_USERNAME || '',
        password: process.env.DB_REPLICATION_WRITE_PASSWORD || '',
        pool: {}
      },
      read: [
        /*
         {
         host: '',
         username: '',
         password: '',
         pool: {}
         }
         */
      ]
    }
  },
  session: {
    cookie: {
      path: '/',
      httpOnly: false,
      secure: false,
      maxAge: 3600 * 1000
    },
    store: null,
    secret: 'your_secret',
    resave: true,
    saveUninitialized: true
  },
  token: {
    prefix: 'evaskeleton',
    secret: 'your_secret',
    faker: {
      enable: false,
      key: 'abc',
      uid: 1
    }
  },
  unsplash: {
    applicationId: '',
    secret: '',
    callbackUrl: '',
    bearerToken: ''
  },
  swagger: {
    info: {
      title: 'avnpc.com API',
      description: 'avnpc.com API',
      version: '1.0'
    },
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    basePath: '/v1',
    schemes: [
      'http'
    ]
  }
};
