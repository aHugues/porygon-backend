const request = require('request');
const log4js = require('log4js');
const Package = require('../package.json');
const knex = require('./database.service');
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


function returnStatus() {
  return {
    ApiVersion,
    database: {
      configured: databaseConfigured,
      status: databaseConnectionStatus,
    },
  };
}

setInterval(testDataBaseConnection, frequency);

service.returnStatus = returnStatus;

module.exports = service;
