var Category = require('../models/category.model');

//GET categories index
module.exports.getCates = (req, res) => {
    Category.find((err, cates) => {
        if(err) {
            console.log(err);
        } else {
            res.render('admin/categories', {
                headTitle: "Admin categories",
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

    res.render('admin/add_category', {
        headTitle: 'Add category',
        title: title,
        level: level,
        prelevel: prelevel
    });
}

//POST add category
module.exports.addCatePost = (req, res) => {
    
    req.checkBody('title', 'Title is required!');
    req.checkBody('prelevel', 'Prelevel is required!');

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var level = parseInt(req.body.level);
    var prelevel = req.body.prelevel;

    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_category', {
            headTitle: 'Add category',
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
                        prelevel: prelevel,
                        user: null
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
    req.checkBody('title', 'Title is required!').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/edit_category', {
            
        })
    }
}