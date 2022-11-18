FROM alpine:3.17

ARG PORT=30000
ENV HOOKD_PORT=${PORT}

RUN apk add bash nodejs npm docker docker-compose
RUN npm install --global zx

WORKDIR /srv/hookd

COPY package.json package-lock.json ./

RUN npm clean-install

COPY . ./

ENTRYPOINT [ "npm", "start" ]