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
    var ratingAverage = "";
    var totalQuantity = "";

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
                ratingAverage: ratingAverage,
                totalQuantity: totalQuantity, 
                cates: cates
            });
        }
    });
}

//POST add category
module.exports.addCatePost = (req, res) => {
    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var level = parseInt(req.body.level);
    var prelevel = req.body.prelevel;

    req.checkBody('title', 'Title is required!').notEmpty();
    req.checkBody('prelevel', 'Prelevel is required!').notEmpty();

    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_category', {
            headTitle: 'Add category',
            errors: errors,
            title: title,
            level: level,
            prelevel: prelevel
        });
    } else {
        Category.findOne({slug: slug}, (err, existCate) => {
            if(err) {
                console.log(err);
            } else {
                if(existCate) {
                    req.flash('danger', 'Category slug exists, choose another!');
                    res.render('admin/add_category', {
                        headtitle: 'Add category',
                        title: title,
                        level: level,
                        prelevel: prelevel
                    });
                } else {
                    const category = new Category({
                        title: title,
                        slug: slug,
                        level: level,
                        prelevel: prelevel
                    });

                    category.save((err) => {
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

                            req.flash('success', 'Category added!');
                            res.redirect('/admin/categories');
                        }
                    })
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