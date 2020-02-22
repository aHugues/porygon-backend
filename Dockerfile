FROM node:12-alpine

RUN apk add netcat-openbsd curl

WORKDIR /usr/src/app

COPY . .

RUN mkdir /config \
    && ln -s /config/database.config.json /usr/src/app/config/database.config.json \
    && ln -s /config/keycloak.config.json /usr/src/app/config/keycloak.config.json \
    && rm /usr/src/app/config/server.config.json \
    && ln -s /config/server.config.json /usr/src/app/config/server.config.json

RUN mkdir /logs \
    && mkdir /socket

VOLUME /config
VOLUME /logs
VOLUME /socket

RUN npm install --production

RUN rm -rf /tmp/* \
    && rm -rf /opt/yarn*

EXPOSE 4000

HEALTHCHECK --interval=120s --timeout=20s \
    CMD /usr/src/app/docker_healthcheck || exit 1

CMD [ "node", "bin/www" ]
