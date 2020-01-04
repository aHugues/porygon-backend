const rxjs = require('rxjs');
const log4js = require('log4js');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');

const AUTHORIZED_FIELDS = [
  'location_id',
  'title',
  'remarks',
  'actors',
  'season',
  'episodes',
  'year',
  'is_dvd',
  'is_bluray',
  'is_digital',
  'category_id',
];

const service = {};

function createErrorInvalidField(field) {
  logger.error(`Found invalid field '${field} in request`);
  const message = `Unauthorized field '${field}' in query`;
  return {
    message,
    status: 400,
  };
}

const getAllSeries = (query) => {
  logger.debug(`Getting all series with query ${JSON.stringify(query)}`);
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
        logger.debug(`Found series ${JSON.stringify(series)}`);
        obs.next(series);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when getting series: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const getSerieById = (id) => {
  logger.debug(`Getting serie with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where('Serie.id', id)
      .join('Location', 'Location.id', 'Serie.location_id')
      .leftJoin('Category', 'Category.id', 'Serie.category_id')
      .options({ nestTables: true })
      .then((serie) => {
        if (serie.length < 1) {
          const error = Error(`Serie with id ${id} not found.`);
          error.status = 404;
          throw error;
        } else {
          const result = serie[0].Serie;
          result.location = serie[0].Location;
          result.category = serie[0].Category;
          logger.debug(`Found serie with id ${id}: ${JSON.stringify(result)}`);
          obs.next(result);
          obs.complete();
        }
      })
      .catch((error) => {
        logger.error(`Error when looking for serie: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const createSerie = (fields) => {
  logger.debug(`Creating serie with fields ${JSON.stringify(fields)}`);
  const observable = rxjs.Observable.create((obs) => {
    Object.keys(fields).forEach((field) => {
      if (!AUTHORIZED_FIELDS.includes(field)) obs.error(createErrorInvalidField(field));
    });
    knex('Serie').insert(cleanup.removeNulls(fields))
      .then((instance) => {
        logger.debug('Serie successfully created');
        obs.next(instance);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when creating serie: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const updateSerie = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    logger.debug(`Updating serie with id ${id} using fields ${JSON.stringify(fields)}`);
    Object.keys(fields).forEach((field) => {
      if (!AUTHORIZED_FIELDS.includes(field)) obs.error(createErrorInvalidField(field));
    });
    knex('Serie').where('id', id).update(cleanup.removeNulls(fields))
      .then((affectedRows) => {
        logger.debug(affectedRows > 0 ? 'Serie successfully modified' : 'No modification');
        obs.next(affectedRows > 0);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when modifying serie: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const deleteSerie = (id) => {
  logger.debug(`Deleting serie with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where('id', id).delete()
      .then(() => {
        logger.debug(`Serie ${id} successfully deleted`);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when deleting serie: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const countSeries = (queryTitle) => {
  logger.debug(`Counting series with query ${queryTitle}`);
  let title = '%';
  if (typeof queryTitle !== 'undefined') {
    title = `%${queryTitle}%`;
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Serie').where(knex.raw('LOWER(`title`)'), 'like', title).count('* as count')
      .then((count) => {
        logger.debug(`Found ${count[0]} series`);
        obs.next(count[0]);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when counting series: ${JSON.stringify(error)}`);
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
