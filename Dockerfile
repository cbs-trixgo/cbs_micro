FROM node:16-alpine as builder

WORKDIR /app

ENV NODE_ENV=production

RUN yarn global add pm2

COPY package.json yarn.lock ./

RUN yarn --silent --frozen-lockfile --production

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

COPY . .

FROM gcr.io/distroless/nodejs16-debian11 as runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3001
CMD ["./node_modules/.bin/moleculer-runner", "--repl", "--hot", "services/**/*.service.js"]
# CMD ["pm2-runtime", "provisioning/process.config.js"]
