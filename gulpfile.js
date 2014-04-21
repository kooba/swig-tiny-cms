var gulp = require('gulp');
var spawn = require('child_process').spawn;
var open = require('gulp-open');
var node;

gulp.task('server', function() {
  if (node) node.kill();
  node = spawn('node', ['./examples/express/server.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('livereload', ['server', 'wait'], function() {
  notifyLivereload('test.html');
});

gulp.task('watch', function() {
  gulp.watch(['server.js','app/**/*.js','app/**/*.html'], ['livereload']);
});

gulp.task('open', function(){
  console.log('opening');
  gulp.src("htttp://localhost:1337/")
    .pipe(open());
});

gulp.task('default', ['server', 'watch', 'open'], function() {
  startLivereload();
});

// clean up if an error goes unhandled.
process.on('exit', function() {
  if (node)
    node.kill();
});

//
var lr;
var startLivereload = function() {
  lr = require('tiny-lr')();
  lr.listen(35729);
};

var notifyLivereload = function notifyLivereload(filesChanged) {

  lr.changed({
    body: {
      files: filesChanged
    }
  });
};

gulp.task('wait', function (cb) {
  setTimeout(function () {
    cb();
  }, 500);
});