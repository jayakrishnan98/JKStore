var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const Razorpay = require('razorpay')

const favicon = require('serve-favicon');   
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars');
var app = express();
var fileupload = require('express-fileupload');
var db = require('./config/connection')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',LayoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(favicon(path.join(__dirname, 'public', 'images','favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());
app.use(session({secret:'Key',cookie:{maxAge:60000000000000000000000000000000000000000000}}))

db.connect((err)=>{
  if(err) console.log('error occured\n'+ err);
  else console.log("Database connected successfully");  
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, onlgity providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
