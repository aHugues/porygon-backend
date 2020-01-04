const express = require('express');
const path = require('path');
const morgan = require('morgan');
const log4js = require('log4js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const request = require('request');
const MySQLSessionStore = require('express-mysql-session')(session);
const ExpressSwagger = require('express-swagger-generator');
const rfs = require('rotating-file-stream');
const Package = require('./package.json');

// Config file
const config = require('./config/server.config.json');

// get the environment and the current API version
const env = process.env.NODE_ENV || 'development';
const version = config.server.version || 1;
let keycloak = {};
let keycloakConfig = {};
let mySQLConfig = {};
let sessionStore = {};
let accessLogStream = {};

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
    prod: { appenders: ['outfile', 'onlyError'], level: 'info' },
  },
});

const logger = log4js.getLogger(env === 'production' ? 'prod' : 'dev');
logger.info(`Starting Porygon version ${Package.version || 'unknown'} server in ${env} mode`);
logger.info(`Authentication will be ${env === 'production' ? 'enabled' : 'disabled'}.`);

// setup store in production environment
if (env === 'production') {
  logger.debug('Loading session store');
  mySQLConfig = require('./config/database.config.json')[env]; // eslint-disable-line global-require
  sessionStore = new MySQLSessionStore(mySQLConfig);
  logger.debug('Session store created');
}

// Instantiate Keycloak if in production environment
if (env === 'production') {
  logger.debug('Loading Keycloak config');
  keycloakConfig = require('./config/keycloak.config.json'); // eslint-disable-line global-require
  keycloak = new Keycloak({ store: session }, keycloakConfig);
  logger.debug('Keycloak config loaded');
}

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

logger.debug('Routes loaded');

const app = express();

const expressSwagger = ExpressSwagger(app);

// session in production environment
if (env === 'production') {
  logger.debug('Creating session handler');
  app.use(session({
    secret: config.secretKey,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 600000,
    },
  }));
  logger.debug('Session handler created');
}

logger.debug('Creating Swagger handler');
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      description: Package.description,
      title: 'Documentation API',
      version: Package.version,
    },
    host: `${config.doc.baseHost}`,
    basePath: `/api/v${version}`,
    produces: [
      'application/json',
      'application/xml',
    ],
    schemes: ['http', 'https'],
    securityDefinitions: {
      // JWT: {
      //   type: 'apiKey',
      //   in: 'header',
      //   name: 'Authorization',
      //   description: '',
      // },
    },
  },
  basedir: __dirname, // app absolute path
  files: ['./routes/**/*.js'], // Path to the API handle folder
};

expressSwagger(swaggerOptions);
logger.debug('Swagger handler created');

logger.debug('Initializing application');
const router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (env === 'production') {
  logger.debug('Initializing Keycloak middleware');
  app.use(keycloak.middleware({
    logout: 'logout',
    admin: '/',
  }));
  logger.debug('Keycloak middleware initialized');
}

logger.debug('Initializing requests logger');
if (env === 'production') {
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}
logger.debug('Requests logger initialized');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Porygon-API-Version', Package.version || '1');
  next();
});

let keycloakHost = '';
let realmName = '';

if (env === 'production') {
  keycloakHost = keycloakConfig.host;
  realmName = keycloakConfig.realm;
}

app.use((req, res, next) => {
  // Bypass authentication on dev environment
  if (env !== 'production') {
    logger.debug('Not in production - authentication ignored.');
    next();
  } else if (req.method === 'OPTIONS') {
    logger.debug('Request is `OPTION` - authentication ignored.');
    next();
  } else if (req.headers.authorization) {
    // Check if cookie is still valid:
    if (req.session !== undefined && req.session.cookie.maxAge > 0) {
      logger.debug('Session is valid, continuying.');
      next();
    } else {
      logger.debug('Checking authorization token with Keycloak');
      const options = {
        method: 'GET',
        url: `https://${keycloakHost}/auth/realms/${realmName}/protocol/openid-connect/userinfo`,
        headers: {
          Authorization: req.headers.authorization,
        },
      };

      request(options, (error, response) => {
        if (error) throw new Error(error);
        if (response.statusCode !== 200) {
          logger.debug('Authorization is not valid.');
          res.status(401).json({
            error: 'unauthorized',
          });
        } else {
          logger.debug('Authorization is valid.');
          next();
        }
      });
    }
  } else {
    logger.debug('No authorization token provided.');
    res.status(401).json({
      error: 'unauthorized',
    });
  }
});

// set base route to access API
app.use(`/api/v${version}`, router);

// register routes to use
router.use('/', index);
router.use('/locations', locations);
router.use('/movies', movies);
router.use('/series', series);
router.use('/categories', categories);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  logger.debug('No corresponding route found, forwarding 404 error');
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => { // eslint-disable-line  no-unused-vars
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  logger.debug(`Returning error ${JSON.stringify(err)}`);
  res.render('error');
});

logger.debug('Application initialized.');

module.exports = app;
