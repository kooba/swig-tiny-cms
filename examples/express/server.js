var express = require('express');
var swig = require('swig');
var http = require('http');
var path = require('path');
var app = express();
var swigCms = require('../../index.js');
var fs = require('fs');
var marked = require('marked');


app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));


app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Provide a way for Swig CMS to know when user is authorized to edit content.
 */

app.use(function (req, res, next) {
  swigCms.isAdmin(req.session && req.session.isAuthenticated);
  next();
});

/**
 * Set Swig CMS options here.
 *
 */

var options = {
  bowerComponentsPath: '/components',
  contentDirectory: './content/',
  root: __dirname //TODO:Set it in app config file.
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

app.get('/about', function (req, res) {
  res.render('about', {});
});

app.post('/login', function (req, res) {
  req.session.isAuthenticated = true;
  res.redirect('/');
});

app.post('/logout', function (req, res) {
  req.session.isAuthenticated = false;
  res.redirect('/');
});

app.get('/*', function (req, res) {
  res.render(req.params[0], {});
});

app.listen(1337);
console.log('Application Started on http://localhost:1337/');
