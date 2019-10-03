/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

const async = require('async');

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  async.series([
    db.addColumn.bind(db, 'Movie', 'is_dvd', {
      type: 'boolean',
      notNull: true,
      defaultValue: false,
    }),
    db.addColumn.bind(db, 'Movie', 'is_bluray', {
      type: 'boolean',
      notNull: true,
      defaultValue: false,
    }),
    db.addColumn.bind(db, 'Movie', 'is_digital', {
      type: 'boolean',
      notNull: true,
      defaultValue: false,
    }),
  ], callback);
};

exports.down = function (db, callback) {
  async.series([
    db.removeColumn.bind(db, 'Movie', 'is_dvd'),
    db.removeColumn.bind(db, 'Movie', 'is_bluray'),
    db.removeColumn.bind(db, 'Movie', 'is_digital'),
  ], callback);
};

exports._meta = {
  version: 1,
};
