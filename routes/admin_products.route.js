const express = require('express');
const router = express.Router();

const adminProductsController = require('../controllers/admin_products.controller');

router.get('/', adminProductsController.getProducts);
router.get('/add-product', adminProductsController.addProduct);
router.post('/add-product', adminProductsController.addProductPost);
router.get('/edit-product/:id', adminProductsController.editProduct);
router.post('/edit-product/:id', adminProductsController.editProductPost);
router.post('/product-gallery/:id', adminProductsController.productGallery);
router.get('/delete-image/:image', adminProductsController.deleteImage);

// router.get('/delete-category/:id', adminCategoriesController.deleteCate);

module.exports = router;