const express = require('express');
const router = express.Router();

const adminCategoriesController = require('../controllers/admin_categories.controller');

router.get('/', adminCategoriesController.getCates);

module.exports = router;