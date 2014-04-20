Swig CMS
========

Adds basic content management capability to your existing Express.js + Swig applications.

Support for Markdown content sections with file-based persistence.

Install Swig CMS:

```sh
npm install swig-cms --save
```

Marked is used on the client side for live preview.

```sh
bower install marked --save
```

#Usage:



```js
var swig = require('swig');
var swigCms = require('swig-cms');

/*
 * Normal Express and Swig configuration goes here...
 */

// Express and Swig configuration

/**
 * Provide a way for Swig CMS to know when user is authorized to edit content via middleware.
 */
app.use(function(req, res, next){
  swigCms.isAdmin(req.isAuthenticated());
  next();
});

/**
 * Initialize Swig CMS
 */
swigCms.initialize(swig, app);
```

Provide bower component root folder within swig-cms options:

```js
var options = {
  bowerComponentsPath: '/components'
};

swigCms.initialize(swig, app, options);
````
