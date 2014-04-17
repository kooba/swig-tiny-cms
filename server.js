var express = require('express');
var swig = require('swig');
var http = require('http');
var path = require('path');
var app = express();
var cmstag = require('./app/tags/tag-cms');
var passport = require('passport');
var extras = require('swig-extras');
extras.useTag(swig, 'markdown');
var markdown = require('markdown').markdown;
var fs = require('fs');

app.use(express.favicon( __dirname + '/public/img/favicon.png'));


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



//this needs to be before configure? Why?
app.use(function(req, res, next){
    if(req)
        cmstag.isAdmin(req.session && req.session.isAuthenticated);
    next();
});

cmstag.configure(swig, app);

/* app routes */

app.get('/', function (req, res) {
  var text = fs.readFileSync('./app/content/first.txt');
  var mark = markdown.toHTML(text.toString());

  res.render('index', {
    md: mark
  });
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
