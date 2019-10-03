const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.config.json')[env];

config.connection = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
};

module.exports = require('knex')(config);
