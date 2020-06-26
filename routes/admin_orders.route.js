const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const adminOrdersController = require('../controllers/admin_orders.controller');

router.get('/', isAdmin, adminOrdersController.getOrders);
router.get('/get-order/:orderId', isAdmin, adminOrdersController.getOrder);
router.get('/change-status/:changeStatus/:orderId', adminOrdersController.changeStatus);
router.get('/delete-order/:orderId', adminOrdersController.deleteOrder);

module.exports = router;