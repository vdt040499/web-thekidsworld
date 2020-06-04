var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users.controller');

router.get('/signup', usersController.signup);

module.exports = router;
