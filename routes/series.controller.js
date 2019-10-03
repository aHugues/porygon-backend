const express = require('express');

const router = express.Router();

const SeriesService = require('../services/series.service');


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
  const onNext = () => {};
  const onComplete = () => {
    res.status(201).json({
      code: 201,
      userMessage: 'Serie successfully created',
    });
  };
  const onError = (error) => {
    next(error);
  };

  SeriesService.createSerie(req.body).subscribe(onNext, onError, onComplete);
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

  SeriesService.updateSerie(req.params.id, req.body).subscribe(onNext, onError, onComplete);
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
