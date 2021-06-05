FROM node:16-alpine3.13

ARG PORT=30000
ENV HOOKD_PORT=${PORT}
EXPOSE ${HOOKD_PORT}

RUN apk add shadow
RUN useradd -ms /bin/ash hookd
RUN apk del shadow

RUN npm install --global zx

WORKDIR /srv/hookd
RUN chown -R hookd:hookd /srv/hookd

COPY --chown=hookd:hookd package.json package-lock.json ./

RUN npm clean-install

COPY --chown=hookd:hookd . ./

USER hookd
ENTRYPOINT [ "npm", "start" ]