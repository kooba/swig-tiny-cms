var express = require('express');
var swig = require('swig');
var http = require('http');
var path = require('path');
var app = express();
var cmstag = require('./app/tags/tag-cms');


app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');
// Optional: use swig's caching methods
// app.set('view cache', false);



//this needs to be before configure? Why?
app.use(function(req, res, next){
    if(req)
        cmstag.isAdmin(req.session && req.session.isAuthenticated);
    next();
});

cmstag.configure(swig, app);

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
