const Order = require('../models/order.model');
const User = require('../models/user.model');
const { order } = require('./orders.controller');

module.exports.getOrders = async (req, res) => {
    const orders = await Order.find();
   
    res.render('admin/orders', {
        headTitle: 'Orders',
        orders: orders
    });

}