var swigCms = require('../');
var swig = require('swig');
var express = require('express');
var app = express();
var should = require('should');
var fs = require('fs');
var path = require('path');
var request = require('supertest');

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

var contentName = 'test';
var admin;

var options = {
  bowerComponentsPath: '/components',
  contentDirectory: './content/',
  root: __dirname,
  route: 'swig-cms'
};

app.use(function (req, res, next) {
  swigCms.isAdmin(admin);
  next();
});

swigCms.initialize(swig, app, options);

describe('When adding Swig CMS tag to a page', function() {
  describe('and content id is not set', function() {

    before(function (done) {
      createViewFile('index.html', "{% cms %}");
      app.get('/', function (req, res) {
        res.render('index', {});
      });
      done();
    });

    after(function (done) {
      removeViewFile('index.html');
      done();
    });

    it('error will be thrown', function(done) {
        request(app)
          .get('/')
          .expect(500)
          .end(function (err, res) {
            if(err) {
              done(err);
            }
            else {
              res.text.should.containEql("Swig CMS tag requires ContentId");
              done();
            }
          });
    });
  });
});

describe('When rendering cms tag for non Admin users', function () {
  describe('content will be', function () {
    admin = false;
    it('blank if new', function (done) {
      swig.render("{% cms 'test' %}").should.equal('');
      done();
    });

    it('read from the disk if exists', function (done) {
      createContentFile('test.md', '#test');
      swig.render("{% cms 'test' %}").should.equal("<h1 id=\"test\">test</h1>\n");
      removeContentFile('test.md');
      done();
    });

  });
});

describe('When rendering cms tag for Admin user', function () {
  describe('content will be', function () {
    before(function (done) {
      admin = true;
      app.get('/', function (req, res) {
        res.render('index', {});
      });
      createViewFile('index.html', "{% cms '" + contentName + "' %}");
      done();
    });

    beforeEach(function (done) {
      swig.invalidateCache();
      done();
    });

    after(function (done) {
      removeViewFile('index.html');
      done();
    });

    it('editable and blank if new', function (done) {
      request(app)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          res.text.should.equal("<a href='/swig-cms/edit/" + contentName + "?refUrl=/'>Edit</a><div></div>")
          done();
        });
    });

    it('editable with content read from the disk', function (done) {
      createContentFile(contentName + '.md', '#' + contentName);

      request(app)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          res.text.should.equal("<a href='/swig-cms/edit/" + contentName + "?refUrl=/'>Edit</a><div><h1 id=\"" + contentName + "\">" + contentName + "</h1>\n</div>");
          removeContentFile(contentName + '.md');
          done();
        });
    });
  });
});

describe('When editing content', function () {
   describe('by un-authorized users', function() {
    it('they will be redirected back', function (done) {
      admin = false;
      request(app)
        .get('/' + options.route + '/edit/' + contentName)
        .expect(302)
        .end(function (err) {
          if (err)
            done(err);
          else
            done();
        });
    });
  });

  describe('by authorized users', function() {
    before(function(done) {
      createContentFile(contentName + '.md', '#test');
      done();
    });

    after(function(done) {
      removeContentFile(contentName + '.md');
      done();
    });
    it('editor will rendered', function(done) {
      admin = true;
      request(app)
        .get('/' + options.route + '/edit/' + contentName)
        .expect(200)
        .end(function (err, res) {
          if(err) {
            done(err);
          }
          else {
            res.text.should.containEql('#test');
            done();
          }
        });
    });
  });
});

describe('When saving content', function () {
  describe('by authorized users', function() {
    it('new content will be saved', function(done) {
      done();
    });

    it('they will be redirected back to starting page', function(done) {
      done();
    });

    it('new content will be displayed', function(done) {
      done();
    });
  });

  describe('by un-authorized users', function() {
    it('content won\'t be saved', function(done) {
      done();
    });

    it('they will be redirected back to starting page', function(done) {
      done();
    });

    it('old content will be displayed', function(done) {
      done();
    });
  });
});

describe('When content is changed by other process', function() {
  it('current process will reload it from the disk', function(done) {
    done();
  });
});

describe('Default options will be used if not provided', function() {
  it('for root', function(done) {
    done();
  });
  //etc...
});

describe('Options can be customized:', function() {
  it('Controller slug can be changed', function(done) {
    done();
  });

  it('Content directory can be changed', function(done) {
    done();
  });

  it('Marked options can be changed', function(done) {
    done();
  });
});

var createContentFile = function (name, content) {
  fs.mkdirSync(path.join(options.root, options.contentDirectory));
  fs.writeFileSync(path.join(options.root, options.contentDirectory, name), content);
};

var removeContentFile = function (name) {
  fs.unlinkSync(path.join(options.root, options.contentDirectory, name));
  fs.rmdirSync(path.join(options.root, options.contentDirectory));
};

var createViewFile = function (name, content) {
  fs.mkdirSync(path.join(options.root, 'views'));
  fs.writeFileSync(path.join(options.root, 'views', name), content);
};

var removeViewFile = function (name) {
  fs.unlinkSync(path.join(options.root, 'views', name));
  fs.rmdirSync(path.join(options.root, 'views'));
};