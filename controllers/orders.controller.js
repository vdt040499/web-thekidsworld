const User = require('../models/user.model');
const Product = require('../models/product.model');

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
    var username = req.body.username;
    console.log(username);
    var address = req.body.address;
    console.log(address);
    var phone = req.body.phone;
    console.log(phone);
    var email = req.body.email;
    console.log(email);
    var makeID = req.body.makeID;
    console.log(makeID);
    var id = req.body.id;
    console.log(id);

    res.send(username + address + phone + email + makeID + id);
}