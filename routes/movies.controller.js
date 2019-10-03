const express = require('express');

const router = express.Router();

const MoviesService = require('../services/movies.service');


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
  const onNext = () => {};
  const onComplete = () => {
    res.status(201).json({
      code: 201,
      userMessage: 'Movie successfully created',
    });
  };
  const onError = (error) => {
    next(error);
  };

  MoviesService.createMovie(req.body).subscribe(onNext, onError, onComplete);
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
  const onNext = (modified) => {
    if (modified) {
      res.status(205).send();
    } else {
      res.status(204).send();
    }
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  MoviesService.updateMovie(req.params.id, req.body).subscribe(onNext, onError, onComplete);
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
