const Order = require('../models/order.model');
const User = require('../models/user.model');
const { order } = require('./orders.controller');

//GET all orders
module.exports.getOrders = async (req, res) => {
    const orders = await Order.find();
   
    res.render('admin/orders', {
        headTitle: 'Orders',
        orders: orders
    });

}

//GET detailed order
module.exports.getOrder = (req, res) => {
    var orderId = req.params.orderId;

    Order.findOne({ID: orderId}, async(err, order) => {
        if(!order.orderBy) {
            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
            var receiver = JSON.parse(order.receiver);

            res.render('admin/order_detail', {
                headTitle: 'Your order',
                orderID: order.ID,
                receiver: receiver,
                orderOwner: null,
                user: req.user,
                orderCart: cart,
                status: order.status,
                date: order.date
            });
        } else {
            
            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
            var receiver = JSON.parse(order.receiver);
            var orderOwner = await User.findById(order.orderBy);

            res.render('admin/order_detail', {
                headTitle: 'Your order',
                orderID: order.ID,
                receiver: receiver,
                orderOwner: orderOwner,
                orderCart: cart,
                status: order.status,
                date: order.date
            });
        }
    });
}

//GET change order's status
module.exports.changeStatus = (req, res) => {
    var changeStatus = req.params.changeStatus;
    var orderId = req.params.orderId;

    Order.findOne({ID: orderId}, (err, order) => {
        order.status = changeStatus;

        order.save((err) => {
            if(err) {
                console.log(err);
            } else {
                res.redirect('/admin/orders/');
            }
        });
    });   
}

//GET delete order
module.exports.deleteOrder = (req, res) => {
    var orderId = req.params.orderId;

    Order.findByIdAndRemove(orderId, (err) => {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Order deleted!');
            res.redirect('/admin/orders');
        }
    });
}