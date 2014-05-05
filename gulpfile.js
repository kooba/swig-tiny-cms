var gulp = require('gulp');
var spawn = require('child_process').spawn;
var open = require('gulp-open');
var liveReload = require('tiny-lr')();
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var node;
var args = require('minimist')(process.argv);

var server = function (cb) {
  if (node) node.kill();
  node = spawn('node', [__dirname + '/examples/express/server.js'])
  node.on('close', function (code) {
    if (code === 8) {
      console.log('Error detected, waiting for changes...');
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
  gulp.watch([__dirname + '/examples/**/*.js', __dirname + '/examples/**/*.html', __dirname + '/lib/**/*'], { interval: 500 }, function (event) {
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

  var files = args.f ? 'tests/' + args.f : 'tests/test*';

  gulp.src(['lib/**/*.js', 'index.js'])
    .pipe(istanbul()) // Covering files
    .on('end', function () {
      gulp.src(files)
        .pipe(mocha({
          reporter: 'spec',
          grep: args.g
        }))
        .pipe(istanbul.writeReports());
    });
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


