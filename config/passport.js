const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');

module.exports = (passport) => {
    passport.use(new LocalStrategy((username, password, done) => {
        User.findOne({username: username}, (err, user) => {
            if(err) {
                console.log(err);
            }

            if(!user) {
                return done(null, false, {message: 'Tài khoản không tồn tại'});
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) console.log(err);

                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Sai mật khẩu'});
                }
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}