#Swig Tiny-CMS

Adds basic content management capability to your existing Express.js + Swig applications.

TODO:
- Show req.isAdmin() usage with passport
- Support passing marked parameters (pass them down to editor page)
- Setup Demo Page
- Allow to pass custom CSS to use in editor: Array of CSS files ex. Bootstrap + Markdown highlighter.
- Explain default highlighter CSS used.

##Overview

- Support for Markdown content sections.
- File-based persistence.
- Works with Express 3.x and 4.x
- Works on Node.js clusters.

##Installation

```sh
npm install swig-cms --save
```

Marked is used on the client side for live preview.

```sh
bower install marked --save
```

##Configuration

Require Swig CMS
```js
var swigCms = require('swig-cms');
```

After typical Express and Swig configuration, provide a way for Swig CMS to know when user is authorized to edit content via middleware.

```js
app.use(function(req, res, next){
  swigCms.isAdmin(req.isAuthenticated());
  next();
});
````

Provide bower component root folder within swig-cms options:

```js
var options = {
  bowerComponentsPath: '/components'
};
```

Initialize Swig CMS

```js
swigCms.initialize(swig, app, options);
````

##Usage

New tag 'cms' will be registered with your Swig template engine. It requires contentId as a string:

```swig
{% cms 'contentId' %}
```

After adding this tag, editable content section will be available to your authorized users.

Content will be saved in a file with contentId.md name.

The same content identifiers can be used if you would like to reuse them.

##Test

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



