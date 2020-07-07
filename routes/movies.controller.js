const express = require('express');
const Joi = require('@hapi/joi');

const router = express.Router();

const MoviesService = require('../services/movies.service');
const cleanup = require('../middlewares/cleanup');


const createMovieSchema = Joi.object({
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
  actors: Joi.string()
    .min(1)
    .max(255),
  director: Joi.string()
    .min(1)
    .max(255),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .required(),
  duration: Joi.number()
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
  categories: Joi.array()
    .items(Joi.number().integer()),
  french_title: Joi.string()
    .min(1)
    .max(255),
});


const editMovieSchema = Joi.object({
  location_id: Joi.number()
    .integer()
    .min(0),
  title: Joi.string()
    .min(1)
    .max(255),
  remarks: Joi.string()
    .min(1)
    .max(255),
  actors: Joi.string()
    .min(1)
    .max(255),
  director: Joi.string()
    .min(1)
    .max(255),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(2100),
  duration: Joi.number()
    .integer()
    .min(0)
    .max(1000),
  is_bluray: Joi.bool(),
  is_dvd: Joi.bool(),
  is_digital: Joi.bool(),
  category_id: Joi.number()
    .integer()
    .min(0),
  categories: Joi.array()
    .items(Joi.number().integer()),
  french_title: Joi.string()
    .min(1)
    .max(255),
});


const getAllMovies = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };
  MoviesService.getAllMovies(req.query).subscribe(onNext, onError, onComplete);
};


const countMovies = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  MoviesService.countMovies(req.query.title).subscribe(onNext, onError, onComplete);
};


const createMovie = (req, res, next) => {
  const { error, value } = createMovieSchema.validate(cleanup.removeNulls(req.body, true));
  if (error) next(error);
  else {
    const onNext = () => {};
    const onComplete = () => {
      res.status(201).json({
        code: 201,
        userMessage: 'Movie successfully created',
      });
    };
    const onError = (serviceError) => {
      next(serviceError);
    };

    MoviesService.createMovie(value).subscribe(onNext, onError, onComplete);
  }
};


const getMovieById = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  MoviesService.getMovieById(req.params.id).subscribe(onNext, onError, onComplete);
};


const updateMovie = (req, res, next) => {
  const { error, value } = editMovieSchema.validate(cleanup.removeNulls(req.body, true));
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

    MoviesService.updateMovie(req.params.id, value).subscribe(onNext, onError, onComplete);
  }
};


const deleteMovie = (req, res, next) => {
  const onNext = () => {};
  const onComplete = () => {
    res.status(204).send();
  };
  const onError = (error) => {
    next.error(error);
  };

  MoviesService.deleteMovie(req.params.id).subscribe(onNext, onError, onComplete);
};


router.get('/', getAllMovies);
router.post('/', createMovie);
router.get('/count', countMovies);
router.get('/:id', getMovieById);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

module.exports = router;
