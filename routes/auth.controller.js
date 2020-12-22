const express = require('express');
const Joi = require('@hapi/joi');

const router = express.Router();

const AuthService = require('../services/auth.service');
const cleanup = require('../middlewares/cleanup');
const { ExpandOperator } = require('rxjs/operators/expand');

const createUserSchema = Joi.object({
  login: Joi.string()
    .min(1)
    .max(255)
    .required(),
  password: Joi.string()
    .min(1)
    .max(255)
    .required(),
  firstName: Joi.string()
    .min(1)
    .max(255)
    .required(),
  lastName: Joi.string()
    .min(1)
    .max(255)
    .required(),
  email: Joi.string()
    .min(1)
    .max(255)
    .email(),
});

const loginSchema = Joi.object({
  login: Joi.string()
    .min(1)
    .max(255)
    .required(),
  password: Joi.string()
    .min(1)
    .max(255)
    .required(),
});

const createUser = (req, res, next) => {
  const { error, value } = createUserSchema.validate(cleanup.removeNulls(req.body, true));
  if (error) next(error);
  else {
    const onNext = () => {};
    const onComplete = () => {
      res.status(201).json({
        code: 201,
        userMessage: 'User successfully created',
      });
    };
    const onError = (error) => {
      next(error);
    };

    AuthService.createUser(value).subscribe(onNext, onError, onComplete);
  }
};

const login = (req, res, next) => {
  const { error, value } = loginSchema.validate(cleanup.removeNulls(req.body, true));
  if (error) next(error);
  else {
    const onNext = (user) => {
        req.session.username = value.login;
        res.json(user);
    };
    const onError = () => {
      res.status(401).json({
        code: 401,
        userMessage: 'Invalid username or password',
      });
    };
    const onComplete = () => {};

    AuthService.checkLogin(value.login, value.password).subscribe(onNext, onError, onComplete);
  }
};

const checkIsLoggedIn = (req, res) => {
  if (req.session !== undefined && req.session.cookie.maxAge > 0 && req.session.username !== undefined) {
    res.status(204).send();
  } else {
    res.status(401).send();
  }
}

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({
        code: 500,
        userMessage: 'Impossible to destroy user session',
      });
    } else {
      res.status(200).send();
    }
  })
}

const getUserInfo = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {
    res.return('ok');
  };
  const onError = (error) => {
    next(error);
  };

  AuthService.getUserInfo(req.params.username).subscribe(onNext, onError, onComplete);
};

router.post('/user', createUser);
router.get('/users/:username', getUserInfo);
router.get('/login', checkIsLoggedIn);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
