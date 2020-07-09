const nodemailer = require('nodemailer');
const async = require('async');
const crypto =require('crypto');

const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const router = require('../routes/cart.route');
const select = require('../config/select_address');
const { cart } = require('./cart.controller');

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

//GET checkout
module.exports.order = async (req, res) => {
    if(req.isAuthenticated()) {
        User.findOne({username: req.user.username}, (err, user) => {
            if(err) {
                console.log(err);
            } else {
                res.render('order/checkout', {
                    headTitle: 'Thanh toán',
                    makeID: makeid(10),
                    cart: req.session.cart,
                    id: user._id,
                    username: user.username,
                    address: user.address,
                    phone: user.phone,
                    email: user.email
                });
            }
        });
    } else {
        res.render('order/checkout', {
            headTitle: 'Thanh toán',
            user: null,
            makeID: makeid(10),
            cart: req.session.cart,
            id: '',
            username: '',
            phone: '',
            email: ''
        });
    }
}

//POST check out
module.exports.orderPost = async (req, res) => {

    req.checkBody('username', 'Vui lòng nhập tên khách hàng').notEmpty();
    req.checkBody('email', 'Vui lòng nhập email').isEmail();
    req.checkBody('phone', 'Vui lòng nhập số điện thoại').notEmpty();
    req.checkBody('address', 'Vui lòng nhập địa chỉ').notEmpty();

    var username = req.body.username;
    var address = req.body.address;
    var phone = req.body.phone;
    var email = req.body.email;
    var makeID = req.body.makeID;
    var id = req.body.id;

    if (!req.isAuthenticated()) {
        var province = req.body.province;
        var district = req.body.district;
        var ward = req.body.ward;
    }

    var errors = req.validationErrors();

    if(errors) {
        res.render('order/checkout', {
            headTitle: 'Thanh toán',
            errors: errors,
            username: username,
            address: address,
            phone: phone,
            email: email,
            makeID: makeID,
            user: req.user,
            cart: req.session.cart,
            id: id
        });
    } else {
        if (req.isAuthenticated()) {
            User.findById(id, (err, user) => {
                if(err) {
                    console.log(err);
                } else {

                    var account = {
                        username: username,
                        address: address,
                        phone: phone,
                        email: email
                    }
            
                    var receiver = JSON.stringify(account);

                    var handleCart = req.session.cart;

                    for(let i=0; i < handleCart.length; i++) {
                        Product.findOne({slug: handleCart[i].title}, (err, product) => {
                            product.sold += handleCart[i].qty;
                            product.totalQuantity -= handleCart[i].qty;
                            product.soldUser.push(user.username);
                            product.save();
                        });
                    }

                    var order = new Order({
                        ID: makeID,
                        orderBy: user,
                        receiver: receiver,
                        cart: req.session.cart
                    });
    
                    order.save((err) => {
                        if(err) {
                            console.log(err);
                        } else {
                            delete req.session.cart;
            
                            user.cart = [];
    
                            user.save((err) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    
                                    async.waterfall([
                                        function(done){
                                          crypto.randomBytes(3, (err, buf) => {
                                              if (err) throw err;
                                              const token = buf.toString('hex');
                                              done(err, token)
                                          });
                                        },
    
                                        function(token, done){
                                          const transporter = nodemailer.createTransport({
                                            service: 'Gmail',
                                            auth: {
                                              user: process.env.GMAIL_USER,
                                              pass: process.env.GMAIL_PASSWORD,
                                            }
                                          });
                                    
                                          const mailOptions = {
                                            from: 'vdt040499@gmail.com',
                                            to: email,
                                            subject: 'Xác nhận đơn hàng',
                                            text: `Đơn hàng của bạn
                                                    Mã đơn hàng của bạn: ${makeID}
                                                    Vui lòng dùng mã đơn hàng dùng mã này để kiểm tra trên website chúng tôi`
                                          };
                                    
                                          transporter.sendMail(mailOptions, function(err, data){
                                              if(err){
                                                console.log('Error occurs: %s', err);
                                                return res.status(401).json({
                                                    error: err
                                                });
                                              }else{
                                                res.redirect('/orders/thankyou');
                                              }
                                          });
                                        }
                                      ]);
                                }
                            });
    
                        }
                    })
                }
            });
        } else {
            var address2 = select.address(address, province, district, ward);

            var noaccount = {
                username: username,
                address: address2,
                phone: phone,
                email: email
            }
    
            var receiver = JSON.stringify(noaccount);

            var handleCart = req.session.cart;

            for(let i=0; i < handleCart.length; i++) {
                Product.findOne({slug: handleCart[i].title}, (err, product) => {
                    product.sold += handleCart[i].qty;
                    product.totalQuantity -= handleCart[i].qty;
                    product.save();
                });
            }
    
            var order = new Order({
                ID: makeID,
                receiver: receiver,
                cart: req.session.cart
            });
    
            order.save((err) => {
                if(err) {
                    console.log(err);
                } else {
                    delete req.session.cart;
                    async.waterfall([
                        function(done){
                          crypto.randomBytes(3, (err, buf) => {
                              if (err) throw err;
                              const token = buf.toString('hex');
                              done(err, token)
                          });
                        },
    
                        function(token, done){
                          const transporter = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                              user: process.env.GMAIL_USER,
                              pass: process.env.GMAIL_PASSWORD,
                            }
                          });
                    
                          const mailOptions = {
                            from: 'vdt040499@gmail.com',
                            to: email,
                            subject: 'Xác nhận đơn hàng',
                            text: `Đơn hàng của bạn
                                    Mã đơn hàng của bạn: ${makeID}
                                    Vui lòng dùng mã đơn hàng dùng mã này để kiểm tra trên website chúng tôi`
                          };
                    
                          transporter.sendMail(mailOptions, function(err, data){
                              if(err){
                                console.log('Error occurs: %s', err);
                                return res.status(401).json({
                                    error: err
                                });
                              }else{
                                res.redirect('/orders/thankyou');
                              }
                          });
                        }
                    ]);
                }
            })
        }
    }
}

