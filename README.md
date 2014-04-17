swig-cms
========

Add basic content management capability to your existing Express.js + SWIG applications.

Support for Markdown or HTML content sections with Mongodb or file-based persistance.

Minimum configuration required:


```
var cmstag = require('./app/tags/tag-cms');

app.use(function(req, res, next){
    if(req)
        cmstag.isAdmin(req.session && req.session.isAuthenticated);
    next();
});

cmstag.configure(swig, app);
```

Live Preview
========

To enable live preview during editing install markdown with bower
```
bower install markdown --save
```

Provide bower component root folder within swig-cms options:

var options = { bowerComponents: "public/components" }

cmstag.configure(swig, app, options);