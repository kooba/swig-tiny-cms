var express = require('express');
var swig = require('swig');
var http = require('http');
var path = require('path');
var app = express();
var urltag = require('./app/tags/tag-url');
var people = [
    { name: 'Paul', age: 28 },
    { name: 'Jane', age: 26 },
    { name: 'Jimmy', age: 45 }
  ];
var cmstag = require('./app/tags/tag-cms');
var passport = require('passport');


// bootstrap passport config
require('./app/config/passport')(passport)

// NOTE: It is preferred to use consolidate.js
// However, we can't do that in this example, because the example uses
// The uninstalled version of swig for testing purposes
// Please see the documentation for proper use with Express

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');
// Optional: use swig's caching methods
// app.set('view cache', false);

app.configure(function() {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
});

app.use(express.favicon(path.normalize(__dirname + '/public/img/favicon.png')));

swig.setExtension('url', function (urlname) {
  var urls = {
    dashboard: 'dashboard',
    settings: 'settings'
  };
  return urls[urlname];
});

swig.setTag('url', urltag.parse, urltag.compile, urltag.ends, urltag.blockLevel);

var isAdmin = false;
var sessionId = '';

swig.setExtension('admin', function () {
    if(isAdmin)
        return 'yeah admin - ' + sessionId + ' - ';
    else
        return 'dupa - ' + sessionId + ' - ';
});

swig.setTag('cms', cmstag.parse, cmstag.compile, cmstag.ends, cmstag.blockLevel);

//Set extensions and tag here.
//cmstag.configure(swig);


app.use(function(req, res, next){
    sessionId = req.session.id;
    if(req.session.isAuthenticated) {
        req.isAuthenticated = true;
        isAdmin = true;
    }
    else {
        req.isAuthenticated = false;
        isAdmin = false;
    }

    next();
});

/* swig-cms routes */

app.get('/refresh', function(req, res) {
  swig.invalidateCache();
  res.end();
});

/* app routes */

app.get('/', function (req, res) {
  res.render('index', {});
});

app.post('/login', function(req, res) {
    req.session.isAuthenticated = true;
    res.redirect('/');
});

app.post('/logout', function(req, res) {
    req.session.isAuthenticated = false;
    res.redirect('/');
});

app.get('/*', function (req, res) {
  res.render(req.params[0], {});
});

app.listen(1337);
console.log('Application Started on http://localhost:1337/');