//GET check order
module.exports.checkOrder = (req, res) => {
    var orderId = '';
    var email = '';

    res.render('order/check_order', {
        headTitle: 'Kiểm tra đơn hàng',
        orderId: orderId,
        email: email
    });
}

//POST check order
module.exports.checkOrderPost = (req, res) => {
    var orderId = req.body.ID;
    var email = req.body.email;

    req.checkBody('ID', 'Bạn chưa nhập mã đơn hàng');

    var errors = req.validationErrors();

    if(errors) {
        req.render('order/check_order', {
            headTitle: 'Kiểm tra đơn hàng',
            orderId: orderId,
            email: email
        });
    } else {
        Order.findOne({ID: orderId}, (err, order) => {
            if(err) {
                console.log(err);
            } else {
                if (req.isAuthenticated()) {
                    if(!order) {
                        req.flash('danger', 'Mã đơn hàng không tồn tại');
                        res.render('order/check_order', {
                            headTitle: 'Kiểm tra đơn hàng',
                            orderId: orderId,
                            email: email
                        });
                    } else {
                        if(!order.orderBy) { //Order noaccount
                            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
                            var receiver = JSON.parse(order.receiver);
                            
                            if(receiver.email !== email) {
                                req.flash('danger', 'Email không khớp');
                                res.render('order/check_order', {
                                    headTitle: 'Kiểm tra đơn hàng',
                                    orderId: orderId,
                                    email: email
                                }); 
                            } else {
                                res.render('order/order_detail', {
                                    headTitle: 'Đơn hàng của bạn',
                                    orderID: order.ID,
                                    receiver: receiver,
                                    user: req.user,
                                    orderCart: cart,
                                    status: order.status,
                                    date: order.date
                                });
                            }
                        } else {
                            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
                            var receiver = JSON.parse(order.receiver);
                            
                            if(receiver.email !== email) {
                                req.flash('danger', 'Email không khớp');
                                res.render('order/check_order', {
                                    headTitle: 'Kiểm tra đơn hàng',
                                    orderId: orderId,
                                    email: email
                                }); 
                            } else {
                                res.render('order/order_detail', {
                                    headTitle: 'Đơn hàng của bạn',
                                    orderID: order.ID,
                                    receiver: receiver,
                                    user: req.user,
                                    orderCart: cart,
                                    status: order.status,
                                    date: order.date
                                });
                            }
                        }
                    }   
                } else {
                    if(!order) {
                        req.flash('danger', 'Mã đơn hàng không tồn tại');
                        res.render('order/check_order', {
                            headTitle: 'Kiểm tra đơn hàng',
                            orderId: orderId,
                            email: email,
                            user: null
                        });
                    } else {
                        if(!order.orderBy) { //Order noaccount
                            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
                            var receiver = JSON.parse(order.receiver);
                            
                            if(receiver.email !== email) {
                                req.flash('danger', 'Email không khớp');
                                res.render('order/check_order', {
                                    headTitle: 'Kiểm tra đơn hàng',
                                    orderId: orderId,
                                    email: email,
                                    user: null
                                }); 
                            } else {
                                res.render('order/order_detail', {
                                    headTitle: 'Đơn hàng của bạn',
                                    orderID: order.ID,
                                    receiver: receiver,
                                    user: null,
                                    orderCart: cart,
                                    status: order.status,
                                    date: order.date
                                });
                            }
                        } else {
                            var cart = JSON.parse(JSON.stringify(order.cart.slice()));
                            var receiver = JSON.parse(order.receiver);
                            
                            if(receiver.email !== email) {
                                req.flash('danger', 'Email không khớp');
                                res.render('order/check_order', {
                                    headTitle: 'Kiểm tra đơn hàng',
                                    orderId: orderId,
                                    email: email,
                                    user: null
                                }); 
                            } else {
                                res.render('order/order_detail', {
                                    headTitle: 'Đơn hàng của bạn',
                                    orderID: order.ID,
                                    receiver: receiver,
                                    user: null,
                                    orderCart: cart,
                                    status: order.status,
                                    date: order.date
                                });
                            }
                        }
                    }
                }
            }
        }); 
    }
}

