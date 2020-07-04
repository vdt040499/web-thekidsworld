const fs = require("fs-extra");

const Category = require("../models/category.model");
const Product = require("../models/product.model");
const Rate = require("../models/rate.model");
const User = require("../models/user.model");

//GET all products by category
module.exports.getProductsByCategory = (req, res) => {
  var categorySlug = req.params.category;

  Category.findOne({ slug: categorySlug }, (err, cat) => {
    Product.find({ category: categorySlug }, (err, products) => {
      res.render("product/cat_products", {
        headTitle: cat.title,
        products: products,
      });
    });
  });
};

//GET all best seller products by category
module.exports.getBSPByCategory = (req, res) => {
    Category.findOne({slug: req.params.category}, (err, cate) => {
        console.log(cate)
        if(err) {
            console.log(err);
        } else {
            Product.find({category: req.params.category}, (err, products) => {
                if(err) {
                    console.log(err);
                } else {
                    products.sort((a, b) => {
                        return b.sold - a.sold;
                    });
                    res.render('product/bscat_products', {
                        headTitle: cate.title,
                        products: products
                    });
                }
            });
        }
    });
}

//Get product details
module.exports.getProductDetails = (req, res) => {
  var galleryImages = null;

  Product.findOne({ slug: req.params.product }, (err, product) => {
    if (err) {
      console.log(err);
    } else {
      Product.find({ category: product.category }, (err, cateProducts) => {
        if (err) {
          console.log(err);
        } else {
          var bestSellerCateProducts = cateProducts.sort((a, b) => {
            return b.sold - a.sold;
          });

          Product.find(
            { category: product.category },
            (err, categoryProducts) => {
              if (err) {
              } else {
                var galleryDir =
                  "public/product_images/" + product._id + "/gallery";

                fs.readdir(galleryDir, (err, files) => {
                  if (err) {
                    console.log(err);
                  } else {
                    galleryImages = files;
                    res.render("product/product_detail", {
                      headTitle: product.name,
                      p: product,
                      galleryImages: galleryImages,
                      cateProducts: categoryProducts.slice(0, 4),
                      bestSellerCateProducts: bestSellerCateProducts.slice(
                        0,
                        4
                      ),
                    });
                  }
                });
              }
            }
          );
        }
      });
    }
  });
};

//POST rating
module.exports.rating = (req, res) => {
  let productId = req.params.productId;
  let userId = req.params.userId;
  let ratingValue = parseInt(req.body.ratingValue);
  let comment = req.body.comment;

  Product.findById(productId, (err, product) => {
    var oldAver = parseFloat(product.ratingAverage);
    var oldQty = parseInt(product.ratingQty);
    var tempRateQty = oldQty + 1;
    var tempRateAver = (oldAver * oldQty + ratingValue)/(tempRateQty);
    product.ratingAverage = parseFloat(tempRateAver);
    product.ratingQty = parseInt(tempRateQty);
    product.save();
      User.findById(userId, (err, user) => {
        const rate = new Rate({
          rateBy: user,
          rateIn: product,
          rate: parseInt(ratingValue),
          comment: req.body.comment
        });
  
        rate.save((err) => {
          if(err) {
            console.log(err);
          } else {
            res.redirect(`/products/${product.category}/${product.slug}`);
          }
        });
      });
  });
  console.log(ratingValue, comment);
}
