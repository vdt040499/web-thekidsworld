const express = require('express');
const router = express.Router();

const Category = require('../models/category.model');
const Product = require('../models/product.model');

const productsController = require('../controllers/products.controller');

router.get('/:category', productsController.getProductsByCategory);
router.get('/bestseller-cat/:category', productsController.getBSPByCategory);
router.get('/:category/:product', productsController.getProductDetails);
router.post('/rating/:productId/:userId', productsController.rating);

module.exports = router;