//GET get order for user 
module.exports.getDetailOrder = (req, res) => {
    var orderId = req.params.orderId;

    Order.findById(orderId, (err, order) => {
        var cart = JSON.parse(JSON.stringify(order.cart.slice()));
        var receiver = JSON.parse(order.receiver);
        if(req.isAuthenticated()) {
            res.render('order/order_detail', {
                headTitle: 'Đơn hàng của bạn',
                orderID: order.ID,
                receiver: receiver,
                user: req.user,
                orderCart: cart,
                status: order.status,
                date: order.date
            });
        } else {
            res.render('order/order_detail', {
                headTitle: 'Đơn hàng của bạn',
                orderID: order.ID,
                receiver: receiver,
                user: null,
                orderCart: cart,
                status: order.status,
                date: order.date
            });
        }    
    });
}

//GET cancel order
module.exports.cancelOrder = async(req, res) => {
    orderId = req.params.orderId;

    let order = await Order.findOne({ID: orderId});

    if (req.isAuthenticated()) {
        var user = req.user;
        var cart = order.cart;
        console.log(cart);
        for(let i=0; i < cart.length; i++) {
            var product = await Product.findOne({slug: cart[i].title});
            product.soldUser = product.soldUser.filter(e => e !== user.username);
            await product.save();      
        }
    }

    order.status = "Cancel";

    await order.save();

    res.redirect(`/orders/get-detail/${order._id}`);
}

//GET thankyou
module.exports.thankYou = (req, res) => {
    res.render('thankyou', {
      headTitle: "Cảm ơn"
    });
};

//GET editreceiver
module.exports.editReceiver = async(req, res) => {
    let orderID = req.params.orderID;

    const order = await Order.findOne({ID: orderID});

    const receiver = JSON.parse(order.receiver);

    let username = receiver.username;
    let address = receiver.address;
    let phone = receiver.phone;
    let email = receiver.email;

    res.render('order/edit_receiver', {
        headTitle: "Thay đổi thông tin giao hàng",
        orderID: orderID,
        username: username,
        address: address,
        phone: phone,
        email: email
    });
}

//POST editreceiver
module.exports.editReceiverPost = async(req, res) => {
    let orderID = req.params.orderID;
    let username = req.body.username;
    let phone = req.body.phone;
    let email = req.body.email;

    const order = await Order.findOne({ID: orderID});

    let receiver = JSON.parse(order.receiver);

    receiver.username = username;
    receiver.phone = phone;
    receiver.email = email;

    var editedReceiver = JSON.stringify(receiver);

    order.receiver = editedReceiver;

    await order.save();

    req.flash('success', 'Thay đổi thông tin thành công');
    res.redirect('/orders/get-detail/' + order._id);

}

//POST editaddressreceiver
module.exports.editAddressReceiverPost = async(req, res) => {
    let orderID = req.params.orderID;
    let province = req.body.province;
    let district = req.body.district;
    let ward = req.body.ward;
    let address = req.body.address;

    req.checkBody('province', 'Vui lòng chọn tỉnh/thành phố').notEmpty();
    req.checkBody('district', 'Vui lòng chn quận/huyện').notEmpty();
    req.checkBody('ward', 'Vui lòng nhập phường/xã').notEmpty();
    req.checkBody('address', 'Vui lòng nhập địa chỉ cụ thể').notEmpty();

    let errors = req.validationErrors();

    if(errors) {
        req.flash('danger', 'Có lỗi xảy ra vui lòng nhập lại');
        res.redirect('/users/edit_receiver/' + orderID);
    } else {
        let order = await Order.findOne({ID: orderID});

        let receiver = JSON.parse(order.receiver);

        var address2 = select.address(address, province, district, ward);

        receiver.address = address2;

        let editedReceiver = JSON.stringify(receiver);

        order.receiver = editedReceiver;

        await order.save();

        req.flash('success', 'Cập nhật địa chỉ giao hàng thành công');
        res.redirect('/orders/get-detail/' + order._id);
    }
}
