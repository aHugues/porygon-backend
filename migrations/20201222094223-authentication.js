/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable('User', {
    uuid: {
      type: 'string',
      primaryKey: true,
      notNull: true,
    },
    login: {
      type: 'string',
      notNull: true,
    },
    password: {
      type: 'string',
      notNull: true,
    },
    firstName: {
      type: 'string',
      notNull: true,
    },
    lastName: {
      type: 'string',
      notNull: true,
    },
    email: {
      type: 'string',
      notNull: false,
    },
  }, (err) => {
    if (err) return callback(err);
    return callback();
  });
};

exports.down = function(db, callback) {
  db.dropTable('User', callback);
};

exports._meta = {
  "version": 1
};
