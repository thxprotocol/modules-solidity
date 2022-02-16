ARG ARCH=
FROM ${ARCH}node:16-alpine

WORKDIR /usr/src/app

RUN apk add bash

RUN npm config set fetch-retry-maxtimeout 100000

COPY package*.json ./

RUN apk add --virtual .build g++ make py3-pip && \
    npm ci --ignore-scripts && \
    apk del .build

COPY . .

RUN npm run prepare

CMD "./scripts/init-docker.sh" 
