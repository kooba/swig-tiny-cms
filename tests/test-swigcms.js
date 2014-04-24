var swigCms = require('../');
var swig = require('swig');
var express = require('express');
var app = express();
var should = require('should');
var fs = require('fs');
var path = require('path');
var request = require('supertest');

//configure view engine
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


describe('When rendering cms tag for non Admin users', function () {
  describe('content will be', function () {
    admin = false;
    it('blank if new', function (done) {
      swig.render("{% cms 'test' %}").should.equal('');
      done();
    });

    it('read from the disk', function (done) {
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

describe('When editing content by', function () {
   describe('un-authorized user', function() {
    it('will redirect user back', function (done) {
      admin = false;
      request(app)
        .get('/' + options.route + '/edit/' + contentName)
        .expect(302)
        .end(function (err, res) {
          if (err)
            done(err);
          else
            done();
        });
    });
  });

  describe('by authorized user', function() {
    it('will render editor', function(done) {
      admin = true;
      request(app)
        .get('/' + options.route + '/edit/' + contentName)
        .expect(200)
        .end(function (err, res) {
          if(err)
            done(err);
          else
            done();
        });
    });
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

