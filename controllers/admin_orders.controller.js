const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const { order } = require('./orders.controller');

//GET all orders
module.exports.getOrders = async (req, res) => {
    const orders = await Order.find();
   
    res.render('admin/orders', {
        headTitle: 'Đơn hàng',
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
                headTitle: 'Chi tiết đơn hàng',
                orderID: order.ID,
                receiver: receiver,
                orderOwner: null,
                user: req.user,
                orderCart: cart,
                status: order.status,
                date: order.date,
                deliveryDate: order.deliveryDate
            });
        } else {
            
            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
            var receiver = JSON.parse(order.receiver);
            var orderOwner = await User.findById(order.orderBy);

            res.render('admin/order_detail', {
                headTitle: 'Chi tiết đơn hàng',
                orderID: order.ID,
                receiver: receiver,
                orderOwner: orderOwner,
                orderCart: cart,
                status: order.status,
                date: order.date,
                deliveryDate: order.deliveryDate
            });
        }
    });
}

//GET change order's status
module.exports.changeStatus = (req, res) => {
    var changeStatus = req.params.changeStatus;
    var orderId = req.params.orderId;


    Order.findOne({ID: orderId}, (err, order) => {

        if(order.orderBy) {
            User.findById(order.orderBy, (err, user) => {
                if (changeStatus === "Processing" || changeStatus === "Shipping" || changeStatus === "Completed") {
                    var cart = order.cart;
                    for(let i=0; i < cart.length; i++) {
                        Product.findOne({slug: cart[i].title}, (err, product) => {
                            if (!product.soldUser.includes(user.username)) {
                                product.soldUser.push(user.username);
                                product.save();
                            }
                        });
                    }
                } else {
                    var cart = order.cart;
                    for(let i=0; i < cart.length; i++) {
                        Product.findOne({slug: cart[i].title}, (err, product) => {
                            if (product.soldUser.includes(user.username)) {
                                product.soldUser = product.soldUser.filter(e => e !== user.username);
                                product.save();
                            }
                        });
                    }
                }
            });
        }

        order.status = changeStatus;
        if (changeStatus === "Completed") {
            order.deliveryDate = Date.now();
        }
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
            req.flash('success', 'Xóa đơn hàng thành công');
            res.redirect('/admin/orders');
        }
    });
}