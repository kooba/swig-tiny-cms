var fs = require('fs');
var marked = require('marked');
var watch = require('node-watch');

var admin = false;
var preContent = '';
var postContent = '';
var request;

/**
 * Swig compilation
 */

exports.parse = function () {
  return true;
};

exports.ends = false;
exports.blockLevel = false;

/**
 * Custom Swig compilation:
 * 1. Strip incoming file (args[0]) from additional quotations.
 * 2. Grab existing content file if exists.
 * 3. Replace extra \r characters:
 *      Swig stuffs more \n characters in their place and in turn
 *      they are converted into additional break <br/> tags by Marked.
 * 4. Swig compilation
 * 5. Add pre and post content HTML based on permissions for editing.
 * More info about Swig compilation here: //TODO:Swig compilation docs
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {

  var fileId = args[0].replace(/\'/g, "").replace(/\"/g, "");
  var text = '';
  if (fs.existsSync('./app/content/' + fileId)) {
    text = fs.readFileSync('./app/content/' + fileId).toString();
    text = text.replace(/\r/g, "");
  }

  content.push(text);

  return '(function () {\n' +
    '  var __o = _output;\n' +
    '  _output = "";\n' +
    compiler(content, parents, options, blockName) + ';\n' +
    '  __o += _ext.preContent() + _ext.convertToHtml(_output) + _ext.postContent("' + fileId + '")  ;\n' +
    '  _output = __o;\n' +
    '})();\n';
};

/**
 * Hook into Swig CMS to allow for authorized users to edit content.
 * @param bool isAdmin
 */
exports.isAdmin = function (isAdmin) {
  admin = isAdmin;
};

/**
 * All middleware and request handlers for Swig CMS
 * @param {object} swig - instance of Swig
 * @param {object} app - instance of express app.
 * @param {object} options - Swig CMS options.
 *
 * @options example
 * var options =  {
 *  route: 'express-cms', // Route used by Swig CMS internally. Optional, defaults to 'express-cms'
 *  bowerComponents: '/components'
 * }
 */
exports.configure = function (swig, app, options) {

  options = vlidateOptions(options);

  //Grab request for all the needs.
  app.use(function (req, res, next) {
    if (admin) {
      request = req;
      //TODO Render some js on the client side to allow for easy editing
    }
    next();
  });

  swig.setExtension('preContent', function () {
    if (admin)
      return preContent;
    else
      return preContent;
  });

  swig.setExtension('postContent', function (fieldId) {
    if (admin)
      return postContent + "<br/><a href=/" + options.route + "/edit/" + fieldId + "?refUrl=" + request.url + ">Edit</a>";
    else
      return preContent;
  });

  swig.setExtension('convertToHtml', function (content) {
    return require('marked')(content);
  });

  swig.setTag('cms', this.parse, this.compile, this.ends, this.blockLevel);

  //TODO: Make beginning of route configurable
  app.post('/' + options.route + '/save', function (req, res) {
    var content = req.body.content;
    var contentId = req.body.contentId;
    fs.writeFileSync('./app/content/' + contentId, content);
    swig.invalidateCache();
    res.redirect(req.body.returnUrl);
  });

  app.get('/' + options.route + '/edit/:contentId', function (req, res) {

    if(admin) {
      var content = '';
      if (fs.existsSync('./app/content/' + req.params.contentId)) {
        content = fs.readFileSync('./app/content/' + req.params.contentId).toString();
      }
      res.render(__dirname + '/index', {
        contentId: req.params.contentId,
        content: content,
        markedjs: options.bowerComponents + '/marked/lib/marked.js',
        returnUrl: req.query.refUrl
      });
    } else {
      res.redirect(req.query.refUrl);
    }

  });

  /**
   * This provides support for multiple node processes
   * Each will need to refresh swig cache.
   */

  watch('./app/content/', function() {
    swig.invalidateCache();
  });
};

/**
 * Validate options and set defaults
 * @param {object} options
 * @return {object} options
 */
var vlidateOptions = function(options) {

  if(!options.route)
    options.route = 'express-cms';

  console.log(options);
  return options;
};