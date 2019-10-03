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
    db.addColumn.bind(db, 'Movie', 'category_id', {
      type: 'int',
      notNull: false,
    }),
    db.runSql.bind(db, 'ALTER TABLE `Movie` ADD CONSTRAINT `movie_category_fk`'
    + 'FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`) ON '
    + 'DELETE CASCADE ON UPDATE RESTRICT;'),
    db.addColumn.bind(db, 'Serie', 'category_id', {
      type: 'int',
      notNull: false,
    }),
    db.runSql.bind(db, 'ALTER TABLE `Serie` ADD CONSTRAINT `serie_category_fk`'
    + 'FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`) ON '
    + 'DELETE CASCADE ON UPDATE RESTRICT;'),
  ], callback);
};

exports.down = function (db, callback) {
  async.series([
    db.removeColumn.bind(db, 'Movie', 'category_id'),
    db.removeColumn.bind(db, 'Serie', 'category_id'),
  ], callback);
};

exports._meta = {
  version: 1,
};
