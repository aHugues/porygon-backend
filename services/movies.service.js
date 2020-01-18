const rxjs = require('rxjs');
const log4js = require('log4js');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');
const FieldsVerification = require('../middlewares/fields_verification');

const env = process.env.NODE_ENV || 'development';
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');

const AUTHORIZED_FIELDS = [
  'location_id',
  'title',
  'remarks',
  'actors',
  'year',
  'duration',
  'is_dvd',
  'is_bluray',
  'is_digital',
  'categories',
  'director',
  'french_title',
];


const service = {};


const getAllMovies = (query) => {
  logger.debug(`Getting all movies with query ${JSON.stringify(query)}`);
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
      .leftJoin('MovieCategoryMapping', 'MovieCategoryMapping.movieId', 'Movie.id')
      .leftOuterJoin('Category', 'Category.id', 'MovieCategoryMapping.categoryId')
      .options({ nestTables: true })
      .select(attributes)
      .then((movies) => {
        let result = [];
        const parsedIds = [];
        movies.forEach((movie) => {
          if (parsedIds.includes(movie.Movie.id)) {
            result = result.map((res) => {
              if (res.Movie.id === movie.Movie.id) {
                res.Categories.push(movie.Category);
              }
              return res;
            });
          } else {
            const newMovie = movie;
            const category = movie.Category;
            newMovie.Categories = [category];
            delete newMovie.Category;
            delete newMovie.MovieCategoryMapping;
            result.push(newMovie);
            parsedIds.push(newMovie.Movie.id);
          }
        });

        logger.debug(`Found movies ${JSON.stringify(result)}`);
        obs.next(result);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when getting movies: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const getMovieById = (id) => {
  logger.debug(`Getting movie with id ${id}`);
  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('Movie.id', id)
      .join('Location', 'Location.id', 'Movie.location_id')
      .leftJoin('MovieCategoryMapping', 'MovieCategoryMapping.movieId', 'Movie.id')
      .join('Category', 'Category.id', 'MovieCategoryMapping.categoryId')
      .options({ nestTables: true })
      .then((movie) => {
        if (movie.length < 1) {
          const error = new Error(`Movie with id ${id} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          const result = movie[0].Movie;
          result.location = movie[0].Location;
          result.categories = [];
          movie.forEach((elt) => {
            result.categories.push(elt.Category);
          });
          logger.debug(`Found movie with id ${id}: ${JSON.stringify(result)}`);
          obs.next(result);
          obs.complete();
        }
      })
      .catch((error) => {
        logger.error(`Error when looking for movie: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const createMovie = (fields) => {
  logger.debug(`Creating movie with fields ${JSON.stringify(fields)}`);
  const categoryIds = (fields && fields.categories) ? fields.categories : [];
  const updatedFields = fields;
  if (updatedFields) updatedFields.categories = null;

  const observable = rxjs.Observable.create((obs) => {
    const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, updatedFields);
    if (!valid) obs.error(FieldsVerification.createErrorInvalidField(invalidField));

    knex('Movie').insert(cleanup.removeNulls(updatedFields))
      .then((instance) => {
        const movieId = instance[0];
        obs.next(instance);
        logger.debug(`Movie successfully created with ID ${movieId}`);
        if (categoryIds.length === 0) obs.complete();
        else {
          const rows = [];
          categoryIds.forEach((categoryId) => {
            rows.push({ movieId, categoryId });
          });

          knex('MovieCategoryMapping').insert(rows)
            .then(() => {
              logger.debug('Mapping successfully created');
              obs.complete();
            })
            .catch((error) => {
              logger.error(`Error when adding mapping: ${JSON.stringify(error)}`);
              obs.error(error);
            });
        }
      })
      .catch((error) => {
        logger.error(`Error when creating movie: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const updateMovie = (id, fields) => {
  logger.debug(`Updating movie with id ${id} using fields ${JSON.stringify(fields)}`);
  const categoryIds = fields ? fields.categories : [];
  const updatedFields = fields;
  if (fields && fields.categories) updatedFields.categories = null;

  const observable = rxjs.Observable.create((obs) => {
    let movieUpdated = false;
    let mappingUpdated = false;

    const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, updatedFields);
    if (!valid) obs.error(FieldsVerification.createErrorInvalidField(invalidField));

    knex('Movie').where('id', id).update(cleanup.removeNulls(updatedFields))
      .then((affectedRows) => {
        logger.debug(affectedRows > 0 ? 'Movie successfully modified' : 'No modification');
        obs.next(affectedRows > 0);
        movieUpdated = true;
        if (mappingUpdated) obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when modifying movie: ${JSON.stringify(error)}`);
        obs.error(error);
      });

    if (categoryIds) {
      const rows = [];
      categoryIds.forEach((categoryId) => {
        rows.push({ movieId: id, categoryId });
      });

      knex('MovieCategoryMapping').where('movieId', id).delete()
        .then(() => {
          logger.debug(`Old categories for movie ${id} successfully deleted`);
          knex('MovieCategoryMapping').insert(rows)
            .then(() => {
              logger.debug('Mapping successfully updated');
              mappingUpdated = true;
              if (movieUpdated) obs.complete();
            })
            .catch((error) => {
              logger.error(`Error when adding mapping: ${JSON.stringify(error)}`);
              obs.error(error);
            });
        })
        .catch((error) => {
          logger.error(`Error when removing old mapping: ${JSON.stringify(error)}`);
          obs.error(error);
        });
    } else {
      if (movieUpdated) obs.complete();
      mappingUpdated = true;
    }
  });
  return observable;
};


const deleteMovie = (id) => {
  logger.debug(`Deleting movie with id ${id}`);
  let movieDeleted = false;
  let mappingDeleted = false;

  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where('id', id).delete()
      .then(() => {
        logger.debug(`Movie ${id} successfully deleted`);
        movieDeleted = true;
        if (mappingDeleted) obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when deleting movie: ${JSON.stringify(error)}`);
        obs.error(error);
      });

    knex('MovieCategoryMapping').where('movieId', id).delete()
      .then(() => {
        logger.debug(`Categories for movie ${id} successfully deleted`);
        mappingDeleted = true;
        if (movieDeleted) obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when removing old mapping: ${JSON.stringify(error)}`);
        obs.error(error);
      });
  });
  return observable;
};


const countMovies = (queryTitle) => {
  logger.debug(`Counting movies with query ${queryTitle}`);
  let title = '%';
  if (typeof queryTitle !== 'undefined') {
    title = `%${queryTitle}%`;
  }

  const observable = rxjs.Observable.create((obs) => {
    knex('Movie').where(knex.raw('LOWER(`title`)'), 'like', title).count('* as count')
      .then((count) => {
        logger.debug(`Found ${count[0]} movies`);
        obs.next(count[0]);
        obs.complete();
      })
      .catch((error) => {
        logger.error(`Error when counting movies: ${JSON.stringify(error)}`);
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
