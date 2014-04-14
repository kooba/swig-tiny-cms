var fs = require('fs');

exports.parse = function (str, line, parser, types, options) {
  var matched = false;
  parser.on('*', function (token) {
    console.log(token);
    if (matched) {
      throw new Error('Unexpected token ' + token.match + '.');
    }
    matched = true;
    return true;
  });

  return true;
};


//Load file from disk and set it here.
exports.compile = function (compiler, args, content, parents, options, blockName) {
  var fileId = args[0].replace(/\'/g, "").replace(/\"/g, "");
  return '_output += _ext.preContent() + "' + fs.readFileSync('./app/content/' + fileId) + '" + _ext.postContent("' + fileId + '");';
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
        var edit = "I will be editing content here: </br>"
            + "<form action='/express-cms/save/' method='post'>"
            + "<input type='hidden' name='contentId' value='" + req.params.contentId + "' />"
            + "<textarea rows='4' cols='50' name='content'>"
            + fs.readFileSync('./app/content/' + req.params.contentId)
            + "</textarea>"
            + "<button type='submit'>Save</button>"
            + "</form>";
        res.send(edit);
    });
}