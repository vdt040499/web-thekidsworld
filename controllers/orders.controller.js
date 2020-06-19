const nodemailer = require('nodemailer');
const async = require('async');
const crypto =require('crypto');

const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const router = require('../routes/cart.route');

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
                    headTitle: 'Checkout',
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
            headTitle: 'Check out',
            makeID: makeid(10),
            cart: req.session.cart,
            id: '',
            username: '',
            address: '',
            phone: '',
            email: ''
        });
    }
}

//POST check out
module.exports.orderPost = (req, res) => {

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('phone', 'Phone is required!').notEmpty();
    req.checkBody('address', 'Address is required!').notEmpty();

    var username = req.body.username;
    var address = req.body.address;
    var phone = req.body.phone;
    var email = req.body.email;
    var makeID = req.body.makeID;
    var id = req.body.id;

    var errors = req.validationErrors();

    if(errors) {
        res.render('order/checkout', {
            headTitle: 'Check out',
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
                    var order = new Order({
                        ID: makeID,
                        orderBy: user,
                        cart: req.session.cart,
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
                                            subject: 'Confirm your order',
                                            text: `Your invoice
                                                    Order's ID: ${makeID}
                                                    Please use it to check your invoice on my website`
                                          };
                                    
                                          transporter.sendMail(mailOptions, function(err, data){
                                              if(err){
                                                console.log('Error occurs: %s', err);
                                                return res.status(401).json({
                                                    error: err
                                                });
                                              }else{
                                                req.flash('success', 'Cảm ơn bạn đã mua hàng của chúng tôi');
                                                res.redirect('/');
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
            var noaccount = {
                username: username,
                address: address,
                phone: phone,
                email: email
            }
    
            var user = JSON.stringify(noaccount);
    
            var order = new Order({
                ID: makeID,
                orderByNoAccount: user,
                cart: req.session.cart,
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
                            subject: 'Confirm your order',
                            text: `Your invoice
                                    Order's ID: ${makeID}
                                    Please use it to check your invoice on my website`
                          };
                    
                          transporter.sendMail(mailOptions, function(err, data){
                              if(err){
                                console.log('Error occurs: %s', err);
                                return res.status(401).json({
                                    error: err
                                });
                              }else{
                                req.flash('success', 'Cảm ơn bạn đã mua hàng của chúng tôi');
                                res.redirect('/');
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

    res.render('order/check_order', {
        headTitle: 'Check order',
        orderId: orderId
    });
}

//POST check order
module.exports.checkOrderPost = (req, res) => {
    var orderId = req.body.ID;

    req.checkBody('ID', 'Bạn chưa nhập mã đơn hàng');

    var errors = req.validationErrors();

    if(errors) {
        req.render('order/check_order', {
            headTitle: 'Check order',
            orderId: orderId
        });
    } else {
        Order.findOne({ID: orderId}, (err, order) => {
            if(err) {
                console.log(err);
            } else {
                if(!order) {
                    req.flash('danger', 'Mã đơn hàng không tồn tại');
                    res.render('order/check_order', {
                        headTitle: 'Check order',
                        orderId: orderId
                    });
                } else {
                    if(!order.orderBy) {
                        var user = JSON.parse(order.orderByNoAccount);
                        var cart = JSON.parse(JSON.stringify(order.cart.slice()));
                        
                        if (req.isAuthenticated()) {
                            res.render('order/order_detail', {
                                headTitle: 'Your order',
                                orderID: order.ID,
                                orderUser: user,
                                user: req.user,
                                orderCart: cart
                            });
                        } else {
                            res.render('order/order_detail', {
                                headTitle: 'Your order',
                                orderID: order.ID,
                                orderUser: user,
                                user: null,
                                orderCart: cart
                            });
                        }
                    } else {
                        var cart = JSON.parse(JSON.stringify(order.cart.slice()));

                        User.findById(order.orderBy, (err, user) => {
                            if (req.isAuthenticated()) {
                                res.render('order/order_detail', {
                                    headTitle: 'Your order',
                                    orderID: order.ID,
                                    orderUser: user,
                                    user: req.user,
                                    orderCart: cart
                                });
                            } else {
                                res.render('order/order_detail', {
                                    headTitle: 'Your order',
                                    orderID: order.ID,
                                    orderUser: user,
                                    user: null,
                                    orderCart: cart
                                });
                            }
                        });
                    }
                }
            }
        });
    }
} 