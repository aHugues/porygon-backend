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
    db.createTable.bind(db, 'MovieCategoryMapping', {
      id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      movieId: {
        type: 'int',
        notNull: true,
      },
      categoryId: {
        type: 'int',
        notNull: true,
      },
    }),
    db.createTable.bind(db, 'SerieCategoryMapping', {
      id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      serieId: {
        type: 'int',
        notNull: true,
      },
      categoryId: {
        type: 'int',
        notNull: true,
      },
    }),
  ], callback);
};

exports.down = function (db, callback) {
  async.series([
    db.dropTable.bind(db, 'MovieCategoryMapping'),
    db.dropTable.bind(db, 'SerieCategoryMapping'),
  ], callback);
};

exports._meta = {
  version: 1,
};
