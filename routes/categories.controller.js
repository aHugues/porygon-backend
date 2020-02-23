const express = require('express');
const Joi = require('@hapi/joi');

const router = express.Router();

const CategoriesService = require('../services/categories.service');


const createCategorySchema = Joi.object({
  label: Joi.string()
    .min(1)
    .max(255)
    .required(),
  description: Joi.string()
    .min(1)
    .max(255),
});


const editCategorySchema = Joi.object({
  label: Joi.string()
    .min(1)
    .max(255),
  description: Joi.string()
    .min(1)
    .max(255),
});


const getAllCategories = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {};
  const onError = (error) => {
    next(error);
  };

  CategoriesService.getAllCategories(req.query).subscribe(onNext, onError, onComplete);
};


const createCategory = (req, res, next) => {
  const { error, value } = createCategorySchema.validate(req.body);
  if (error) next(error);
  else {
    const onNext = () => {};
    const onComplete = () => {
      res.status(201).json({
        code: 201,
        userMessage: 'Category successfully created',
      });
    };
    const onError = (serviceError) => {
      next(serviceError);
    };

    CategoriesService.createCategory(value).subscribe(onNext, onError, onComplete);
  }
};


const getCategoryById = (req, res, next) => {
  const onNext = (data) => {
    res.json(data);
  };
  const onComplete = () => {
    res.return('ok');
  };
  const onError = (error) => {
    next(error);
  };

  CategoriesService.getCategoryById(req.params.id).subscribe(onNext, onError, onComplete);
};


const updateCategory = (req, res, next) => {
  const { error, value } = editCategorySchema.validate(req.body);
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

    CategoriesService.updateCategory(req.params.id, value).subscribe(onNext, onError, onComplete);
  }
};


const deleteCategory = (req, res, next) => {
  const onNext = () => {};
  const onComplete = () => {
    res.status(204).send();
  };
  const onError = (error) => {
    next(error);
  };
  CategoriesService.deleteCategory(req.params.id).subscribe(onNext, onError, onComplete);
};


router.get('/', getAllCategories);
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);


module.exports = router;
