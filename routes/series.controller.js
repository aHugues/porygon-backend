const express = require('express');
const Joi = require('@hapi/joi');

const router = express.Router();

const SeriesService = require('../services/series.service');


const createSerieSchema = Joi.object({
  location_id: Joi.number()
    .min(0)
    .integer()
    .required(),
  title: Joi.string()
    .min(1)
    .max(255)
    .required(),
  remarks: Joi.string()
    .min(1)
    .max(255),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .required(),
  season: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required(),
  episodes: Joi.number()
    .integer()
    .min(0)
    .max(1000)
    .required(),
  is_bluray: Joi.bool(),
  is_dvd: Joi.bool(),
  is_digital: Joi.bool(),
  category_id: Joi.number()
    .integer()
    .min(0),
});


const editSerieSchema = Joi.object({
  location_id: Joi.number()
    .min(0)
    .integer(),
  title: Joi.string()
    .min(1)
    .max(255),
  remarks: Joi.string()
    .min(1)
    .max(255),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(2100),
  season: Joi.number()
    .integer()
    .min(0)
    .max(100),
  episodes: Joi.number()
    .integer()
    .min(0)
    .max(1000),
  is_bluray: Joi.bool(),
  is_dvd: Joi.bool(),
  is_digital: Joi.bool(),
  category_id: Joi.number()
    .integer()
    .min(0),
});


const getAllSeries = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  SeriesService.getAllSeries(req.query).subscribe(onNext, onError, onComplete);
};


const countSeries = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  SeriesService.countSeries(req.query.title).subscribe(onNext, onError, onComplete);
};


const createSerie = (req, res, next) => {
  const { error, value } = createSerieSchema.validate(req.body);
  if (error) next(error);
  else {
    const onNext = () => {};
    const onComplete = () => {
      res.status(201).json({
        code: 201,
        userMessage: 'Serie successfully created',
      });
    };
    const onError = (serviceError) => {
      next(serviceError);
    };

    SeriesService.createSerie(value).subscribe(onNext, onError, onComplete);
  }
};


const getSerieById = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  SeriesService.getSerieById(req.params.id).subscribe(onNext, onError, onComplete);
};


const updateSerie = (req, res, next) => {
  const { error, value } = editSerieSchema.validate(req.body);
  if (error) next(error);
  else {
    const onNext = (modified) => {
      if (modified) {
        res.status(205).send();
      } else {
        res.status(204).send();
      }
    };
    const onComplete = () => {};
    const onError = (serviceError) => {
      next(serviceError);
    };

    SeriesService.updateSerie(req.params.id, value).subscribe(onNext, onError, onComplete);
  }
};


const deleteSerie = (req, res, next) => {
  const onNext = () => {};
  const onComplete = () => {
    res.status(204).send();
  };
  const onError = (error) => {
    if (error === 'not found') {
      res.status(404).send();
    }
    next(error);
  };

  SeriesService.deleteSerie(req.params.id).subscribe(onNext, onError, onComplete);
};


router.get('/', getAllSeries);
router.post('/', createSerie);
router.get('/count', countSeries);
router.get('/:id', getSerieById);
router.put('/:id', updateSerie);
router.delete('/:id', deleteSerie);

module.exports = router;
