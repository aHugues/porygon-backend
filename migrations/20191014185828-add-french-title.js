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
  db.addColumn('Movie', 'french_title', {
    type: 'string',
    notNull: true,
    defaultValue: '',
  }, (err) => {
    if (err) return callback(err);
    return callback();
  });
};

exports.down = function (db, callback) {
  db.removeColumn('Movie', 'french_title', callback);
};

exports._meta = {
  version: 1,
};
