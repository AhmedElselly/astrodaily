require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var session = require("express-session");
var User = require("./models/user");
var methodOverride = require("method-override");
var passwordMlab = process.env.MLAB_PASSWORD;

var indexRouter = require('./routes/index');
var astroRouter = require("./routes/astro");
var commentRouter = require("./routes/comments");


// mongoose.connect("mongodb://localhost/astro_v4", { 
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

mongoose.connect(`mongodb://ahmed:${passwordMlab}@ds139949.mlab.com:39949/astronomy-daily`, { useNewUrlParser: true,  useUnifiedTopology: true});


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));


app.use(session({
  secret: "I love Julia",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  console.log(res.locals.currentUser);
  console.log(req.user);
  next();
});

app.use('/', indexRouter);
app.use('/astro', astroRouter);
app.use("/astro/:id/comments", commentRouter);

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
