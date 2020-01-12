FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN mkdir /config
RUN ln -s /config/database.config.json /usr/src/app/config/database.config.json
RUN ln -s /config/keycloak.config.json /usr/src/app/config/keycloak.config.json
RUN rm /usr/src/app/config/server.config.json
RUN ln -s /config/server.config.json /usr/src/app/config/server.config.json

RUN mkdir /logs
RUN mkdir /socket

VOLUME /config
VOLUME /logs
VOLUME /socket

RUN npm install
EXPOSE 4000

CMD [ "node", "bin/www" ]
