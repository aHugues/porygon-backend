const rxjs = require('rxjs');
const log4js = require('log4js');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');
const FieldsVerification = require('../middlewares/fields_verification');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');

const AUTHORIZED_FIELDS = [
  'location',
  'is_physical',
];

const service = {};


const getAllLocations = (query) => {
  logger.debug(`Getting all locations with query ${JSON.stringify(query)}`);
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
        logger.debug(`Found locations ${JSON.stringify(locations)}`);
        obs.next(locations);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when getting locations: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const getLocationById = (id) => {
  logger.debug(`Getting location with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Location').where('id', id).select()
      .then((rows) => {
        if (rows.length !== 1) {
          const error = new Error(`Location with id ${id} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          logger.debug(`Found location with id ${id}: ${JSON.stringify(rows)}`);
          obs.next(rows);
          obs.complete();
        }
      })
      .catch((error) => {
        logger.error(`Error when looking for location: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const createLocation = (fields) => {
  logger.debug(`Creating location with fields ${JSON.stringify(fields)}`);
  const observable = rxjs.Observable.create((obs) => {
    const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, fields);
    if (!valid) obs.error(FieldsVerification.createErrorInvalidField(invalidField));
    knex('Location').insert(cleanup.removeNulls(fields))
      .then((instance) => {
        logger.debug('Location successfully created');
        obs.next(instance);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when creating location: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const updateLocation = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    logger.debug(`Updating location with id ${id} using fields ${JSON.stringify(fields)}`);
    const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, fields);
    if (!valid) obs.error(FieldsVerification.createErrorInvalidField(invalidField));
    knex('Location').where('id', id).update(cleanup.removeNulls(fields))
      .then((affectedRows) => {
        logger.debug(affectedRows > 0 ? 'Location successfully modified' : 'No modification');
        obs.next(affectedRows > 0);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when modifying location: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const deleteLocation = (id) => {
  logger.debug(`Deleting location with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Location').where('id', id).delete()
      .then(() => {
        logger.debug(`Location ${id} successfully deleted`);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when deleting location: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const countForLocation = (id) => {
  logger.debug(`Counting elements in location ${id}`);
  let moviesCompleted = false;
  let seriesCompleted = false;
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('location_id', id).count()
      .then((count) => {
        logger.debug(`Found ${count[0]['count(*)']} movies`);
        obs.next(['movies', count[0]['count(*)']]);
        moviesCompleted = true;
        if (seriesCompleted) {
          logger.debug('Series already completed.');
          obs.complete();
        }
      })
      .catch((error) => {
        logger.error(`Error when counting movies: ${JSON.stringify(error)}`);
        obs.error(error);
      });

    knex('Serie').where('location_id', id).count()
      .then((count) => {
        logger.debug(`Found ${count[0]['count(*)']} series`);
        obs.next(['series', count[0]['count(*)']]);
        seriesCompleted = true;
        if (moviesCompleted) {
          logger.debug('Movies already completed.');
          obs.complete();
        }
      })
      .catch((error) => {
        logger.error(`Error when counting series: ${JSON.stringify(error)}`);
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
