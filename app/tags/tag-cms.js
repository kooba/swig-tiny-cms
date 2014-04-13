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
  console.log('test');
  var fileId = args[0].replace(/\'/g, "").replace(/\"/g, "");
  return '_output += _ext.admin() + "' + fs.readFileSync('./app/content/' + fileId) + '";';
};

exports.ends = false;
exports.blockLevel = false;


//Express Middleware
var isAdmin = false;

exports.authenicate = function (req, res, next) {
  sessionId = req.session.id;
  if(req.session.isAuthenticated) {
    req.isAuthenticated = true;
    isAdmin = true;
  }
  else {
    req.isAuthenticated = false;
    isAdmin = false;
  }

  next();
}