FROM node:12-alpine

RUN apk add netcat-openbsd curl

WORKDIR /usr/src/app

COPY . .
RUN npm install typescript ts-node
RUN npm run build \
    && cp -r build /tmp \
    && rm -rf * \
    && mv /tmp/build .
COPY docker_healthcheck .

RUN mkdir /config \
    && ln -s /config/database.config.json /usr/src/app/build/config/database.config.json \
    && rm /usr/src/app/build/config/server.config.json \
    && ln -s /config/server.config.json /usr/src/app/build/config/server.config.json

RUN mkdir /logs \
    && mkdir /socket

VOLUME /config
VOLUME /logs
VOLUME /socket

WORKDIR /usr/src/app/build
RUN npm install --production

RUN rm -rf /tmp/* \
    && rm -rf /opt/yarn*

EXPOSE 4000

HEALTHCHECK --interval=120s --timeout=20s \
    CMD /usr/src/app/docker_healthcheck || exit 1

CMD [ "node", "bin/www.js" ]
