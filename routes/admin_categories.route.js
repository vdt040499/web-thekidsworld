const express = require('express');
const router = express.Router();

const adminCategoriesController = require('../controllers/admin_categories.controller');

router.get('/', adminCategoriesController.getCates);
router.get('/add-category', adminCategoriesController.addCate);
router.post('/add-category', adminCategoriesController.addCatePost);

module.exports = router;