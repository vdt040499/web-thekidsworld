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
const env = require('dotenv');

var app = express();
env.config();

//Get database
const config = require('./config/database');

// //Connect to MongoDB Local
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }, err => {
//     if(err) throw err
//     console.log('Connect MongoDB Successfully!')
// });

// Connect to Cloud MongoDB
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.mfg8v.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`, 
                {
                    useNewUrlParser: true, 
                    useUnifiedTopology: true,
                    useCreateIndex: true
}).then(() => {
    console.log("Database connected!");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Default middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Get category model
const Category = require('./models/category.model');

//Get all categories for header.ejs
Category.find((err, cates) => {
  if (err) {
    console.log(err);
  } else {
    app.locals.cates = cates;
  }
});

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

//Google passport config
require('./config/ggpassport')(passport);

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
const adminOrdersRoute = require('./routes/admin_orders.route');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.route');
const cartRouter = require('./routes/cart.route');
const productsRouter = require('./routes/products.route');
const ordersRouter = require('./routes/orders.route');

app.use('/admin/categories', adminCategoriesRoute);
app.use('/admin/products', adminProductsRoute);
app.use('/admin/orders', adminOrdersRoute);
app.use('/cart', cartRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
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
