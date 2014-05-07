var fs = require('fs');
var path = require('path');
var marked = require('marked'); //TODO: Allow to pass marked formatting options here and on the client.
var watch = require('node-watch');
var mkdirp = require('mkdirp');
var inject = require('connect-inject');

var admin = false;
var preContent = '';
var postContent = '';
var request;
var swigCmsOptions;

/**
 * Swig compilation
 */

//TODO Check if contentId is provided here!!!
exports.parse = function (str, line, parser) {
  parser.on('end', function () {
    if (!this.out[0] || this.out[0] === '')
      throw new TypeError('Swig Tiny-CMS Error: cms tag requires contentId argument e.g. {% cms \'contentId\' %}');
  });
  return true;
};

exports.ends = false;
exports.blockLevel = false;

/**
 * Custom Swig compilation:
 * Grab existing content file if exists.
 * Add pre and post content HTML based on permissions for editing.
 * More info about Swig compilation here: http://paularmstrong.github.io/swig/docs/extending/#compile
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {

  var contentId = args[0];

  if (contentId)
    contentId = contentId.replace(/\'/g, "").replace(/\"/g, "");

  var text = '';

  var filePath = path.join(swigCmsOptions.contentDirectory, contentId + '.md');

  if (fs.existsSync(filePath)) {
    text = fs.readFileSync(filePath).toString();
    text = text.replace(/\r/g, "");
  }

  content.push(text);

  return '(function () {\n' +
    '  var __o = _output;\n' +
    '  _output = "";\n' +
    compiler(content, parents, options, blockName) + ';\n' +
    '  __o += _ext.preContent("' + contentId + '") + _ext.convertToHtml(_output) + _ext.postContent("' + contentId + '")  ;\n' +
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
    }
    next();
  });

  //Inject a bit of CSS animation used for 'Edit' button.
  app.use(inject({
    snippet: "<style> .swig-cms-div>.swig-cms-edit{visibility:hidden;opacity:0;transition:visibility 0s linear .3s,opacity .3s linear}.swig-cms-div:hover>.swig-cms-edit{visibility:visible;opacity:1;transition-delay:0s}.swig-cms-edit{padding:2px;float: right;}.swig-cms-edit a{color:cornflowerblue}.swig-cms-edit-inner{padding:10px;text-align:center;background-color:#ffffff;width:50px;float:right;font-family:arial,sans-serif;font-size:10pt;border:1px inset cornflowerblue;border-radius:4px}</style>"
  }));

  swig.setExtension('preContent', function (fileId) {

    if (admin) {
      return "<div class='swig-cms-div'><div class='swig-cms-edit'>"
        + "<div class='swig-cms-edit-inner'><a class='button grow' href='/"
        + swigCmsOptions.route + "/edit/"
        + fileId + "?returnUrl=" + request.url + "'>Edit</a></div></div>";
    }
    else {
      return preContent;
    }
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

    if (!admin)
      return res.redirect(req.query.returnUrl);

    var content = '';
    var filePath = path.join(swigCmsOptions.contentDirectory, req.params.contentId + '.md');


    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath).toString();
    }

    res.render(path.join(__dirname, '../public/editor.md.html'), {
      contentId: req.params.contentId,
      content: content,
      returnUrl: req.query.returnUrl,
      swigCmsRoute: swigCmsOptions.route
    });

  });

  app.post('/' + swigCmsOptions.route + '/save', function (req, res) {

    var returnUrl = req.body.returnUrl ? req.body.returnUrl : '/';

    if (!admin)
      return res.redirect(returnUrl);

    if (!req.body.content || !req.body.contentId || !req.body.returnUrl)
      return res.send(500, 'Swig CMS Error: Insufficient parameters when saving content.');

    var content = req.body.content;
    var contentId = req.body.contentId;
    var filePath = path.join(swigCmsOptions.contentDirectory, contentId + '.md');

    if (!fs.existsSync(swigCmsOptions.contentDirectory)) {
      mkdirp.sync(swigCmsOptions.contentDirectory);
    }

    fs.writeFileSync(filePath, content);

    swig.invalidateCache();

    return res.redirect(returnUrl);

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

  if (!options)
    throw new TypeError('Options for Swig Tiny-CMS are not defined.');

  if (!options.contentDirectory)
    throw new TypeError('Content directory for Swig Tiny-CMS is not defined.');

  if (!options.route)
    options.route = 'swig-cms';

  return options;
};