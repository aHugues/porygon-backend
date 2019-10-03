const rxjs = require('rxjs');

const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');

const service = {};

const getAllCategories = (query) => {
  // Get the fields selector
  let { attributes } = query;
  if (attributes) {
    attributes = attributes.split(',');
  }

  let labelSearch = '%';
  // Gets the search parameters, replaces with '%' if none provided
  if (query.category) {
    labelSearch = `%${query.category}%`;
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
        obs.next(categories);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const getCategoryById = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Category').where('id', id).select()
      .then((rows) => {
        if (rows.length !== 1) {
          const error = new Error(`Category with id ${id} not found.`);
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


const createCategory = (fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Category').insert(cleanup.removeNulls(fields))
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


const updateCategory = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Category').where('id', id).update(cleanup.removeNulls(fields))
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


const deleteCategory = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Category').where('id', id).delete()
      .then(() => {
        obs.complete();
      })
      .catch((error) => {
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
