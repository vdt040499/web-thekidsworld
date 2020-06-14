var express = require('express');
var router = express.Router();

const Product = require('../models/product.model');

/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find((err, products) => {
    if(err) {
      console.log(err);
    } else {
      var bestSellerProducts = products.sort((a, b) => {
        return b.sold - a.sold;
      });
      res.render('index', {
        headTitle: 'The kids world | Cửa hàng chuyên kinh doanh quần áo và đồ dùng trẻ em',
        bestSellerProducts: bestSellerProducts.slice(0, 8)
      });
    }
  });
  
});

module.exports = router;
