var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const fileUpload = require('express-fileupload');

var app = express();

//Get database
const config = require('./config/database');

//Connect to MongoDB
mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err
    console.log('Connect MongoDB Successfully!')
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Default middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Express file upload middleware
app.use(fileUpload());

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

//Express validator (5.3.1)
app.use(validator({
  errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
              , root = namespace.shift()
              , formParam = root;

      while (namespace.length) {
          formParam += '[' + namespace.shift() + ']';
      }
      return {
          param: formParam,
          msg: msg,
          value: value
      };
  },
  customValidators: {
      isImage: function (value, filename) {
          var extension = (path.extname(filename)).toLowerCase();
          switch (extension) {
              case '.jpg':
                  return '.jpg';
              case '.jpeg':
                  return '.jpeg';
              case '.png':
                  return '.png';
              case '':
                  return '.jpg';
              default:
                  return false;
          }
      }
  }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Passport config
require('./config/passport')(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global errors variable
app.locals.errors = null;

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

//Set routes
const adminCategoriesRoute = require('./routes/admin_categories.route');
const adminProductsRoute = require('./routes/admin_products.route');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.route');
const cartRouter = require('./routes/cart.route');
const productsRouter = require('./routes/products.route');

app.use('/admin/categories', adminCategoriesRoute);
app.use('/admin/products', adminProductsRoute);
app.use('/cart', cartRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
