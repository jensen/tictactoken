FROM node:16-alpine as dependencies

WORKDIR /dependencies

COPY ../client/package*.json ./

RUN npm install

FROM node:16-alpine as client

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /build

COPY ../client .
COPY --from=dependencies /dependencies/node_modules /build/node_modules

RUN npm run build

FROM denoland/deno:1.18.1

EXPOSE 8080

WORKDIR /app

USER deno

COPY ../server/deps.ts .
RUN deno cache deps.ts

ADD ../server .
RUN deno cache main.ts

COPY --from=client /build/dist /app/public

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]