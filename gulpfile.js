var gulp = require('gulp');
var spawn = require('child_process').spawn;
var open = require('gulp-open');
var liveReload = require('tiny-lr')();
var mocha = require('gulp-mocha');
var node;
var args = require('minimist')(process.argv);


var server = function (cb) {
  if (node) node.kill();
  node = spawn('node', ['./examples/express/server.js'])
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });

  node.stdout.on('data', function (data) {
    console.log(data.toString());
    if (cb) {
      if (data.toString().indexOf('Application Started') > -1)
        cb();
    }
  });

  node.stderr.on('data', function (data) {
    console.log(data.toString());
  });
};

// clean up if an error goes unhandled.
process.on('exit', function () {
  if (node)
    node.kill();
});

gulp.task('watch', function () {
  gulp.watch(['examples/**/*.js', 'examples/**/*.html', 'lib/**/*'], { interval: 500 }, function (event) {
    console.log('file ' + event.path + ' changed. Reloading...');
    server(function () {
      notifyLiveReload(event.path);
    });
  });
});

gulp.task('open', function () {
  gulp.src("http://localhost:1337/")
    .pipe(open());
});

gulp.task('test', function () {

  var files = args.file ? 'tests/' + file : 'tests/test*';

  gulp.src(files)
    .pipe(mocha({
      reporter: 'spec',
      grep: args.grep
    }));
});

gulp.task('default', ['watch', 'open'], function () {
  server(function () {
    startLiveReload();
  });
});

var startLiveReload = function () {
  liveReload.listen(35729);
};

var notifyLiveReload = function notifyLiveReload(filesChanged) {

  liveReload.changed({
    body: {
      files: filesChanged
    }
  });
};


