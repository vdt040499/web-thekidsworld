var express = require('express');
var router = express.Router();
const passport = require('passport');

const Product = require('../models/product.model');
const User = require('../models/user.model');

/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find((err, products) => {
    if(err) {
      console.log(err);
    } else {

      if(req.isAuthenticated()) {
        User.findOne({username: req.user.username}, (err, user) => {
          if(err) {
            console.log(err);
          } else {
            req.session.cart = [];
            var objectArray = [];
            user.cart.forEach((item) => {
              var temp = JSON.parse(JSON.stringify(item));
              objectArray.push(temp);
            });         
            req.session.cart = objectArray.slice();   
            
            var bestSellerProducts = products.sort((a, b) => {
              return b.sold - a.sold;
            });
      
            res.render('index', {
              headTitle: 'The kids world | Cửa hàng chuyên kinh doanh quần áo và đồ dùng trẻ em',
              bestSellerProducts: bestSellerProducts.slice(0, 8),
              cart: req.session.cart
            });
          }
        });
      } else {
        var bestSellerProducts = products.sort((a, b) => {
          return b.sold - a.sold;
        });
  
        res.render('index', {
          headTitle: 'The kids world | Cửa hàng chuyên kinh doanh quần áo và đồ dùng trẻ em',
          bestSellerProducts: bestSellerProducts.slice(0, 8)
        });
      }
    }
  });
  
});

router.get('/aboutus', (req, res) => {
  res.render('pages/aboutus', {
    headTitle: "Về The Kid's World"
  });
});

router.get('/sales', (req, res) => {
  res.render('pages/sales', {
    headTitle: "Sale khủng"
  });
});

//GET thankyou
router.get('/thankyou', (req, res) => {
  res.render('thankyou', {
    headTitle: "Cảm ơn"
  });
})

//Login with google
//Login with google
router.get('/auth/gg', passport.authenticate('google',{scope: ['profile', 'email']}));

router.get('/auth/gg/cb', passport.authenticate('google', { successRedirect : '/', failureRedirect: '/users/signin' }));

module.exports = router;
