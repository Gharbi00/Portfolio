FROM node:14.15-alpine AS builder

ARG CI_SERVER_HOST
ARG CI_PROJECT_ID
ARG CI_JOB_TOKEN

WORKDIR /usr/src/app
ENV API_SERVER=terminal.sifca.app
ENV NODE_OPTIONS="--max-old-space-size=16000"

COPY libs ./libs
COPY apps/terminal ./apps/terminal

COPY ./package.json ./package-lock.json ./nx.json ./tsconfig.base.json ./tslint.json ./schema.gql ./
RUN echo "@diktup:registry=https://${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/npm/" > .npmrc
RUN echo "//${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/npm/:_authToken=${CI_JOB_TOKEN}" >> .npmrc
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm ci

RUN npm install -g @angular/cli@12.0.1
RUN npm install -g @nrwl/cli@12.0.1

RUN npm run build:sandbox:terminal

FROM nginx:alpine
COPY --from=builder /usr/src/app/dist/apps/terminal/browser /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./apps/terminal/nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]

