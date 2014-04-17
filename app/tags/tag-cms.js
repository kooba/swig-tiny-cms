var fs = require('fs');

exports.parse = function (str, line, parser, types, options) {
     return true;
};

//Load file from disk and set it here.
exports.compile = function (compiler, args, content, parents, options, blockName) {
    var fileId = args[0].replace(/\'/g, "").replace(/\"/g, "");
    var cont = [];
    cont.push(fs.readFileSync('./app/content/' + fileId).toString());
    return '(function () {\n' +
        '  var __o = _output;\n' +
        '  _output = "";\n' +
        compiler(cont, parents, options, blockName) + ';\n' +
        '  __o += _ext.preContent() + _ext.convertToHtml(_output) + _ext.postContent("' + fileId + '")  ;\n' +
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


exports.configure = function(swig, app) {
    //This needs to be super light since it will be called on every request.
    swig.setExtension('preContent', function () {
        if(admin)
            return preContent;
        else
            return '';
    });

    swig.setExtension('postContent', function (fieldId) {
        if(admin)
            return postContent + "<br/><a href=/express-cms/edit/" + fieldId + ">Edit</a>";
        else
            return '';
    });

    swig.setExtension('convertToHtml', function (content) {
       return require('markdown').markdown.toHTML(content);
    });

    swig.setTag('cms', this.parse, this.compile, this.ends, this.blockLevel);

    //Make beginning of route configurable
    app.post('/express-cms/save', function(req, res) {
        var content = req.body.content;
        var contentId = req.body.contentId;
        fs.writeFileSync('./app/content/' + contentId, content);
        swig.invalidateCache();
        res.redirect('/');
    });

    app.get('/express-cms/edit/:contentId', function(req, res) {
        res.render(__dirname + '/index', {
            contentId: req.params.contentId,
            content: fs.readFileSync('./app/content/' + req.params.contentId).toString()
        });
    });
}