var express = require('express');
var router = express.Router();
const auth = require('../config/auth');
const isUser = auth.isUser;

const usersController = require('../controllers/users.controller');

router.post('/editaddress', usersController.editAddressPost);
router.get('/signup', usersController.signup);
router.post('/signup', usersController.signupPost);
router.get('/signin', usersController.signin);
router.post('/signin', usersController.signinPost);
router.get('/logout', usersController.logout);
router.get('/forgot-pass', usersController.forgotPass);
router.post('/forgot-pass', usersController.forgotPassPost);
router.post('/reset-pass', usersController.resetPassPost);
router.get('/edituser/:user', isUser, usersController.editUser);
router.post('/edituser', usersController.editUserPost);
router.get('/changepass/:user', isUser, usersController.changePass);
router.post('/changepass/:user', usersController.changePassPost);
router.get('/account', isUser, usersController.account);

module.exports = router;
