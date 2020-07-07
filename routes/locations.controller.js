const express = require('express');
const Joi = require('@hapi/joi');

const router = express.Router();

const LocationsService = require('../services/locations.service');
const cleanup = require('../middlewares/cleanup');


const createLocationSchema = Joi.object({
  location: Joi.string()
    .min(1)
    .max(255)
    .required(),
  is_physical: Joi.bool().required(),
});


const editLocationSchema = Joi.object({
  location: Joi.string()
    .min(1)
    .max(255),
  is_physical: Joi.bool(),
});


const getAllLocations = (req, res, next) => {
  LocationsService.getAllLocations()
    .then((locations) => res.json(locations))
    .catch((err) => next(err));
};


const createLocation = (req, res, next) => {
  const { error, value } = createLocationSchema.validate(cleanup.removeNulls(req.body, true));
  if (error) next(error);
  else {
    LocationsService.createLocation(value)
      .then(() => {
        res.status(201).json({
          code: 201,
          userMessage: 'Location successfully created',
        });
      })
      .catch((err) => next(err));
  }
};


const getLocationById = (req, res, next) => {
  LocationsService.getLocationById(req.params.id)
    .then((location) => res.json(location))
    .catch((err) => next(err));
};


const countForLocation = (req, res, next) => {
  LocationsService.countForLocation(req.params.id)
    .then((count) => res.json(count))
    .catch((err) => next(err));
};


const countForLocations = (req, res, next) => {
  LocationsService.countForLocations()
    .then((count) => res.json(count))
    .catch((err) => next(err));
};


const updateLocation = (req, res, next) => {
  const { error, value } = editLocationSchema.validate(req.body);
  if (error) next(error);
  else {
    LocationsService.updateLocation(req.params.id, value)
      .then((modified) => res.status(modified ? 205 : 204).send())
      .catch((err) => next(err));
  }
};


const deleteLocation = (req, res, next) => {
  LocationsService.deleteLocation(req.params.id)
    .then(() => res.status(204).send())
    .catch((err) => next(err));
};


router.get('/', getAllLocations);
router.post('/', createLocation);
router.get('/count/', countForLocations);
router.get('/:id/count/', countForLocation);
router.get('/:id', getLocationById);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);


module.exports = router;
