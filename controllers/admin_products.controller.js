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

//GET edit product
module.exports.editProduct = (req, res) => {

    var errors;

    if(req.session.errors) errors = req.session.errors;

    req.session.errors = null;

    Category.find((err, cates) => {
        Product.findById(req.params.id, (err, p) => {
            if(err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if(err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            headTitle: 'Edit product',
                            errors: errors,
                            id: p._id,
                            name: p.name,
                            desc: p.desc,
                            price: parseInt(p.price),
                            image: p.image,
                            totalQuantity: p.totalQuantity,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            cates: cates,
                            galleryImages: galleryImages
                        });
                    }
                });
            }
        });
    });
}

//POST edit product
module.exports.editProductPost = (req, res) => {
    if(!req.files) {
        imageFile = "";
    } else {
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('name', 'Name must have a value!').notEmpty();
    req.checkBody('desc', 'Description must have a value!').notEmpty();
    req.checkBody('price', 'Price must have a value!').isDecimal();
    req.checkBody('image', 'You must upload an image!').isImage(imageFile);

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var totalQuantity = req.body.totalQuantity;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, (err, p) => {
            if(err) {
                console.log(err);
            }

            if(p) {
                res.flas('danger', 'Product exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, p) => {
                    if(err) {
                        console.log(err);
                    } else {
                        p.name = name;
                        p.slug = slug;
                        p.desc = desc;
                        p.price = parseInt(price);
                        p.category = category;
                        p.totalQuantity = totalQuantity;
                        if (imageFile != "") {
                            p.image = imageFile;
                        }

                        p.save((err) => {
                            if(err) {
                                console.log(err);
                            } 

                            if (imageFile != "") {
                                if(pimage != "") {
                                    fs.remove('public/product_images/' + id + '/' + pimage, (err) => {
                                        if(err) console.log(err);
                                    });
                                }

                                var productImage = req.files.image;
                                var path = 'public/product_images/' + id + '/' + imageFile;

                                productImage.mv(path, (err) => {
                                    return console.log(err);
                                });
                            } 

                            req.flash('success', 'Product edited!');
                            res.redirect('/admin/products/edit-product/' + id);
                        });
                    }
                });
            }
        });
    }
}

//POST product gallery
module.exports.productGallery = (req, res) => {
    
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err) {
        if(err) console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);
}

//GET delete image
module.exports.deleteImage = (req, res) => {
    
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err) {
        if(err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
}

//GET delete product
module.exports.deleteProduct = (req, res) => {
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function(err) {
        if(err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function(err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });
}