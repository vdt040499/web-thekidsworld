const passport = require('passport');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/user.model');
const Order = require('../models/order.model');

//GET signup
module.exports.signup = (req, res) => {
    var username = "";
    var email = "";
    var phone = "";
    var address = "";

    res.render('users/signup', {
        headTitle: "Đăng kí",
        username: username,
        email: email,
        phone: phone, 
        address: address
    });
}

//POST signup
module.exports.signupPost = (req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var phone = req.body.phone;
    var province = req.body.province;
    var district = req.body.district;
    var ward = req.body.ward;
    var address = req.body.address;
    var password = req.body.password;
    var repass = req.body.repass;

    req.checkBody('username', 'Vui lòng nhập tên đăng nhập').notEmpty();
    req.checkBody('email', 'Vui lòng nhập email').isEmail();
    req.checkBody('phone', 'Vui lòng nhập số điện thoại').notEmpty();
    req.checkBody('province', 'Vui lòng chọn tỉnh/thành phố').notEmpty();
    req.checkBody('district', 'Vui lòng chn quận/huyện').notEmpty();
    req.checkBody('ward', 'Vui lòng nhập phường/xã').notEmpty();
    req.checkBody('address', 'Vui lòng nhập địa chỉ cụ thể').notEmpty();
    req.checkBody('password', 'Vui lòng nhập mật khẩu').notEmpty();
    req.checkBody('repass', 'Vui lòng nhập lại mật khẩu xác nhận').equals(password);

    var errors = req.validationErrors();

    if(errors) {
        res.render('users/signup', {
            headTitle: 'Đăng kí',
            username: username,
            email: email,
            phone: phone,
            address: address,
            errors: errors,
            user: null
        })
    } else {
        User.findOne({username: username}, (err, user) => {
            if(err) console.log(err);

            if(user) {
                req.flash('danger', 'Tên đăng nhập đã tồn tại! Vui chọn tên khác');
                res.redirect('/users/signup');
            } else {

                var prov, dist, ward2;

                var provinces = JSON.parse(fs.readFileSync('./public/files/Province.txt'));

                provinces.forEach((pro) => {
                    if (pro.id === parseInt(province)) {
                        prov = pro.name;
                    }
                });

                var districts = JSON.parse(fs.readFileSync('./public/files/District.txt'));

                districts.forEach((dis) => {
                    if (dis.id === parseInt(district)) {
                        dist = dis.name;
                    }
                });

                var wards = JSON.parse(fs.readFileSync('./public/files/Ward.txt'));

                wards.forEach((wa) => {
                    if(wa.id === parseInt(ward)) {
                        ward2 = wa.name;
                    }
                });

                var add = `${address}, ${ward2}, ${dist}, ${prov}`;
                var user = new User ({
                    username: username,
                    email: email,
                    phone: phone,
                    address: add,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if(err) console.log(err)

                        user.password = hash;

                        user.save(err => {
                            if(err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Đăng kí tài khoản thành công');
                                res.redirect('/users/signin');
                            }
                        })
                    });
                });
            }
        });
    }
}

//GET signin
module.exports.signin = (req, res) => {
    
    if(res.locals.user) res.redirect('/');

    var username = "";

    res.render('users/signin', {
        headTitle: 'Đăng nhập',
        username: username
    });
}

//POST signin
module.exports.signinPost = (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/signin',
        failureFlash: true
    })(req, res, next);


}

//GET logout
module.exports.logout = (req, res) => {
    req.logout();

    delete req.session.cart;

    req.flash('success', 'Bạn đã đăng xuất');
    res.redirect('/users/signin');
}

//GET profile
module.exports.account = (req, res) => {
    var user = req.user;
    var receiver = '';
    Order.find({ orderBy : user._id }, (err, orders) => {
        var processingOrder = [];
        var shippingOrder = [];
        var completedOrder = [];
        orders.forEach((order) => {
            receiver = order.receiver;
            if(order.status == "Processing") {
                processingOrder.push(order);
            } else if (order.status == "Shipping") {
                shippingOrder.push(order);
            } else {
                completedOrder.push(order);
            }
        });

        var noreceiver = {
            username: '',
            address: '',
            phone: '',
            email: ''
        }

        if (receiver == '') {
            receiver = noreceiver;
        } else {
            receiver = JSON.parse(receiver);
        }

        res.render('users/account', {
            headTitle: 'Tài khoản',
            user: user,
            receiver: receiver,
            processingOrder: processingOrder,
            shippingOrder: shippingOrder,
            completedOrder: completedOrder,
        });
    })
   
}

