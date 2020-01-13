const express = require('express');
const HealthcheckService = require('../services/healthcheck.service');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});


router.get('/healthcheck', (req, res) => {
  res.json(HealthcheckService.returnStatus());
});

module.exports = router;
