const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

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
module.exports.order = (req, res) => {
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
                                req.flash('success', 'Cảm ơn bạn đã mua hàng của chúng tôi');
                                res.redirect('/');
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
                req.flash('success', 'Cảm ơn bạn đã mua hàng của chúng tôi');
                res.redirect('/');
            }
        })
    }
}