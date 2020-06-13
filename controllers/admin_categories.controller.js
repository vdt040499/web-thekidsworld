var Category = require('../models/category.model');

//GET categories index
module.exports.getCates = (req, res) => {
    Category.find((err, cates) => {
        if(err) {
            console.log(err);
        } else {
            res.render('admin/categories', {
                title: "Admin categories",
                cates: cates
            });
        }
    });
}