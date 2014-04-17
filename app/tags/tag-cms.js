var fs = require('fs');
var markdown = require('markdown').markdown;

exports.parse = function (str, line, parser, types, options) {
     return true;
};

exports.compile = function (compiler, args, content, parents, options, blockName) {
    var fileId = args[0].replace(/\'/g, "").replace(/\"/g, "");
    var text = '';
    if(fs.existsSync('./app/content/' + fileId)) {
        text = fs.readFileSync('./app/content/' + fileId).toString();
        text = markdown.toHTML(text);
    }

    content.push(text);

    return '(function () {\n' +
        '  var __o = _output;\n' +
        '  _output = "";\n' +
        compiler(content, parents, options, blockName) + ';\n' +
        '  __o += _ext.preContent() _output + _ext.postContent("' + fileId + '")  ;\n' +
        '  _output = __o;\n' +
        '})();\n';
};

exports.ends = false;
exports.blockLevel = false;


var admin = false;

exports.isAdmin = function (isAdmin) {
    admin = isAdmin;
}

var preContent = '';
var postContent = '';
var bowerPath = '';
var request;

exports.configure = function(swig, app, options) {

    bowerPath = options.bowerComponents;
    //This needs to be super light since it will be called on every request.

    app.use(function(req, res, next){

        if(admin) {
            request = req;
            //TODO Render some js allow for easy editing
        }
        next();
    });

    swig.setExtension('preContent', function () {
        if(admin)
            return preContent;
        else
            return preContent;
    });

    swig.setExtension('postContent', function (fieldId) {
        if(admin)
            return postContent + "<br/><a href=/express-cms/edit/" + fieldId + "?refUrl=" + request.url +  ">Edit</a>";
        else
            return preContent;
    });

    swig.setExtension('convertToHtml', function (content) {
       return require('markdown').markdown.toHTML(content);
    });

    swig.setTag('cms', this.parse, this.compile, this.ends, this.blockLevel);

    //TODO: Make beginning of route configurable
    app.post('/express-cms/save', function(req, res) {
        var content = req.body.content;
        var contentId = req.body.contentId;
        fs.writeFileSync('./app/content/' + contentId, content);
        swig.invalidateCache();
        //TODO: Redirect back to the originating page.
        res.redirect(req.body.returnUrl);
    });

    app.get('/express-cms/edit/:contentId', function(req, res) {

        var content = '';
        if(fs.existsSync('./app/content/' + req.params.contentId)) {
            content = fs.readFileSync('./app/content/' + req.params.contentId).toString();
        }
        res.render(__dirname + '/index', {
            contentId: req.params.contentId,
            content: content,
            markdownjs: bowerPath + '/markdown/lib/markdown.js',
            returnUrl: req.query.refUrl
        });
    });
}