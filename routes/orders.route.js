const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders.controller');

router.get('/checkout', ordersController.order);
router.post('/checkout', ordersController.orderPost);
router.get('/checkorder', ordersController.checkOrder);
router.post('/checkorder', ordersController.checkOrderPost);
router.get('/get-detail/:orderId', ordersController.getDetailOrder);

module.exports = router;