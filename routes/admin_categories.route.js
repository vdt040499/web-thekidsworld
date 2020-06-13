const express = require('express');
const router = express.Router();

const adminCategoriesController = require('../controllers/admin_categories.controller');

router.get('/', adminCategoriesController.getCates);
router.get('/add-category', adminCategoriesController.addCate);
router.post('/add-category', adminCategoriesController.addCatePost);
router.get('/edit-category/:id', adminCategoriesController.editCate);
router.post('/edit-category/:id', adminCategoriesController.editCatePost);

module.exports = router;