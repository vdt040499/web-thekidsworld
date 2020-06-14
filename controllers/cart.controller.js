const Product = require('../models/product.model');

module.exports.addToCart = (req, res) => {
    var slug = req.params.product;

    Product.findOne({slug: slug}, (err, p) => {
        if(err)
            console.log(err);
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseInt(p.price),
                image: '/product_images/' + p._id + '/' + p.image
            });
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
                    qty: 1,
                    price: parseInt(p.price),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }
        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });
}