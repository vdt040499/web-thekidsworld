const { getRounds } = require("bcryptjs");

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');

router.get('/add/:product', cartController.addToCart);
router.get('/cart', cartController.cart);
router.get('/update/:product', cartController.updateProduct);
router.get('/clear', cartController.deleteCart);

module.exports = router;