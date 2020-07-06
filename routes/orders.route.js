const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders.controller');

router.get('/checkout', ordersController.order);
router.post('/checkout', ordersController.orderPost);
router.get('/checkorder', ordersController.checkOrder);
router.post('/checkorder', ordersController.checkOrderPost);
router.get('/get-detail/:orderId', ordersController.getDetailOrder);
router.get('/cancel/:orderId', ordersController.cancelOrder);
router.get('/thankyou', ordersController.thankYou);

module.exports = router;