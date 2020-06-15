const express = require('express');
const router = express.Router();

const Category = require('../models/category.model');
const Product = require('../models/product.model');

const productsController = require('../controllers/products.controller');

router.get('/:category', productsController.getProductsByCategory);

module.exports = router;