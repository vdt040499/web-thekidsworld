const express = require('express');
const router = express.Router();

const adminProductsController = require('../controllers/admin_products.controller');

router.get('/', adminProductsController.getProducts);
router.get('/add-product', adminProductsController.addProduct);
router.post('/add-product', adminProductsController.addProductPost);
// router.get('/edit-category/:id', adminCategoriesController.editCate);
// router.post('/edit-category/:id', adminCategoriesController.editCatePost);
// router.get('/delete-category/:id', adminCategoriesController.deleteCate);

module.exports = router;