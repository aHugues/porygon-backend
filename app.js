const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const morgan = require('morgan');
const log4js = require('log4js');
const bodyParser = require('body-parser');
const SwaggerUI = require('express-swaggerize-ui');
const rfs = require('rotating-file-stream');
const jwt = require('jsonwebtoken');
const Package = require('./package.json');

// Config file
const config = require('./config/server.config.json');

// get the environment and the current API version
const env = process.env.NODE_ENV || 'development';
const version = config.server.version || 1;
let accessLogStream = {};
const SwaggerFile = './doc/swagger.yml';

const logLevel = process.env.LOG_LEVEL || config.server.logLevel || 'info';
const logDirectory = config.server.logDirectory || 'logs';
log4js.configure({
  appenders: {
    outfile: {
      type: 'file',
      filename: `${logDirectory}/server.log`,
      maxLogSize: 10485760,
      backups: 3,
      compress: false,
    },
    errorfile: {
      type: 'file',
      filename: `${logDirectory}/errors.log`,
      maxLogSize: 10485760,
      backups: 3,
      compress: false,
    },
    onlyError: {
      type: 'logLevelFilter',
      appender: 'errorfile',
      level: 'error',
    },
    console: { type: 'stdout' },
  },
  categories: {
    dev: { appenders: ['console'], level: logLevel },
    default: { appenders: ['console'], level: logLevel },
    prod: { appenders: ['outfile', 'onlyError'], level: logLevel },
  },
});

const logger = log4js.getLogger(env === 'production' ? 'prod' : 'dev');
logger.info(`Starting Porygon version ${Package.version || 'unknown'} server in ${env} mode`);
logger.info(`Authentication will be ${env === 'production' ? 'enabled' : 'disabled'}.`);

// Instantiate rotating log stream in production environment
if (env === 'production') {
  logger.debug('Creating rotating filestream for access log');
  // create a rotating write stream
  accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory,
  });
  logger.debug('Filestream created');
}

// Import routes
logger.debug('Loading routes');
const index = require('./routes/index.controller');
const locations = require('./routes/locations.controller');
const movies = require('./routes/movies.controller');
const series = require('./routes/series.controller');
const categories = require('./routes/categories.controller');
const stats = require('./routes/stats.controller');
const auth = require('./routes/auth.controller');

logger.debug('Routes loaded');

const app = express();

logger.debug('Initializing application');
const router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

logger.debug('Initializing requests logger');
if (env === 'production') {
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}
logger.debug('Requests logger initialized');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.server.frontendOrigin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Expose-Headers', 'Porygon-API-Version');
  res.header('Porygon-API-Version', Package.version || '1');
  res.removeHeader('X-Powered-By');
  next();
});

// set route for api doc
app.use('/api-docs.json', (req, res) => {
  const swaggerContent = fs.readFileSync(SwaggerFile, 'utf8');
  const data = yaml.safeLoad(swaggerContent);
  data.info.version = Package.version;
  res.json(data);
});
app.use('/api-docs', SwaggerUI());


app.use((req, res, next) => {
  // Bypass authentication on dev environment
  if (env !== 'production') {
    logger.debug('Not in production - authentication ignored.');
    next();
  } else if (req.method === 'OPTIONS') {
    logger.debug('Request is `OPTION` - authentication ignored.');
    next();
  } else if (req.url === '/api/v1/healthcheck') {
    logger.debug('Request is a Healthcheck - authentication ignored');
    next();
  } else if (req.url === '/login') {
    logger.debug('Request is a login - authentication not required');
    next();
  } else {
    // Check the auth token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.debug('No auth header provided')
      res.status(401).json({
        error: 'unauthorized',
      });
    } else {
      const token = authHeader.split(' ')[1];
      logger.debug(`Provided a JSON token: ${token}`);
      jwt.verify(token, config.secretKey, (err, user) => {
        if (err) {
          logger.debug('Token is not valid');
          res.status(401).json({
            error: 'unauthorized'
          })
        } else {
          next();
        }
      }) 
    }
  }
});

// set base route to access API
app.use(`/api/v${version}`, router);

// register non-api routes
app.use('/', auth);

// register routes to use
router.use('/', index);
router.use('/locations', locations);
router.use('/movies', movies);
router.use('/series', series);
router.use('/categories', categories);
router.use('/stats', stats);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  logger.debug('No corresponding route found, forwarding 404 error');
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// catch joi validation errors
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    logger.debug(`Caught validation error: '${err.details[0].message}'`);
    const newError = {
      message: 'Invalid format for data',
      status: 400,
    };
    next(newError);
  } else {
    next(err);
  }
});

// error handler
app.use((err, req, res, next) => { // eslint-disable-line  no-unused-vars
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || err.statusCode || 500);
  logger.debug(`Returning error ${JSON.stringify(err)}`);
  res.render('error');
});

logger.debug('Application initialized.');

module.exports = app;
