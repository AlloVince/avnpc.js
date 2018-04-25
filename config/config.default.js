module.exports = {
  blog: {
    hexoSourcePath: '/opt/htdocs/avnpc.content/source/_posts',
    githubOwner: 'AlloVince',
    githubRepo: 'avnpc.content',
    githubBranch: 'master',
    githubPersonalAccessToken: process.env.GITHUB_ACCESS_TOKEN || ''
  },
  evernote: {
    consumerKey: '',
    consumerSecret: '',
    sandbox: true,
    china: false,
    token: '',
    callbackDomain: '',
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
  swagger: {
    info: {
      title: 'EvaSkeleton API',
      description: 'EvaSkeleton API',
      version: '1.0'
    },
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    basePath: '/v1',
    schemes: [
      'http'
    ]
  }
};
