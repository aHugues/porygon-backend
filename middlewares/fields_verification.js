const log4js = require('log4js');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');
const middleware = {};

function createErrorInvalidField(field) {
  logger.error(`Found invalid field '${field} in request`);
  const message = `Unauthorized field '${field}' in query`;
  return {
    message,
    status: 400,
  };
}

function checkFields(authorizedFields, fields) {
  logger.debug(`Checking fields ${JSON.stringify(fields)}, authorized fields are [${authorizedFields}]`);
  let valid = true;
  let returnedField = null;
  Object.keys(fields).forEach((field) => {
    if (!authorizedFields.includes(field)) {
      valid = false;
      returnedField = field;
    }
  });
  logger.debug(valid ? 'Fields are all valid.' : `Field ${returnedField} is invalid`);
  return [valid, returnedField];
}

function checkNewUser(user) {
  let valid = true
  const neededFields = ['login', 'firstName', 'lastName', 'password'];
  const providedFields = Object.keys(user);
  neededFields.forEach((field) => {
    if (!providedFields.includes(field)) {
      valid = false
    }
  }, neededFields)
  return valid
}


middleware.createErrorInvalidField = createErrorInvalidField;
middleware.checkFields = checkFields;
middleware.checkNewUser = checkNewUser;

module.exports = middleware;
