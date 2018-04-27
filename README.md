# avnpc.js

Backend API for avnpc.com

A pure node.js blog micro service

- API style: both support RESTFul / GraphQL
- Blog posts content be able to store in a github repo or an Evernote account

### Installation & development

```
make pre-build
make install
cp config/default.js config/config.local.development.js
```

Change database configs due to your local environment

```
make migrate
```

After database ready, run web server by

```
npm run dev
npm run swagger-dev
```

Visit RESTFul API by `http://localhost:15638/`

Visit GraphQL API by `http://localhost:3000/v1/graphql/ui`

