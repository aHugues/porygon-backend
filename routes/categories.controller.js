const express = require('express');

const router = express.Router();

const CategoriesService = require('../services/categories.service');

/**
 * @typedef Category
 * @property {integer} id.required - Id of the category
 * @property {string} label.required - Name for the category
 * @property {string} description - Short description for the category
 */

/**
 * @typedef StandardResponse
 * @property {integer} code.required - Status code of the response
 * @property {string} userMessage.required - Message associated with the response - e.g. 'Resource
 * successfully created.'
 */

/**
 * @route GET /categories
 * @group categories - Operations about categories
 * @param {enum} attributes - A list of attributes to return, separated by a comma
 * @param {string} label - The string according to which categories should be searched
 * @param {string} sort - Order according to which categories should be sorted - e.g. -label or
 * +description
 * @produces application/json
 * @consumes application/json
 * @returns {Array.<Category>} 200 - An array of categories in database
 * @returns {Error}  default - Unexpected error
 */
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

/**
 * @route POST /categories
 * @group categories - Operations about categories
 * @produces application/json
 * @consumes application/json
 * @returns {StandardResponse} 200 - Success message
 * @returns {StandardResponse} 400 - Error due to invalid field in data
 */
const createCategory = (req, res, next) => {
  const onNext = () => {};
  const onComplete = () => {
    res.status(201).json({
      code: 201,
      userMessage: 'Category successfully created',
    });
  };
  const onError = (error) => {
    next(error);
  };

  CategoriesService.createCategory(req.body).subscribe(onNext, onError, onComplete);
};

/**
 * @route GET /categories/{categoryId}
 * @group categories - Operations about categories
 * @categoryID id to look for
 * @produces application/json
 * @consumes application/json
 * @returns {Category} 200 - Category found
 * @returns {StandardResponse} 404 - No category exists for the given id
 * @returns {StandardResponse} 500 - Other error
 */
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

/**
 * @route PUT /categories/{categoryId}
 * @group categories - Operations about categories
 * @produces application/json
 * @consumes application/json
 * @returns {StandardResponse} 205 - Category has been updated
 * @returns {StandardResponse} 204 - Category updated, but no changes
 * @returns {StandardResponse} 400 - Invalid fields in request
 * @returns {StandardResponse} 404 - No category exists for the given id
 * @returns {StandardResponse} 500 - Other error
 */
const updateCategory = (req, res, next) => {
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

  CategoriesService.updateCategory(req.params.id, req.body).subscribe(onNext, onError, onComplete);
};

/**
 * @route DELETE /categories/{categoryId}
 * @group categories - Operations about categories
 * @produces application/json
 * @consumes application/json
 * @returns {StandardResponse} 204 - Category deleted
 * @returns {StandardResponse} 404 - No category exists for the given id
 * @returns {StandardResponse} 500 - Other error
 */
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
