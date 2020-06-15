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
