Swig CMS
========

Add basic content management capability to your existing Express.js + SWIG applications.

Support for Markdown or HTML content sections with Mongodb or file-based persistance.

Minimum configuration required:

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
var swigCms = require('swig-cms');

app.use(function(req, res, next){
        swigCms.isAdmin(req.isAuthenticated());
    next();
});

swigCms.configure(swig, app);
```

#Live Preview

To enable live preview during editing install markdown with bower
```
bower install markdown --save
```

Provide bower component root folder within swig-cms options:

```js
var options = { bowerComponents: "public/components" }
cmstag.configure(swig, app, options);
````
