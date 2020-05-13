FROM node:12-alpine

WORKDIR /usr/src/bitbox-rest

RUN apk add --no-cache \
    build-base \
    g++ \
    libpng \
    libpng-dev \
    jpeg-dev \
    pango-dev \
    cairo-dev \
    giflib-dev \
    python \
    git \
    ;

COPY ./rest.bitbox.earth/package*.json ./

RUN npm install

COPY ./rest.bitbox.earth/ .

CMD [ "npm", "start" ]