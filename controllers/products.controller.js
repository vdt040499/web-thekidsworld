const fs = require('fs-extra');

const Category = require('../models/category.model');
const Product = require('../models/product.model');

//GET all products by category
module.exports.getProductsByCategory = (req, res) => {
    
    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, (err, cat) => {
        Product.find({category: categorySlug}, (err, products) => {
            res.render('product/cat_products', {
                headTitle: cat.title,
                products: products
            });
        });
    }); 
}

//Get product details
module.exports.getProductDetails = (req, res) => {
    
    var galleryImages = null;

    Product.findOne({slug: req.params.product}, (err, product) => {
        if(err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, (err, files) => {
                if(err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product/product_detail', {
                        headTitle: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            })
        }
    });
}

