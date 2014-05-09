var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookies = require('cookie-parser');
var session = require('express-session');
var app = express();
var swig = require('swig');
var swigCms = require('../../index.js');
var passport = require('passport');
var path = require('path');


app.use(favicon(__dirname + '/public/img/favicon.png'));
app.use(cookies());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Configure Passport
 */
require('./config/passport')(passport, app);

/**
 * Add request to every response.
 * This is helpful in many situations.
 * E.g. checking passport's req.isAuthenticated() in the view.
 */
app.use(function(req, res, next){
  res.locals.req = req;
  next();
});

/**
 * Regular Swig Setup
 */
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');

/**
 * Provide a way for Swig Tiny-CMS to know when user is authorized to edit content.
 * Here 'user' is set on a request by passport
 */
app.use(function (req, res, next) {
  if(req.user && req.user.roles.indexOf('Admin') > -1) {
    swigCms.canEditContent(true);
  } else {
    swigCms.canEditContent(false);
  }
  next();
});

/**
 * Set Swig Tiny-CMS options.
 */
var options = {
  contentDirectory:  __dirname + '/content/'
};

/**
 * Initialize Swig CMS
 */
swigCms.initialize(swig, app, options);

/**
 * Sample app routes
 */
app.get('/', function (req, res) {
  res.render('index', {});
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: false }),
  function (req, res) {
  res.redirect('/');
});

app.post('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(1337);
console.log('Application Started on http://localhost:1337/');
