const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const Product = require('../models/product.model');
const Category = require('../models/category.model');

//GET products index
module.exports.getProducts = (req, res) => {
    var count;

    Product.count((err, c) => {
        count = c;
    });

    Product.find((err, products) => {
        if(err) {
            console.log(err);
        } else {
            res.render('admin/products', {
                headTitle: 'Admin products',
                products: products,
                count: count
            });
        }
    });
}

//GET add products
module.exports.addProduct = (req, res) => {
    var name = "";
    var desc = "";
    var price = "";
    var category = "";
    var totalQuantity = 50;

    Category.find((err, cates) => {
        if(err) {
            console.log(err);
        } else {
            res.render('admin/add_product', {
                headTitle: 'Add product',
                name: name,
                desc: desc,
                price: price,
                category: category,
                totalQuantity: totalQuantity, 
                cates: cates
            });
        }
    });
}

//POST add product
module.exports.addProductPost = (req, res) => {

    if (!req.files) { 
        imageFile =""; 
    }
    
    if (req.files) {
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
    
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('desc', 'Description is required!').notEmpty();
    req.checkBody('price', 'Price is required!').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var totalQuantity = req.body.totalQuantity;
    
    var errors = req.validationErrors();

    if(errors) {
        Category.find((err, cates) => {
            res.render('admin/add_product', {
                headTitle: 'Add product',
                errors: errors,
                name: name,
                desc: desc,
                price: price,
                totalQuantity: totalQuantity,
                cates: cates
            });
        });
    } else {
        Product.findOne({slug: slug}, (err, existProduct) => {
            if(err) {
                console.log(err);
            } else {
                if(existProduct) {
                    Category.find((err, cates) => {
                        req.flash('danger', 'Product title exists, choose another!');
                        res.render('admin/add_product', {
                            headTitle: 'Add product',
                            name: name,
                            desc: desc,
                            price: price,
                            totalQuantity: totalQuantity,
                            cates: cates
                        });
                    });
                } else {
                    const product = new Product({
                        name: name,
                        slug: slug,
                        desc: desc,
                        price: parseInt(price),
                        category: category,
                        totalQuantity: totalQuantity,
                        image: imageFile
                    });

                    product.save((err) => {
                        if(err) {
                            console.log(err);
                        } else {
                            mkdirp('public/product_images/' + product._id, function (err) {
                                return console.log(err);
                            });

                            mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                                return console.log(err);
                            });

                            mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                                return console.log(err);
                            });

                            if(imageFile != "") {
                                var productImage = req.files.image;
                                var path = 'public/product_images/' + product._id + '/' + imageFile;
                                
                                productImage.mv(path, (err) => {
                                    return console.log(err);
                                });
                            }

                            req.flash('success', 'Product added!');
                            res.redirect('/admin/products');
                        }
                    });
                }
            }
        });
    }
}

//GET edit category
module.exports.editCate = (req, res) => {
    Category.findById(req.params.id, (err, cate) => {
        if(err) {
            console.log(err);
        } else {
            res.render('admin/edit_category', {
                headTitle: "Edit category",
                title: cate.title,
                level: cate.level,
                prelevel: cate.prelevel,
                id: cate._id
            });
        }
    });
}

//POST edit category
module.exports.editCatePost = (req, res) => {

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var level = req.body.level;
    var prelevel = req.body.prelevel;
    var id = req.params.id;

    req.checkBody('title', 'Title is required!').notEmpty();
    req.checkBody('prelevel', 'Prelevel is required!').notEmpty();

    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/edit_category', {
            headTitle: 'Edit category',
            errors: errors,
            id: id,
            title: title,
            level: level,
            prelevel: prelevel
        });
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, (err, existCate) =>  {
            if(err) {
                console.log(err);
            } else {
                if(existCate) {
                    req.flash('danger', 'Category slug exists, choose another!');
                    res.render('admin/edit-category', {
                        headTitle: 'Edit category',
                        title: title,
                        level: level,
                        prelevel: prelevel
                    });
                } else {
                    Category.findById(id, (err, cate) => {
                        if(err) {
                            console.log(err);
                        } else {
                            cate.title = title;
                            cate.slug = slug;
                            cate.level = parseInt(level);
                            cate.prelevel = prelevel;
            
                            cate.save((err) => {
                                if(err) {
                                    console.log(err) 
                                } else {
                                    Category.find((err, cates) => {
                                        if(err) {
                                            console.log(err);
                                        } else {
                                            req.app.locals.cates = cates;
                                        }
                                    });
    
                                    req.flash('success', 'Category edited!');
                                    res.redirect('/admin/categories');
                                }
                            });
                        }
                    });
                }    
            }
        });
    }
}

//GET delete category
module.exports.deleteCate = (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err, cate) => {
        if(err) {
            console.log(err);
        } else {
            Category.find((err, cates) => {
                if(err) {
                    console.log(err);
                } else {
                    req.app.locals.cates = cates;
                }
            });

            req.flash('success', 'Category deleted!');
            res.redirect('/admin/categories');
        }
    });
}