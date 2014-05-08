var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookies = require('cookie-parser');
var session = require('express-session');
var app = express();
var swig = require('swig');
var path = require('path');
var swigCms = require('../../index.js');
var fs = require('fs');
var passport = require('passport');


app.use(favicon(__dirname + '/public/img/favicon.png'));
app.use(cookies());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(express.static(path.join(__dirname, 'public')));

//Configure Passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

/**
 * Swig Setup
 */
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');

/**
 * 1. Set Swig Tiny-CMS options.
 */

var options = {
  contentDirectory:  __dirname + '/content/'
};

/**
 * 2. Provide a way for Swig Tiny-CMS to know when user is authorized to edit content.
 */

app.use(function (req, res, next) {
  swigCms.canEditContent(req.session && req.session.isAuthenticated);
  next();
});


/**
 * 3. Initialize Swig CMS
 */
swigCms.initialize(swig, app, options);

/**
 * Sample app routes
 */

app.get('/', function (req, res) {
  res.render('index', {});
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/', failureFlash: false}),
  function (req, res) {
  req.session.isAuthenticated = true;
  res.redirect('/');
});

app.post('/logout', function (req, res) {
  req.session.isAuthenticated = false;
  res.redirect('/');
});

app.listen(1337);
console.log('Application Started on http://localhost:1337/');
