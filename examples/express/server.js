var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookies = require('cookie-parser');
var session = require('express-session');
var app = express();
var swig = require('swig');
var passport = require('passport');
var port = process.env.PORT || 1337;
var swigCms;

/**
 * Use NPM module in production
 * otherwise use local instance module for development.
 */
console.log(process.env.NODE_ENV);

if(process.env.NODE_ENV === 'production') {
  swigCms = require('swig-tiny-cms');
} else {
  swigCms = require('../../index.js');
}

/**
 * Express setup
 */
app.use(favicon(__dirname + '/public/img/favicon.png'));
app.use(cookies());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Enable Google Analytics if Tracking ID provided.
 */
app.locals.googleAnalytics = process.env.GOOGLE_ANALYTICS || false;


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

  //content directory is required
  //should be shared directory when used in cluster
  contentDirectory: __dirname + '/content/',

  //optional array of custom CSS files to be used in editor
  css: ['//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.1.1-1/css/simplex/bootstrap.min.css'],

  //optional marked.js options
  //more info: https://github.com/chjj/marked
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

app.get('/refresh', function (req, res, next) {
  refreshContent(function (err) {
    if (err) {
      next(err);
    } else {
      res.redirect('/');
    }
  });
});

/**
 * Allows to refresh content used for Demo
 * @param callback
 */
var refreshContent = function (callback) {

  var contentTemplatesDir = path.resolve(__dirname, 'contentTmpl');
  var contentDir = path.resolve(__dirname, 'content');
  var contentTemplates = fs.readdirSync(contentTemplatesDir);
  var templatesCount = contentTemplates.length;

  if (!fs.existsSync(contentDir)) {
    require('mkdirp').sync(contentDir);
  }

  contentTemplates.forEach(function (value) {

    var reader = fs.createReadStream(path.resolve(contentTemplatesDir, value));
    var writer = fs.createWriteStream(path.resolve(contentDir, value.replace('.tmpl', '')));

    reader.pipe(writer);

    writer.on('finish', function () {
      templatesCount--;
      if (templatesCount === 0) {
        callback(null);
      }
    });

    writer.on('error', function (err) {
      callback(err);
    });

  });
};

/**
 * Refresh content on the app load.
 */
refreshContent(function (err) {
  if (err) {
    console.log('Error during initial content refres: ' + err);
  } else {
    app.listen(port);
    console.log('Application Started');
  }
});

/**
 * Refresh site content every 10 minutes.
 */
setInterval(function () {
  refreshContent(function (err) {
    if (err) {
      console.log(err);
    }
  });
}, 600000);