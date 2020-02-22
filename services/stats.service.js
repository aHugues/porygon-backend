const log4js = require('log4js');
const knex = require('./database.service');

/* istanbul ignore next */
const env = process.env.NODE_ENV || 'development';

/* istanbul ignore next */
const logger = log4js.getLogger(env === 'development' ? 'dev' : 'prod');

const service = {};


const countMoviesByYear = async () => {
  logger.debug('Count movies by year');
  const rows = await knex('Movie')
    .select('year')
    .groupBy('year')
    .orderBy('year')
    .count();
  logger.debug(`Found movies from ${rows.length} different years`);
  return rows.map((row) => ({ year: row.year, movie_count: row['count(*)'] }));
};


const countSeriesByYear = async () => {
  logger.debug('Count series by year');
  const rows = await knex('Serie')
    .select('year')
    .groupBy('year')
    .orderBy('year')
    .count();
  logger.debug(`Found series from ${rows.length} different years`);
  return rows.map((row) => ({ year: row.year, serie_count: row['count(*)'] }));
};

const getFullStats = async () => {
  logger.debug('Counting all movies');
  const movieRawResult = await knex('Movie').select().count();
  const movieCount = movieRawResult[0]['count(*)'];
  logger.debug(`Found ${movieCount} movies`);

  logger.debug('Counting all series');
  const serieRawResult = await knex('Serie').select().count();
  const serieCount = serieRawResult[0]['count(*)'];
  logger.debug(`Found ${serieCount} series`);

  logger.debug('Counting all locations');
  const locationRawResult = await knex('Location').select().count();
  const locationCount = locationRawResult[0]['count(*)'];
  logger.debug(`Found ${locationCount} locations`);

  logger.debug('Counting all categories');
  const categoryRawResult = await knex('Category').select().count();
  const categoryCount = categoryRawResult[0]['count(*)'];
  logger.debug(`Found ${categoryCount} categories`);

  return {
    movie_count: movieCount,
    serie_count: serieCount,
    location_count: locationCount,
    category_count: categoryCount,
  };
};


service.countMoviesByYear = countMoviesByYear;
service.countSeriesByYear = countSeriesByYear;
service.getFullStats = getFullStats;

module.exports = service;
