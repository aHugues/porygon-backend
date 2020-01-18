const rxjs = require('rxjs');
const log4js = require('log4js');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');
const FieldsVerification = require('../middlewares/fields_verification');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');

const AUTHORIZED_FIELDS = [
  'label',
  'description',
];

const service = {};


const getAllCategories = (query) => {
  logger.debug(`Getting all categories with query ${JSON.stringify(query)}`);
  // Get the fields selector
  let { attributes } = query;
  if (attributes) {
    attributes = attributes.split(',');
  }

  let labelSearch = '%';
  // Gets the search parameters, replaces with '%' if none provided
  if (query.label) {
    labelSearch = `%${query.label}%`;
  }

  // Gets the sorting parameters
  const order = ['label', 'asc']; // Default values
  if (query.sort) {
    if (query.sort[0] === '-') {
      order[1] = 'desc';
      order[0] = query.sort.substring(1);
    } else {
      order[0] = query.sort;
    }
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Category').where(knex.raw('LOWER(`label`)'), 'like', labelSearch).orderBy(order[0], order[1]).select(attributes)
      .then((categories) => {
        logger.debug(`Found categories ${JSON.stringify(categories)}`);
        obs.next(categories);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when getting categories: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const getCategoryById = (id) => {
  logger.debug(`Getting category with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Category').where('id', id).select()
      .then((rows) => {
        if (rows.length !== 1) {
          const error = new Error(`Category with id ${id} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          logger.debug(`Found category with id ${id}: ${JSON.stringify(rows[0])}`);
          obs.next(rows[0]);
          obs.complete();
        }
      })
      .catch((error) => {
        logger.error(`Error when looking for category: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const createCategory = (fields) => {
  logger.debug(`Creating category with fields ${JSON.stringify(fields)}`);
  const observable = rxjs.Observable.create((obs) => {
    const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, fields);
    if (!valid) obs.error(FieldsVerification.createErrorInvalidField(invalidField));
    knex('Category').insert(cleanup.removeNulls(fields))
      .then((instance) => {
        logger.debug('Category successfully created');
        obs.next(instance);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when creating category: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const updateCategory = (id, fields) => {
  logger.debug(`Updating category with id ${id} using fields ${JSON.stringify(fields)}`);
  const observable = rxjs.Observable.create((obs) => {
    const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, fields);
    if (!valid) obs.error(FieldsVerification.createErrorInvalidField(invalidField));
    knex('Category').where('id', id).update(cleanup.removeNulls(fields))
      .then((affectedRows) => {
        logger.debug(affectedRows > 0 ? 'Category successfully modified' : 'No modification');
        obs.next(affectedRows > 0);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when modifying category: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const deleteCategory = (id) => {
  logger.debug(`Deleting category with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Category').where('id', id).delete()
      .then(() => {
        logger.debug(`category ${id} successfully deleted`);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when deleting category: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


service.getAllCategories = getAllCategories;
service.getCategoryById = getCategoryById;
service.createCategory = createCategory;
service.updateCategory = updateCategory;
service.deleteCategory = deleteCategory;

module.exports = service;
