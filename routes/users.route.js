var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users.controller');

router.get('/signup', usersController.signup);
router.post('/signup', usersController.signupPost);
router.get('/signin', usersController.signin);

module.exports = router;
