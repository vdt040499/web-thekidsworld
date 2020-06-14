const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const adminCategoriesController = require('../controllers/admin_categories.controller');

router.get('/', isAdmin, adminCategoriesController.getCates);
router.get('/add-category', isAdmin, adminCategoriesController.addCate);
router.post('/add-category', adminCategoriesController.addCatePost);
router.get('/edit-category/:id', isAdmin,adminCategoriesController.editCate);
router.post('/edit-category/:id', adminCategoriesController.editCatePost);
router.get('/delete-category/:id', isAdmin, adminCategoriesController.deleteCate);

module.exports = router;