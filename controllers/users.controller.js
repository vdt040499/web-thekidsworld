const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');

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
    var address = req.body.address;
    var password = req.body.password;
    var repass = req.body.repass;

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('phone', 'Phone is required!').notEmpty();
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
                res.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/signup');
            } else {
                var user = new User ({
                    username: username,
                    email: email,
                    phone: phone,
                    address: address,
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

module.exports.logout = (req, res) => {
    req.logout();

    delete req.session.cart;

    req.flash('success', 'You are logged out!');
    res.redirect('/users/signin');
}