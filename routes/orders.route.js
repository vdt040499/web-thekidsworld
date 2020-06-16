const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders.controller');

router.get('/checkout', ordersController.order);
router.post('/checkout', ordersController.orderPost);
module.exports = router;