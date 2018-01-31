FROM node:8.9.4-alpine

RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone

COPY . /opt/htdocs/avnpc.js
WORKDIR /opt/htdocs/avnpc.js

RUN npm install && npm run build && npm prune --production

EXPOSE 3000

CMD node ./build/app.js
