const Product = require('../models/product.model');
const User = require('../models/user.model');

//GET product to cart
module.exports.addToCart = (req, res) => {
    var slug = req.params.product;

    Product.findOne({slug: slug}, (err, p) => {
        if(err) {
            console.log(err);
        } else {
            if (typeof req.session.cart == "undefined") {
                req.session.cart = [];
                req.session.cart.push({
                    title: slug,
                    category: p.category,
                    qty: 1,
                    price: parseInt(p.price),
                    image: '/product_images/' + p._id + '/' + p.image
            });
    
            if(req.isAuthenticated()) {
                console.log(req.user);
                User.findOne({username: req.user.username}, (err, user) => {
                    if(err) {
                        console.log(err);
                    } else {
                        user.cart = req.session.cart.slice();
    
                        user.save((err) => {
                            if(err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Product added!');
                                res.redirect('back');
                            }
                        });
                    }
                });
                } else {
                    console.log(req.session.cart);
                    req.flash('success', 'Product added!');
                    res.redirect('back');
                }
            } else {
                var cart = req.session.cart;
                var newItem = true;
    
                for (let i = 0; i < cart.length; i++) {
                    if(cart[i].title == slug) {
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }
                }
    
                if(newItem) {
                    cart.push({
                        title: slug,
                        category: p.category,
                        qty: 1,
                        price: parseInt(p.price),
                        image: '/product_images/' + p._id + '/' + p.image
                    });
                }
    
                if(req.isAuthenticated()) {
                    console.log(req.user);
                    User.findOne({username: req.user.username}, (err, user) => {
                        if(err) {
                            console.log(err);
                        } else {
                            user.cart = req.session.cart.slice();
        
                            user.save((err) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    req.flash('success', 'Product added!');
                                    res.redirect('back');
                                }
                            });
                        }
                    });
                } else {
                    console.log(req.session.cart);
                    req.flash('success', 'Product added!');
                    res.redirect('back');
                }
            }
        }
    });
}

//GET checkout
module.exports.checkout = (req, res) => {

    if(req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/cart');
    } else {
        req.session.cart 
        res.render('cart/cart', {
            headTitle: 'Cart',
            cart: req.session.cart
        });
    }
}

//GET update product
module.exports.updateProduct = (req, res) => {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if ( cart[i].title == slug ) {
            switch(action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if(cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    if (req.isAuthenticated()) {
        User.findOne({username: req.user.username}, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                user.cart = req.session.cart.slice();
        
                user.save((err) => {
                    if(err) {
                        console.log(err);
                    } else {
                        req.flash('success', 'Cart updated!');
                        res.redirect('back');
                    }
                });
            }
        });
    } else {
        req.flash('success', 'Cart updated!');
        res.redirect('/cart/cart');
    }   
}

//GET delete cart
module.exports.deleteCart = (req, res) => {
    delete req.session.cart;

    if(req.isAuthenticated()) {
        User.findOne({username: req.user.username}, (err, user) => {
            if(err) {
                console.log(err);
            } else {
                user.cart = [];

                user.save((err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        req.flash('success', 'Cart cleared!');
                        res.redirect('/cart/cart');
                    }
                });
            }
        });

    } else {    
        req.flash('success', 'Cart cleared!');
        res.redirect('/cart/cart');
    }
}
    