const passport = require('passport');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const select = require('../config/select_address');

const User = require('../models/user.model');
const Order = require('../models/order.model');
const { findOne } = require('../models/user.model');

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
        var cancelOrder = [];
        orders.forEach((order) => {
            receiver = order.receiver;
            if(order.status == "Processing") {
                processingOrder.push(order);
            } else if (order.status == "Shipping") {
                shippingOrder.push(order);
            } else if (order.status == "Completed") {
                completedOrder.push(order);
            } else {
                cancelOrder.push(order);
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
            cancelOrder: cancelOrder
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

//GET edit user info
module.exports.editUser = async(req, res) => {

    let slug  = req.params.user;

    let user = await User.findOne({username: slug});

    let username = user.username;
    let email = user.email;
    let phone = user.phone;
    let oldaddress = user.address;

    res.render('users/edit_user', {
        headTitle: "Thay đổi thông tin",
        username: username,
        email: email,
        phone: phone,
        oldaddress: oldaddress
    });
}

//POST edit address
module.exports.editAddressPost = async(req, res) => {
    let tempUser = req.user;
    let province = req.body.province;
    let district = req.body.district;
    let ward = req.body.ward;
    let address = req.body.address;

    req.checkBody('province', 'Vui lòng chọn tỉnh/thành phố').notEmpty();
    req.checkBody('district', 'Vui lòng chn quận/huyện').notEmpty();
    req.checkBody('ward', 'Vui lòng nhập phường/xã').notEmpty();
    req.checkBody('address', 'Vui lòng nhập địa chỉ cụ thể').notEmpty();

    let errors = req.validationErrors();

    if(errors) {
        req.flash('danger', 'Có lỗi xảy ra vui lòng nhập lại');
        res.redirect('/users/account');
    } else {
        let user = await User.findOne({username: tempUser.username});

        var address2 = select.address(address, province, district, ward);

        user.address = address2;

        await user.save();

        req.flash('success', 'Cập nhật thành công');
        res.redirect('/users/account');
    }
}

//POST edit user info
module.exports.editUserPost = async(req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let phone = req.body.phone;
    let user = req.user;
    console.log(user);
   
    req.checkBody('username', 'Vui lòng nhập tên đăng nhập').notEmpty();
    req.checkBody('email', 'Vui lòng nhập email').isEmail();
    req.checkBody('phone', 'Vui lòng nhập số điện thoại').notEmpty();

    let errors = req.validationErrors();

    if(errors) {
        res.render('users/edit_user', {
            headTitle: "Thay đổi thông tin",
            username: username,
            email: email,
            phone: phone,
            errors: errors
        })
    } else {
        const existUser = await User.findOne({username: username, _id: {'$ne': user._id}});

        if (existUser) {
            req.flash('danger', 'Tên đăng nhập đã tồn tại');
            res.render('users/edit_user', {
                headTitle: "Thay đổi thông tin",
                username: username,
                email: email,
                phone: phone,
                user: req.user
            })
        } else {
            let user2 = await User.findById(user._id);

            user2.username = username;
            user2.email = email;
            user2.phone = phone;

            await user2.save();

            req.flash('success', 'Cập nhật thành công');
            res.redirect('/users/account');
        }
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

//GET changepass
module.exports.changePass = (req, res) => {
    let username = req.params.user;
    let oldpass = "";
    let newpass = "";
    let reenternewpass = "";

    res.render('users/changepass', {
        headTitle: "Thay đổi mật khẩu",
        oldpass: oldpass,
        newpass: newpass,
        reenternewpass: reenternewpass,
        username: username
    });
}

//POST changepass
module.exports.changePassPost = async(req, res) => {
    let username = req.params.user;
    let oldpass = req.body.oldpass;
    let newpass = req.body.newpass;
    let reenternewpass = req.body.reenternewpass;

    const user = await User.findOne({username: username});
    console.log(username);
    
    if(oldpass === newpass) {
        req.flash('danger', 'Mật khẩu mới và mật khẩu cũ trùng nhau! Hãy chọn mật khẩu khác');
        res.render('users/changepass', {
            headTitle: "Thay đổi mật khẩu",
            username: username,
            oldpass: oldpass,
            newpass: newpass,
            reenternewpass: reenternewpass,
            user: req.user
        });
    } else if(newpass !== reenternewpass) {
        req.flash('danger', 'Mật khẩu và nhập lại mật khẩu không khớp nhau');
        res.render('users/changepass', {
            headTitle: "Thay đổi mật khẩu",
            username: username,
            oldpass: oldpass,
            newpass: newpass,
            reenternewpass: reenternewpass,
            user: req.user
        });
    } else if (await bcrypt.compare(oldpass, user.password)) {
        req.flash('success', 'Thay đổi mật khẩu thành công');
        res.redirect('/users/account');
    } else {
        req.flash('danger', 'Mật khẩu cũ không đúng');
        res.render('users/changepass', {
            headTitle: "Thay đổi mật khẩu",
            username: username,
            oldpass: oldpass,
            newpass: newpass,
            reenternewpass: reenternewpass,
            user: req.user
        });
    }
}

