const Product = require('../models/product.model');

module.exports.signup = (req, res, next) => {
    res.render('users/signup', {
        title: "Sign Up"
    });
}

module.exports.signupPost = (req, res, next) => {
    
}

module.exports.signin = (req, res, next) => {
    res.render('users/signin', {
        title: 'Sign In'
    });
}