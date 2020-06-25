const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const adminOrdersController = require('../controllers/admin_orders.controller');

router.get('/', isAdmin, adminOrdersController.getOrders);

module.exports = router;