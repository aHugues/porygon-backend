const express = require('express');

const router = express.Router();

const StatsService = require('../services/stats.service');


const countMoviesByYear = (req, res, next) => {
  StatsService.countMoviesByYear()
    .then((stats) => res.json(stats))
    .catch((err) => next(err));
};


const countSeriesByYear = (req, res, next) => {
  StatsService.countSeriesByYear()
    .then((stats) => res.json(stats))
    .catch((err) => next(err));
};


const getFullStats = (req, res, next) => {
  StatsService.getFullStats()
    .then((stats) => res.json(stats))
    .catch((err) => next(err));
};


router.get('/year/movies/', countMoviesByYear);
router.get('/year/series/', countSeriesByYear);
router.get('/', getFullStats);


module.exports = router;
