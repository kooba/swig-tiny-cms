var fs = require('fs');
var path = require('path');
var marked = require('marked');
var watch = require('node-watch');

var admin = false;
var preContent = '';
var postContent = '';
var request;
var swigCmsOptions;

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
 * 3. Replace extra \r characters.
 *      This is a hack to avoid Swig stuffing more \n characters in place of \r.
 *      They are converted into additional break <br/> tags by Marked.
 * 4. Swig compilation
 * 5. Add pre and post content HTML based on permissions for editing.
 * More info about Swig compilation here: //TODO:Swig compilation docs
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {

  var fileId = args[0].replace(/\'/g, "").replace(/\"/g, "");
  var text = '';

  var filePath = path.join(swigCmsOptions.root, swigCmsOptions.contentDirectory, fileId + '.md');

  if (fs.existsSync(filePath)) {
    text = fs.readFileSync(filePath).toString();
    text = text.replace(/\r/g, "");
  }

  content.push(text);

  return '(function () {\n' +
    '  var __o = _output;\n' +
    '  _output = "";\n' +
    compiler(content, parents, options, blockName) + ';\n' +
    '  __o += _ext.preContent("' + fileId + '") + _ext.convertToHtml(_output) + _ext.postContent("' + fileId + '")  ;\n' +
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
 * Swig CMS Initialization: middleware and request handlers
 * @param {object} swig - instance of Swig
 * @param {object} app - instance of express app.
 * @param {object} options - Swig CMS options.
 */
exports.initialize = function (swig, app, options) {

  swigCmsOptions = validateOptions(options);

  //Grab request for all the needs.
  app.use(function (req, res, next) {
    if (admin) {
      request = req;
      //TODO Render some js on the client side to allow for easy editing
    }
    next();
  });

  swig.setExtension('preContent', function (fileId) {
    if (admin)
      return preContent + "<a href=/" + swigCmsOptions.route + "/edit/" + fileId + "?refUrl=" + request.url + ">Edit</a><div>";
    else
      return preContent;
  });

  swig.setExtension('postContent', function (fileId) {
    if (admin)
      return postContent + "</div>";
    else
      return preContent;
  });

  swig.setExtension('convertToHtml', function (content) {
    return require('marked')(content);
  });

  swig.setTag('cms', this.parse, this.compile, this.ends, this.blockLevel);

  app.get('/' + swigCmsOptions.route + '/edit/:contentId', function (req, res) {

    if (admin) {

      var content = '';
      var filePath = path.join(swigCmsOptions.root, swigCmsOptions.contentDirectory, req.params.contentId + '.md');

      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath).toString();
      }

      res.render(__dirname + '/editor.md.html', {
        contentId: req.params.contentId,
        content: content,
        markedjs: swigCmsOptions.bowerComponentsPath + '/marked/lib/marked.js',
        returnUrl: req.query.refUrl,
        swigCmsRoute: swigCmsOptions.route
      });

    } else {
      res.redirect(req.query.refUrl);
    }

  });

  app.post('/' + swigCmsOptions.route + '/save', function (req, res) {
    var content = req.body.content;
    var contentId = req.body.contentId;
    fs.writeFileSync(path.join(swigCmsOptions.root, swigCmsOptions.contentDirectory, contentId + '.md'), content);
    swig.invalidateCache();
    res.redirect(req.body.returnUrl);
  });

  /**
   * This provides support for node cluster.
   * Each node process will need to refresh swig cache.
   */

  watch(swigCmsOptions.contentDirectory, function () {
    swig.invalidateCache();
  });
};

/**
 * Validate options and set defaults
 * @param {object} options
 * @return {object} options
 */
var validateOptions = function (options) {

  var defaultOptions = {
    route: 'swig-cms',
    bowerComponentsPath: '/components',
    contentDirectory: './content/'
  };

  if (!options)
    return defaultOptions;

  if (!options.route)
    options.route = defaultOptions.route;

  if (!options.bowerComponentsPath)
    options.bowerComponentsPath = defaultOptions.bowerComponentsPath;

  if (!options.contentDirectory)
    options.contentDirectory = defaultOptions.contentDirectory;

  return options;
};