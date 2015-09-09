var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var webdriver = require('gulp-webdriver');
var selenium = require('selenium-standalone');

gulp.task('clean', function (cb) {
    del(["dist/**/*"], cb)
});

gulp.task('transpile', ['clean'], function () {
    return gulp.src(['src/**/*.js', 'test/**/*.js'], {nodir: true})
        .pipe(sourcemaps.init())
        .pipe(babel({stage: 0}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(function (vfile) {
            return path.join('dist', path.relative(vfile.cwd, vfile.base));
        }));
});

gulp.task('serve:test', ['transpile'], function (done) {
    browserSync({
        logLevel: 'silent',
        notify: false,
        open: false,
        port: 9000,
        proxy: 'localhost:3000',
        ui: false
    }, done);
});

gulp.task('selenium', function (done) {
  selenium.install({
    logger: function (message) { }
  }, function (err) {
    if (err) return done(err);

    selenium.start(function (err, child) {
      if (err) return done(err);
      selenium.child = child;
      done();
    });
  });
});


gulp.task('watch', function () {
    gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('test', ['transpile', 'serve:test', 'selenium'], function () {
    return gulp.src('wdio.conf.js', {read: false})
        .pipe(webdriver({
            desiredCapabilities: {
                browserName: 'phantomjs'
            }
        }))
        .once('end', function () {
            browserSync.exit();
            selenium.child.kill();
        });

});
