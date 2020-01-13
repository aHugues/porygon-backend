const request = require('request');
const log4js = require('log4js');
const Package = require('../package.json');
const knex = require('./database.service');
const keycloakConfig = require('../config/keycloak.config.json');
const databaseConfig = require('../config/database.config.json');

const service = {};

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');
const ApiVersion = Package.version || 'Unknown';

const databaseConfigured = (
  typeof databaseConfig[env].host !== 'undefined'
  && typeof databaseConfig[env].password !== 'undefined'
  && typeof databaseConfig[env].host !== 'undefined'
  && typeof databaseConfig[env].database !== 'undefined'
  && typeof databaseConfig[env].user !== 'undefined'
);
let databaseConnectionStatus = false;
logger.debug(`Database configuration: ${databaseConfigured ? 'ok' : 'error'}`);

const keycloakActivated = env === 'production';
const keycloakConfigured = (
  typeof keycloakConfig.host !== 'undefined'
  && typeof keycloakConfig.realm !== 'undefined'
  && typeof keycloakConfig.credentials.secret !== 'undefined'
);
let keycloakConnectionStatus = false;
logger.debug(`Keycloak configuration: ${keycloakConfigured ? 'ok' : 'error'}`);
logger.debug(`Keycloak in use: ${keycloakActivated ? 'yes' : 'no'}`);

const frequency = 10000;


function testDataBaseConnection() {
  let newConnectionStatus = databaseConnectionStatus;
  knex.raw('select 1+1 as result')
    .then(() => { newConnectionStatus = true; })
    .catch(() => { newConnectionStatus = false; })
    .finally(() => {
      if (newConnectionStatus !== databaseConnectionStatus) {
        logger.debug(`Database Connection status changed to ${newConnectionStatus ? 'ok' : 'error'}`);
      }
      databaseConnectionStatus = newConnectionStatus;
    });
}


function testKeycloakConnection() {
  const options = {
    method: 'GET',
    url: `https://${keycloakConfig.host}/auth/realms/${keycloakConfig.realm}`,
  };
  request(options, (error, response) => {
    const newKeycloakStatus = (!error && response.statusCode === 200);
    if (newKeycloakStatus !== keycloakConnectionStatus) {
      logger.debug(`Keycloak Connection status changed to ${newKeycloakStatus ? 'ok' : 'error'}`);
    }
    keycloakConnectionStatus = newKeycloakStatus;
  });
}


function returnStatus() {
  return {
    ApiVersion,
    database: {
      configured: databaseConfigured,
      status: databaseConnectionStatus,
    },
    keycloak: {
      configured: keycloakConfigured,
      used: keycloakActivated,
      status: keycloakConnectionStatus,
    },
  };
}

setInterval(testDataBaseConnection, frequency);
setInterval(testKeycloakConnection, frequency);

service.returnStatus = returnStatus;

module.exports = service;
