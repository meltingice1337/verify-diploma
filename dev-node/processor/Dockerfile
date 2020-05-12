FROM node:12-alpine

WORKDIR /usr/src/processor

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
    ;

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]