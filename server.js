var express = require('express'),
  swig = require('swig'),
  http = require('http'),
  app = express(),
  urltag = require('./app/tags/tag-url'),
  people = [
    { name: 'Paul', age: 28 },
    { name: 'Jane', age: 26 },
    { name: 'Jimmy', age: 45 }
  ],
  cmstag = require('./app/tags/tag-cms');

// NOTE: It is preferred to use consolidate.js
// However, we can't do that in this example, because the example uses
// The uninstalled version of swig for testing purposes
// Please see the documentation for proper use with Express

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');
// Optional: use swig's caching methods
// app.set('view cache', false);


swig.setExtension('url', function (urlname) {
  var urls = {
    dashboard: 'dashboard',
    settings: 'settings'
  };
  return urls[urlname];
});

swig.setTag('url', urltag.parse, urltag.compile, urltag.ends, urltag.blockLevel);

swig.setTag('cms', cmstag.parse, cmstag.compile, cmstag.ends, cmstag.blockLevel);


app.get('/', function (req, res) {
  res.render('index', {});
});

app.get('/people', function (req, res) {
  res.render('people', { people: people });
});

app.get('/people/:id', function (req, res) {
  res.render('person', { person: people[req.params.id] });
});

app.get('/*', function (req, res) {
  res.render(req.params[0], {});
});



app.listen(1337);
console.log('Application Started on http://localhost:1337/');
