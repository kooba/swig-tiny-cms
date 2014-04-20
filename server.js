var express = require('express');
var swig = require('swig');
var http = require('http');
var path = require('path');
var app = express();
var swigCms = require('./app/tags/tag-cms');
var fs = require('fs');
var markdown = require('markdown').markdown;
var marked = require('marked');

var extensions = require('swig-extensions');
//var mySwig = new swig.Swig();

extensions.useTag(swig, 'markdown');

app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));


app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');
//app.use(require('connect-livereload')());
// Optional: use swig's caching methods
// app.set('view cache', false);
app.use(express.static(path.join(__dirname, 'public')));

/*
    Provide a way for swigCms to know when user is authorized to edit content.
 */


//TODO:this needs to be before configure? Why?
app.use(function(req, res, next){
    if(req)
        swigCms.isAdmin(req.session && req.session.isAuthenticated);
    next();
});

/**
 * Set swig-cms options here.
 *
 */

var swigCmsOptions = {
  bowerComponents: "/components"
};

swigCms.configure(swig, app, swigCmsOptions);

/* app routes */

app.get('/', function (req, res) {

  var text = fs.readFileSync('./app/content/first.txt').toString();
  res.render('index', {
    md: markdown.toHTML(text),
    marked: marked(text)
  });
});

app.get('/about', function (req, res) {
    res.render('about', {});
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
