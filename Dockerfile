ARG NODE_VERSION=16-alpine
FROM node:${NODE_VERSION}

WORKDIR /app

ENV NODE_ENV=production

RUN yarn global add pm2

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD ["pm2-runtime", "provisioning/process.config.js"]