//GET forgotPass
module.exports.forgotPass = (req, res) => {
    var email = "";

    res.render('users/forgot_pass', {
        headTitle: "Quên mật khẩu",
        email: email
    })
}

//POST forgotPass
module.exports.forgotPassPost = async (req, res) => {
    var email = req.body.email;

    req.checkBody('email', 'Vui lòng nhập email').isEmail();

    let errors = req.validationErrors();

    if(errors) {
        res.render('users/forgot_pass', {
            headTitle: "Quên mật khẩu",
            email: email
        });
    } else {
        async.waterfall([
            function(done){
              crypto.randomBytes(3, (err, buf) => {
                  if (err) throw err;
                  const token = buf.toString('hex');
                  done(err, token)
              });
            },
        
            function(token, done){
              User.findOne({email: email}, function(err, user){
                  console.log(user);
                  if(!user){
                   req.flash('danger', 'Tài khoản không tồn tại');
                   res.render('users/forgot_pass', {
                        headTitle: "Quên mật khẩu",
                        email: email,
                        user: null
                   });
                  } else {
                    user.resetToken = token;
                    user.resetTokenExpires = Date.now() + 360000 //1 hour
          
                    user.save(function (err){
                      done(err, token, user)
                    });
                  }         
              });
            },
        
            function(token, user, done){
              const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_PASSWORD,
                }
              });
        
              const mailOptions = {
                from: 'vdt040499@gmail.com',
                to: user.email,
                subject: 'Xác nhận quên mật khẩu',
                text: 'Dùng mã này để đổi mật khẩu: ' + token
              };
        
              transporter.sendMail(mailOptions, function(err, data){
                  if(err){
                    console.log('Error occurs: %s', err);
                  }else{
                    req.flash('success', 'Đã gửi mã xác nhận đến email ' + user.email + '. Vui lòng kiểm tra email của bạn');
                    return res.render('users/reset_pass',{
                        headTitle: "Đặt lại mật khẩu",
                        verify: "",
                        username: user.username,
                        user: null
                    });
                  }
              });
            }
        ]);
    }
}

//POST resetpass
module.exports.resetPassPost = (req, res) => {
    let newPass = req.body.newPass;
    let reenterNewPass = req.body.reenterNewPass;
    let verify = req.body.verify;
    let username = req.body.username;

    console.log(username);

    req.checkBody('newPass', 'Vui lòng nhập mật khẩu').notEmpty();
    req.checkBody('reenterNewPass', 'Vui lòng nhập lại mật khẩu xác nhận').equals(newPass);

    var errors = req.validationErrors();

    if(errors) {
        res.render('users/reset_pass', {
            headTitle: "Đặt lại mật khẩu",
            verify: verify,
            username: username, 
            errors: errors,
            user: null
        })
    } else {

        User.findOne({ username: username }).then((user) => {
            if (user.resetToken === undefined || user.resetTokenExpires === undefined) {
                req.flash('danger', 'Bạn chưa gửi yêu cầu xác nhận đặt lại mật khẩu')
                res.render('users/reset_pass', {
                    headTitle: "Đặt lại mật khẩu",
                    verify: verify,
                    username: username,
                    user: null
            });
            } else {
            if (Date.now > user.resetTokenExpires) {
                user.resetToken = undefined;
                user.resetTokenExpires = undefined;
                user.save();
                req.flash('danger', 'Xin lỗi! Mã xác nhận của bạn không còn hiệu lực')
                res.redirect('/users/forgot-pass');
            } else {
                if (newPass === reenterNewPass) {
                if (req.body.verify === user.resetToken) {
                    user.password = bcrypt.hashSync(newPass, 10);
                    user.resetToken = undefined;
                    user.resetTokenExpires = undefined;
                    user.save();
                    req.flash('success', 'Đổi mật khẩu thành công');
                    res.redirect('/users/signin');
                } else {
                    req.flash('danger', 'Mã xác nhận không đúng');
                    res.render('users/reset_pass', {
                        headTitle: "Đặt lại mật khẩu",
                        verify: verify,
                        username: username,
                        user: null
                    });
                }
                } else {
                    req.flash('danger', 'Mật khẩu không khớp');
                    res.render('users/reset_pass', {
                        headTitle: "Đặt lại mật khẩu",
                        verify: verify,
                        username: username,
                        user: null
                    });
                }
            }
            }
        });
    }
}

