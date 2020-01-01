const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const request = require('request');
const MySQLSessionStore = require('express-mysql-session')(session);
const ExpressSwagger = require('express-swagger-generator');
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

// setup store in production environment
if (env === 'production') {
  mySQLConfig = require('./config/database.config.json')[env]; // eslint-disable-line global-require
  sessionStore = new MySQLSessionStore(mySQLConfig);
}

// Instantiate Keycloak if in production environment
if (env === 'production') {
  keycloakConfig = require('./config/keycloak.config.json'); // eslint-disable-line global-require
  keycloak = new Keycloak({ store: session }, keycloakConfig);
}

// Import routes
const index = require('./routes/index.controller');
const locations = require('./routes/locations.controller');
const movies = require('./routes/movies.controller');
const series = require('./routes/series.controller');
const categories = require('./routes/categories.controller');

const app = express();

const expressSwagger = ExpressSwagger(app);

// session in production environment
if (env === 'production') {
  app.use(session({
    secret: config.secretKey,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 600000,
    },
  }));
}

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
const router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (env === 'production') {
  app.use(keycloak.middleware({
    logout: 'logout',
    admin: '/',
  }));
}
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
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
    next();
  } else if (req.method === 'OPTIONS') {
    next();
  } else if (req.headers.authorization) {
    // Check if cookie is still valid:
    if (req.session !== undefined && req.session.cookie.maxAge > 0) {
      next();
    } else {
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
          res.status(401).json({
            error: 'unauthorized',
          });
        } else {
          next();
        }
      });
    }
  } else {
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
  res.render('error');
});

module.exports = app;
