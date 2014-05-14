#Swig Tiny-CMS

Adds basic content management capability to your existing Express.js + Swig applications.

##Overview

- Support for Markdown content sections.
- File-based persistence.
- Works with Express 3.x and 4.x
- Works on Node.js clusters.
- WYSIWYG Markdown editor with live preview.

##Usage

New tag 'cms' will be registered with your Swig template engine. ContentId string as a parameter is required:

```swig
{% cms 'contentId' %}
```

After adding this tag, editable content section will be available to your authorized users.

Content will be saved in a file with contentId.md name.

The same content identifiers can be used if you would like to reuse content sections.

##Demo

Checkout demo [swig-tiny-cms.herokuapp.com](http://swig-tiny-cms.herokuapp.com)

##Installation

```sh
npm install swig-tiny-cms --save
```

##Configuration

Require Swig CMS
```js
var swigCms = require('swig-tiny-cms');
```

After typical Express and Swig configuration, provide a way for Swig CMS to know when user is authorized to edit content via middleware.

```js
app.use(function(req, res, next){
  swigCms.isAdmin(req.isAuthenticated());
  next();
});
```

Declare Swig Tiny-CMS options:

```js
var options = {

  //content directory is required
  //should be shared directory when used in cluster
  contentDirectory: __dirname + '/content/',

  //optional array of custom CSS files to be used in editor
  css: ['//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.1.1-1/css/simplex/bootstrap.min.css'],

  //optional marked.js options
  //more info: https://github.com/chjj/marked
  markedOptions: { breaks: true }

};
```

Initialize Swig CMS

```js
swigCms.initialize(swig, app, options);
```


##Test & Run

[Mocha](http://visionmedia.github.io/mocha/) and [gulp](http://gulpjs.com/) needs to be installed globally:

```sh
$ npm install -g mocha gulp
```

Run tests:

```sh
$ gulp test
```

To run specific test user Mocha's grep:

```sh
$ gulp test -g "part of the test name"
```

Run example site:

```sh
$ gulp
```

##License

Copyright (c) 2014 - [Jakub Borys](https://github.com/kooba/) (MIT License)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.