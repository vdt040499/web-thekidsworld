const passport = require('passport');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const User = require('../models/user.model');
const Order = require('../models/order.model');

//GET signup
module.exports.signup = (req, res) => {
    var username = "";
    var email = "";
    var phone = "";
    var address = "";

    res.render('users/signup', {
        headTitle: "Sign Up",
        username: username,
        email: email,
        phone: phone, 
        address: address
    });
}

//POST signup
module.exports.signupPost = (req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var phone = req.body.phone;
    var province = req.body.province;
    var district = req.body.district;
    var ward = req.body.ward;
    var address = req.body.address;
    var password = req.body.password;
    var repass = req.body.repass;

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('phone', 'Phone is required!').notEmpty();
    req.checkBody('province', 'Province address is required!').notEmpty();
    req.checkBody('district', 'District address required!').notEmpty();
    req.checkBody('ward', 'Ward is required!').notEmpty();
    req.checkBody('address', 'Address is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('repass', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if(errors) {
        res.render('users/signup', {
            headTitle: 'Sign Up',
            username: username,
            email: email,
            phone: phone,
            address: address,
            errors: errors,
            user: null
        })
    } else {
        User.findOne({username: username}, (err, user) => {
            if(err) console.log(err);

            if(user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/signup');
            } else {

                var prov, dist, ward2;

                var provinces = JSON.parse(fs.readFileSync('./public/files/Province.txt'));

                provinces.forEach((pro) => {
                    if (pro.id === parseInt(province)) {
                        prov = pro.name;
                    }
                });

                var districts = JSON.parse(fs.readFileSync('./public/files/District.txt'));

                districts.forEach((dis) => {
                    if (dis.id === parseInt(district)) {
                        dist = dis.name;
                    }
                });

                var wards = JSON.parse(fs.readFileSync('./public/files/Ward.txt'));

                wards.forEach((wa) => {
                    if(wa.id === parseInt(ward)) {
                        ward2 = wa.name;
                    }
                });

                var add = `${address}, ${ward2}, ${dist}, ${prov}`;
                var user = new User ({
                    username: username,
                    email: email,
                    phone: phone,
                    address: add,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if(err) console.log(err)

                        user.password = hash;

                        user.save(err => {
                            if(err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registerd!');
                                res.redirect('/users/signin');
                            }
                        })
                    });
                });
            }
        });
    }
}

//GET signin
module.exports.signin = (req, res) => {
    
    if(res.locals.user) res.redirect('/');

    var username = "";

    res.render('users/signin', {
        headTitle: 'Sign In',
        username: username
    });
}

//POST signin
module.exports.signinPost = (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/signin',
        failureFlash: true
    })(req, res, next);


}

//GET logout
module.exports.logout = (req, res) => {
    req.logout();

    delete req.session.cart;

    req.flash('success', 'You are logged out!');
    res.redirect('/users/signin');
}

//GET profile
module.exports.account = (req, res) => {
    var user = req.user;
    var receiver = '';
    Order.find({ orderBy : user._id }, (err, orders) => {
        var processingOrder = [];
        var shippingOrder = [];
        var completedOrder = [];
        orders.forEach((order) => {
            receiver = order.receiver;
            if(order.status == "Processing") {
                processingOrder.push(order);
            } else if (order.status == "Shipping") {
                shippingOrder.push(order);
            } else {
                completedOrder.push(order);
            }
        });

        console.log(user);
        console.log(JSON.parse(receiver));

        res.render('users/account', {
            headTitle: 'Account',
            user: user,
            receiver: JSON.parse(receiver),
            processingOrder: processingOrder,
            shippingOrder: shippingOrder,
            completedOrder: completedOrder,
        });
    })
   
}