const rxjs = require('rxjs');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');

const service = {};

const getAllSeries = (query) => {
  // Get the fields selector
  let { attributes } = query;
  if (attributes) {
    attributes = attributes.split(',');
  }

  // Gets the search parameters, replaces with '%' if none provided
  const searchArray = [
    ['title', '%'],
    ['location', '%'],
    ['season', '%'],
  ];
  for (let i = 0; i < searchArray.length; i += 1) {
    if (query[searchArray[i][0]] && query[searchArray[i][0]] !== 'null' && query[searchArray[i][0]] !== 'undefined') {
      searchArray[i][1] = query[searchArray[i][0]];
      if (i !== 1 && i !== 2) {
        searchArray[i][1] = `%${searchArray[i][1]}%`;
      }
    }
  }

  // Gets the sorting parameters
  const order = ['title', 'asc']; // Default values
  const secondaryOrder = ['title', 'asc']; // Secondary value for sorting
  const tertiaryOrder = ['location', 'asc']; // Tertiary value for sorting
  const lastOrder = ['season', 'asc']; // Last value for sorting
  if (query.sort) {
    if (query.sort[0] === '-') {
      order[1] = 'desc';
      order[0] = query.sort.substring(1);
    } else {
      order[0] = query.sort;
    }
  }

  // Gets the page related parameters
  let offset = 0;
  let limit = 99999; // Large number to get everything
  if (query.offset) {
    offset = parseInt(query.offset, 10);
  }
  if (query.limit) {
    limit = parseInt(query.limit, 10);
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where(knex.raw('LOWER(`title`)'), 'like', searchArray[0][1])
      .where('location_id', 'like', searchArray[1][1])
      .where('season', 'like', searchArray[2][1])
      .orderBy(order[0], order[1], secondaryOrder[0], secondaryOrder[1],
        tertiaryOrder[0], tertiaryOrder[1], lastOrder[0], lastOrder[1])
      .offset(offset)
      .limit(limit)
      .join('Location', 'Location.id', 'Serie.location_id')
      .leftJoin('Category', 'Category.id', 'Serie.category_id')
      .options({ nestTables: true })
      .select(attributes)
      .then((series) => {
        obs.next(series);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const getSerieById = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where('Serie.id', id)
      .join('Location', 'Location.id', 'Serie.location_id')
      .leftJoin('Category', 'Category.id', 'Serie.category_id')
      .options({ nestTables: true })
      .then((serie) => {
        if (serie.length < 1) {
          const error = Error(`Serie with id ${id} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          const result = serie[0].Serie;
          result.location = serie[0].Location;
          result.category = serie[0].Category;
          obs.next(result);
          obs.complete();
        }
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const createSerie = (fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').insert(cleanup.removeNulls(fields))
      .then((instance) => {
        obs.next(instance);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const updateSerie = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where('id', id).update(cleanup.removeNulls(fields))
      .then((affectedRows) => {
        obs.next(affectedRows > 0);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const deleteSerie = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where('id', id).delete()
      .then(() => {
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const countSeries = (queryTitle) => {
  let title = '%';
  if (typeof queryTitle !== 'undefined') {
    title = `%${queryTitle}%`;
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where(knex.raw('LOWER(`title`)'), 'like', title).count('* as count')
      .then((count) => {
        obs.next(count[0]);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};

service.getAllSeries = getAllSeries;
service.getSerieById = getSerieById;
service.createSerie = createSerie;
service.updateSerie = updateSerie;
service.deleteSerie = deleteSerie;
service.countSeries = countSeries;

module.exports = service;
