const rxjs = require('rxjs');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');

const service = {};

const getAllMovies = (query) => {
  // Get the fields selector
  let { attributes } = query;
  if (attributes) {
    attributes = attributes.split(',');
  }

  // Gets the search parameters, replaces with '%' if none provided
  const searchArray = [
    ['title', '%'],
    ['location', '%'],
    ['director', '%'],
    ['actors', '%'],
    ['year', '%'],
  ];
  for (let i = 0; i < searchArray.length; i += 1) {
    if (query[searchArray[i][0]] && query[searchArray[i][0]] !== 'null' && query[searchArray[i][0]] !== 'undefined') {
      searchArray[i][1] = query[searchArray[i][0]];
      if (i !== 1 && i !== 3) {
        searchArray[i][1] = `%${searchArray[i][1]}%`;
      }
    }
  }

  // Gets the sorting parameters
  const order = ['title', 'asc']; // Default values
  const secondaryOrder = ['title', 'asc']; // Secondary value for sorting
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
    knex('Movie').where(knex.raw('LOWER(`title`)'), 'like', searchArray[0][1])
      .where(knex.raw('LOWER(`director`)'), 'like', searchArray[2][1])
      .where(knex.raw('LOWER(`actors`)'), 'like', searchArray[3][1])
      .where('year', 'like', searchArray[4][1])
      .where('location_id', 'like', searchArray[1][1])
      .orderBy(order[0], order[1], secondaryOrder[0], secondaryOrder[1])
      .offset(offset)
      .limit(limit)
      .join('Location', 'Location.id', 'Movie.location_id')
      .leftJoin('Category', 'Category.id', 'Movie.category_id')
      .options({ nestTables: true })
      .select(attributes)
      .then((movies) => {
        obs.next(movies);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const getMovieById = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('Movie.id', id)
      .join('Location', 'Location.id', 'Movie.location_id')
      .leftJoin('Category', 'Category.id', 'Movie.category_id')
      .options({ nestTables: true })
      .then((movie) => {
        if (movie.length < 1) {
          const error = new Error(`Movie with id ${id} not found.`);
          throw error;
        } else {
          const result = movie[0].Movie;
          result.location = movie[0].Location;
          result.category = movie[0].Category;
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


const createMovie = (fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').insert(cleanup.removeNulls(fields))
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


const updateMovie = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('id', id).update(cleanup.removeNulls(fields))
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


const deleteMovie = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('id', id).delete()
      .then(() => {
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const countMovies = (queryTitle) => {
  let title = '%';
  if (typeof queryTitle !== 'undefined') {
    title = `%${queryTitle}%`;
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where(knex.raw('LOWER(`title`)'), 'like', title).count('* as count')
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

service.getAllMovies = getAllMovies;
service.getMovieById = getMovieById;
service.createMovie = createMovie;
service.updateMovie = updateMovie;
service.deleteMovie = deleteMovie;
service.countMovies = countMovies;

module.exports = service;
