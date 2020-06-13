var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'The kids world | Cửa hàng chuyên kinh doanh quần áo và đồ dùng trẻ em'
  });
});

module.exports = router;
