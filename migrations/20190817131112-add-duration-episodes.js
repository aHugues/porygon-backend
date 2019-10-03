/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

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
  db.addColumn('Movie', 'duration', {
    type: 'int',
    notNull: true,
    defaultValue: 0,
  }, (err) => {
    if (err) return callback(err);
    return db.addColumn('Serie', 'episodes', {
      type: 'int',
      notNull: true,
      defaultValue: 0,
    }, (err2) => {
      if (err2) return callback(err2);
      return callback();
    });
  });
};

exports.down = function (db, callback) {
  db.removeColumn('Movie', 'duration', (err) => {
    if (err) return callback(err);
    return db.removeColumn('Serie', 'episodes', (err2) => {
      if (err2) return callback(err2);
      return callback();
    });
  });
};

exports._meta = {
  version: 1,
};
