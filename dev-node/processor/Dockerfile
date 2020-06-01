FROM node:10-alpine

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
    git \
    python \
    ;

COPY package*.json ./

COPY .babelrc ./

RUN npm install

COPY . .

RUN npm i -g nodemon

CMD [ "npm", "start" ]
