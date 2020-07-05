exports.isUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Vui lòng đăng nhập');
        res.redirect('/users/signin');
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        next();
    } else {
        req.flash('danger', 'Vui lòng đăng nhập tài khoản admin');
        res.redirect('/users/signin');
    }
}