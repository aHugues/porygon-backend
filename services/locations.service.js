const rxjs = require('rxjs');

const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');

const service = {};

const getAllLocations = (query) => {
  // Get the fields selector
  let { attributes } = query;
  if (attributes) {
    attributes = attributes.split(',');
  }

  let labelSearch = '%';
  // Gets the search parameters, replaces with '%' if none provided
  if (query.location) {
    labelSearch = `%${query.location}%`;
  }

  // Gets the sorting parameters
  const order = ['location', 'asc']; // Default values
  if (query.sort) {
    if (query.sort[0] === '-') {
      order[1] = 'desc';
      order[0] = query.sort.substring(1);
    } else {
      order[0] = query.sort;
    }
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Location').where(knex.raw('LOWER(`location`)'), 'like', labelSearch).orderBy(order[0], order[1]).select(attributes)
      .then((locations) => {
        obs.next(locations);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const getLocationById = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Location').where('id', id).select()
      .then((rows) => {
        if (rows.length !== 1) {
          const error = new Error(`Movie with id ${id} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          obs.next(rows);
          obs.complete();
        }
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const createLocation = (fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Location').insert(cleanup.removeNulls(fields))
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


const updateLocation = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Location').where('id', id).update(cleanup.removeNulls(fields))
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


const deleteLocation = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Location').where('id', id).delete()
      .then(() => {
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const countForLocation = (id) => {
  let moviesCompleted = false;
  let seriesCompleted = false;
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('location_id', id).count()
      .then((count) => {
        obs.next(['movies', count[0]['count(*)']]);
        moviesCompleted = true;
        if (seriesCompleted) {
          obs.complete();
        }
      })
      .catch((error) => {
        obs.error(error);
      });

    knex('Serie').where('location_id', id).count()
      .then((count) => {
        obs.next(['series', count[0]['count(*)']]);
        seriesCompleted = true;
        if (moviesCompleted) {
          obs.complete();
        }
      })
      .catch((error) => {
        obs.error(error);
      });
  });

  return observable;
};


service.getAllLocations = getAllLocations;
service.getLocationById = getLocationById;
service.createLocation = createLocation;
service.updateLocation = updateLocation;
service.deleteLocation = deleteLocation;
service.countForLocation = countForLocation;

module.exports = service;
