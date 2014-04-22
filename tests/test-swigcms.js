var swigCms = require('../');
var swig = require('swig');
var express = require('express');
var app = express();
var should = require('should');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');


var options = {
  bowerComponentsPath: '/components',
  contentDirectory: './content/',
  root: __dirname
};

describe('When rendering cms tag', function () {
  describe('content will be', function () {

    it('blank if new', function (done) {
      swigCms.isAdmin(false);
      swigCms.initialize(swig, app, options);
      swig.render("{% cms 'test' %}").should.equal('');
      done();
    });

    it('read from the disk', function (done) {
      swigCms.isAdmin(false);
      swigCms.initialize(swig, app, options);
      createFile('test.md', '#test');
      swig.render("{% cms 'test' %}").should.equal("<h1 id=\"test\">test</h1>\n");
      removeFile('test.md');
      done();
    });

  });
});

var createFile = function (name, content) {
  fs.mkdirSync(path.join(options.root, options.contentDirectory));
  fs.writeFileSync(path.join(options.root, options.contentDirectory, name), content);
}

var removeFile = function (name) {
  fs.unlinkSync(path.join(options.root, options.contentDirectory, name));
  fs.rmdirSync(path.join(options.root, options.contentDirectory));
}
