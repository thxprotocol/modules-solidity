FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --virtual .build g++ make py3-pip && \
    npm ci --ignore-scripts && \
    apk del .build

COPY . .

RUN npm run prepare

CMD [ "npx", "hardhat", "node" ]
