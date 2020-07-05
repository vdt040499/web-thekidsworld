var Category = require('../models/category.model');

//GET categories index
module.exports.getCates = (req, res) => {
    Category.find((err, cates) => {
        if(err) {
            console.log(err);
        } else {
            res.render('admin/categories', {
                headTitle: "Danh mục",
                cates: cates
            });
        }
    });
}

//GET add category
module.exports.addCate = (req, res) => {
    var title = "";
    var level = 0;
    var prelevel = "";

    Category.find((err, cates) => {
        if(err) {
            console.log(err);
        } else {
            const root = {
                title: "",
                level: 0,
                prelevel: "",
                slug: ""
            }

            cates.push(root);

            res.render('admin/add_category', {
                headTitle: 'Thêm danh mục',
                title: title,
                level: level,
                prelevel: prelevel,
                cates: cates
            });
        }
    });
}

//POST add category
module.exports.addCatePost = (req, res) => {
    
    var title = req.body.title;
    var slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();
    var level = parseInt(req.body.level);
    var prelevel = req.body.prelevel;

    req.checkBody('title', 'Vui lòng nhập tiêu đề danh mục').notEmpty();
    req.checkBody('level', 'Vui lòng nhập level').isDecimal();

    var errors = req.validationErrors();

    if(errors) {
        Category.find((err, cates) => {
            if(err) {
                console.log(err);
            } else {
                const root = {
                    title: "",
                    level: 0,
                    prelevel: "",
                    slug: ""
                }
    
                cates.push(root);
    
                res.render('admin/add_category', {
                    headTitle: 'Thêm danh mục',
                    errors: errors,
                    title: title,
                    level: level,
                    cates: cates
                });
            }
        });
        
    } else {
        Category.findOne({slug: slug}, (err, existCate) => {
            if(err) {
                console.log(err);
            } else {
                if(existCate) {
                    req.flash('danger', 'Tiêu đề danh mục đã tồn tại! Chọn một tiêu để khác!');
                    res.render('admin/add_category', {
                        headtitle: 'Thêm danh mục',
                        title: title,
                        level: level
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

                            req.flash('success', 'Danh mục đã được thêm');
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
            Category.find((err, cates) => {
                if(err) {
                    console.log(err);
                } else {
                    const root = {
                        title: "",
                        level: 0,
                        prelevel: "",
                        slug: ""
                    }
        
                    cates.push(root);
        
                    res.render('admin/edit_category', {
                        headTitle: "Chỉnh sửa danh mục",
                        title: cate.title,
                        level: cate.level,
                        prelevel: cate.prelevel,
                        id: cate._id,
                        cates: cates
                    });
                }
            });
        }
    });
}

//POST edit category
module.exports.editCatePost = (req, res) => {

    var title = req.body.title;
    var slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();
    var level = req.body.level;
    var prelevel = req.body.prelevel;
    var id = req.params.id;

    req.checkBody('title', 'Vui lòng nhập tiêu đề danh mục').notEmpty();

    var errors = req.validationErrors();

    if(errors) {
        Category.find((err, cates) => {
            if(err) {
                console.log(err);
            } else {
                const root = {
                    title: "",
                    level: 0,
                    prelevel: "",
                    slug: ""
                }
    
                cates.push(root);

                res.render('admin/edit_category', {
                    headTitle: 'Chỉnh sửa danh mục',
                    errors: errors,
                    id: id,
                    title: title,
                    level: level,
                    prelevel: prelevel,
                    cates: cates
                });
            }
        });
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, (err, existCate) =>  {
            if(err) {
                console.log(err);
            } else {
                if(existCate) {
                    req.flash('danger', 'Danh mục đã tồn tại! Hãy chọn một tên khác');
                    res.render('admin/edit-category', {
                        headTitle: 'Chỉnh sửa danh mục',
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
    
                                    req.flash('success', 'Chỉnh sửa danh mục thành công');
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

            req.flash('success', 'Xóa danh mục thành công');
            res.redirect('/admin/categories');
        }
    });
}