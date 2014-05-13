var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookies = require('cookie-parser');
var session = require('express-session');
var app = express();
var swig = require('swig');
var swigCms = require('../../index.js');
var passport = require('passport');
var port = process.env.PORT || 1337;

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
 * E.g. using passport's req.isAuthenticated() in the view.
 */
app.use(function (req, res, next) {
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
 * Swig Tiny-CMS Setup
 */

/**
 * Provide a way for Swig Tiny-CMS to know when user is authorized to edit content.
 * Here 'user' is set on a request by passport
 */
app.use(function (req, res, next) {
  if (req.user && req.user.roles.indexOf('Admin') > -1) {
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

  //content directory is required.
  contentDirectory: __dirname + '/content/',

  //optionally pass list of css files that should be used in editor.
  //this will allow you to match editor's preview with your site's rendering.
  css: ['//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.1.1-1/css/simplex/bootstrap.min.css'],

  //optionally set marked render engine options. More info https://github.com/chjj/marked
  markedOptions: { breaks: true }

};

/**
 * Initialize Swig CMS
 */
swigCms.initialize(swig, app, options);


/**
 * Swig Tiny-CMS Setup End
 */

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

app.get('/refresh', function (req, res) {
  refreshFiles();
  res.redirect('/');
});

app.listen(port);

console.log('Application Started');

var refreshFiles = function () {
  var contentDir = path.resolve(__dirname, 'content');
  var contentTemplates = fs.readdirSync(contentDir);
  contentTemplates.forEach(function (value) {
    fs.createReadStream(path.resolve(contentDir, value))
      .pipe(fs.createWriteStream(path.resolve(contentDir, value.replace('.tmpl', ''))));
  });
};

//Refresh site content every 10 minutes.
setInterval(function () {
  refreshFiles();
}, 600000);