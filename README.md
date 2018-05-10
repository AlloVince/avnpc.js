# avnpc.js

[![Build Status](https://travis-ci.org/AlloVince/avnpc.js.svg?branch=master)](https://travis-ci.org/AlloVince/avnpc.js)
[![Dependencies Status](https://david-dm.org/AlloVince/avnpc.js.svg)](https://david-dm.org/AlloVince/avnpc.js)
[![License](https://img.shields.io/npm/l/avnpc.svg?maxAge=2592000?style=plastic)](https://github.com/AlloVince/avnpc.js/blob/master/LICENSE)


Backend API for avnpc.com

A pure node.js blog micro service

- API style: both support RESTFul / GraphQL
- Blog posts content be able to store in a github repo (hexo compatibled) or an Evernote account

## Installation & development

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

## Use Github repo as storage

If database already have posts, it is able to exporting all posts as local hexo files by

```
ndoe build/cli.js blog:export:hexo
```

Make sure `config.blog.hexoSourcePath` configured before command run.