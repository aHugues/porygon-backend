FROM node:12-alpine

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

CMD [ "node", "bin/www" ]
