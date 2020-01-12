#!/usr/bin/env node

/**
 * Module dependencies.
 */

const http = require('http');
const log4js = require('log4js');
const fs = require('fs');
const app = require('../app');
const config = require('../config/server.config.json');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');

const listenTarget = config.server.listenTarget || 'port';

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(config.server.port || '3000');
const host = config.server.host || '0.0.0.0';
const socketPath = config.server.socket || '/tmp/porygon.sock';

/**
 * Create HTTP server.
 */
const server = http.createServer(app);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  logger.fatal(error);
  // if (error.syscall !== 'listen') {
  //   throw error;
  // }

  // const bind = typeof port === 'string'
  //   ? `Pipe ${port}`
  //   : `Port ${port}`;

  // // handle specific listen errors with friendly messages
  // switch (error.code) {
  //   case 'EACCES':
  //     logger.fatal(`${bind} requires elevated privileges`);
  //     process.exit(1);
  //     break;
  //   case 'EADDRINUSE':
  //     logger.fatal(`${bind} is already in use`);
  //     process.exit(1);
  //     break;
  //   default:
  //     throw error;
  // }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  logger.info('Server currently listening');
}


/**
 * Cleanup on exit
 */
function onExit() {
  logger.info('Cleaning-up');
  if (listenTarget === 'socket') {
    logger.debug(`Removing socket ${socketPath}`);

    try {
      fs.unlinkSync(socketPath);
      logger.debug('Socket removed');
    } catch (error) {
      switch (error.code) {
        case 'ENOENT':
          logger.debug('Socket file does not exist.');
          break;
        default:
          logger.fatal(error);
          process.exit(1);
      }
    }
  }
  process.exit(0);
}


/**
   * Listen on provided port, on all network interfaces.
   */
switch (listenTarget) {
  case 'port':
    logger.info(`Server listening to host ${host} on port ${port}`);
    server.listen(port, host);
    break;
  case 'socket':
    logger.info(`Server listening to socket ${socketPath}`);
    server.listen(socketPath, () => {
      fs.chmodSync(socketPath, '666');
    });
    break;
  default:
    logger.fatal(`Unrecognized listening option '${listenTarget}', options are 'port' and 'socket'`);
    break;
}

server.on('error', onError);
server.on('listening', onListening);
process.on('SIGINT', onExit);
