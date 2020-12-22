const rxjs = require('rxjs');
const log4js = require('log4js');
const knex = require('./database.service');
const FieldsVerification = require('../middlewares/fields_verification');
const cleanup = require('../middlewares/cleanup');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const service = {};

const createUser = (newUser, saltRounds = 10) => {
  logger.debug('Creating new user');
  const userUuid = uuidv4();
  const observable = rxjs.Observable.create((obs) => {
    if (!FieldsVerification.checkNewUser(newUser)) {
      obs.error('Missing field for created user');
      obs.complete();
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(newUser.password, salt);
      const fullUser = {
        uuid: userUuid,
        login: newUser.login,
        password: hash,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      }
      knex('User').insert(cleanup.removeNulls(fullUser), ['uuid'])
      .then((instance) => {
        logger.debug(`User ${fullUser.login} successfully created`);
        obs.next(instance);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error creating new user: ${JSON.stringify(error)}`);
        obs.error(error);
      });
    }
  })
  return observable;
}

const getUserInfo = (login) => {
  logger.debug(`Getting information for user ${login}`)
  const observable = rxjs.Observable.create((obs) => {
    knex('User').where('login', login).select()
      .then((rows) => {
        if (rows.length !== 1) {
          const error = new Error(`User with login ${login} not found.`);
          error.statusCode = 404;
          obs.error(error);
        } else {
          logger.debug(`Returning information for user ${login}`)
          const returnedUser = {
            login: rows[0].login,
            firstName: rows[0].firstName,
            lastName: rows[0].lastName,
            email: rows[0].email,
          };
          obs.next(returnedUser);
          obs.complete();
        }
      })
  })
  return observable;
}

const checkLogin = (login, password, saltRounds = 10) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('User').where('login', login).select()
      .then((rows) => {
        if (rows.length !== 1) {
          const error = new Error(`User with login ${login} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          logger.debug(`Found user ${login}`)
          const returnedUser = {
            login: rows[0].login,
            firstName: rows[0].firstName,
            lastName: rows[0].lastName,
            email: rows[0].email,
          };
          if (bcrypt.compareSync(password, rows[0].password)) {
            obs.next(returnedUser);
            obs.complete()
          } else {
            const error = new Error(`Invalid password for user ${login}.`)
            error.statusCode = 401;
            throw error;
          }
        }
      })
      .catch((error) => {
        logger.error(`Error checking password for user ${login}: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  })
  return observable;
}


service.createUser = createUser
service.checkLogin = checkLogin
service.getUserInfo = getUserInfo

module.exports = service;
