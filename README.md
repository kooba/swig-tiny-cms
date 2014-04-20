Swig CMS
========

Adds basic content management capability to your existing Express.js + Swig applications.

- Support for Markdown content sections.
- File-based persistence.
- Works on node clusters.

Install Swig CMS:

```sh
npm install swig-cms --save
```

Marked is used on the client side for live preview.

```sh
bower install marked --save
```

#Usage:


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

