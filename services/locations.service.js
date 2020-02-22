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


const getAllLocations = async () => {
  logger.debug('Getting all locations');
  const locations = await knex('Location').select();
  logger.debug(`Found locations ${JSON.stringify(locations)}`);
  return locations;
};


const getLocationById = async (id) => {
  logger.debug(`Getting location with id ${id}`);
  const rows = await knex('Location').where('id', id).select();
  if (rows.length !== 1) {
    const error = new Error(`Location with id ${id} not found.`);
    error.statusCode = 404;
    throw error;
  } else {
    logger.debug(`Found location with id ${id}: ${JSON.stringify(rows)}`);
    return rows;
  }
};


const createLocation = async (fields) => {
  logger.debug(`Creating location with fields ${JSON.stringify(fields)}`);
  const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, fields);
  if (!valid) throw FieldsVerification.createErrorInvalidField(invalidField);
  const instance = await knex('Location').insert(cleanup.removeNulls(fields));
  logger.debug('Location successfully created');
  return instance;
};


const updateLocation = async (id, fields) => {
  logger.debug(`Updating location with id ${id} using fields ${JSON.stringify(fields)}`);
  const [valid, invalidField] = FieldsVerification.checkFields(AUTHORIZED_FIELDS, fields);
  if (!valid) throw FieldsVerification.createErrorInvalidField(invalidField);
  const affectedRows = await knex('Location').where('id', id).update(cleanup.removeNulls(fields));
  logger.debug(affectedRows > 0 ? 'Location successfully modified' : 'No modification');
  return affectedRows > 0;
};


const deleteLocation = async (id) => {
  logger.debug(`Deleting location with id ${id}`);
  await knex('Location').where('id', id).delete();
  logger.debug(`Location ${id} successfully deleted`);
};


const countForLocations = async () => {
  logger.debug('Counting elements for all locations');
  logger.debug('Getting mapping for movies');
  const movieQueryRes = await knex('Movie')
    .join('Location', 'Location.id', 'Movie.location_id')
    .select('location_id', 'location')
    .groupBy('location_id')
    .count();
  logger.debug('Getting mapping for series');
  const serieQueryRes = await knex('Serie')
    .join('Location', 'Location.id', 'Serie.location_id')
    .select('location_id', 'location')
    .groupBy('location_id')
    .count();
  logger.debug('Getting all locations');
  const locations = await getAllLocations();

  const movieIdCountMapping = {};
  const serieIdCountMapping = {};
  movieQueryRes.forEach((line) => { movieIdCountMapping[line.location_id] = line['count(*)']; });
  serieQueryRes.forEach((line) => { serieIdCountMapping[line.location_id] = line['count(*)']; });

  const result = locations.map((line) => ({
    id: line.id,
    location: line.location,
    movie_count: movieIdCountMapping[line.id] || 0,
    serie_count: serieIdCountMapping[line.id] || 0,
  }));
  return result;
};


const countForLocation = async (id) => {
  logger.debug(`Getting information for location ${id}`);
  const locationInfo = await getLocationById(id);
  logger.debug(`Counting elements in location ${id}`);
  const movieQueryRes = await knex('Movie').where('location_id', id).count();
  const nbMovies = movieQueryRes[0]['count(*)'];
  logger.debug(`Found ${nbMovies} movies`);
  const serieQueryRes = await knex('Serie').where('location_id', id).count();
  const nbSeries = serieQueryRes[0]['count(*)'];
  logger.debug(`Found ${nbSeries} series`);

  return {
    id,
    location: locationInfo[0].location,
    movie_count: nbMovies,
    serie_count: nbSeries,
  };
};


service.getAllLocations = getAllLocations;
service.getLocationById = getLocationById;
service.createLocation = createLocation;
service.updateLocation = updateLocation;
service.deleteLocation = deleteLocation;
service.countForLocations = countForLocations;
service.countForLocation = countForLocation;

module.exports = service;
