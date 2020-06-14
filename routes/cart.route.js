const { getRounds } = require("bcryptjs");

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');

router.get('/add/:product', cartController.addToCart);

module.exports = router;