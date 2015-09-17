var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var webdriver = require('gulp-webdriver');
var selenium = require('selenium-standalone');

var sources = ['src/**/*.js', 'test/**/*.js', 'e2e/**/*.js'];

gulp.task('clean', function (cb) {
    del(["dist/**/*"], cb)
});

gulp.task('transpile', ['clean'], function () {
    return gulp.src(sources, {nodir: true})
        .pipe(sourcemaps.init())
        .pipe(babel({stage: 0}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(function (vfile) {
            return path.join('dist', path.relative(vfile.cwd, vfile.base));
        }));
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


gulp.task('test-watch', ['test'], function () {
    gulp.watch(sources, ['test']);
});

gulp.task('e2e-watch', ['e2e'], function () {
    gulp.watch(sources, ['e2e']);
});

gulp.task('test', ['transpile'], function () {
    return gulp.src('dist/test/**/*.spec.js', {read: false})
        .pipe(mocha({reporter: 'list'}))
});


gulp.task('e2e', ['test', 'selenium'], function () {
    return gulp.src('wdio.conf.js', {read: false})
        .pipe(webdriver({
            // this is here because gulp-webdriver doesn't deal with a project with a flattened dependency (at the top level) on webdriverio
            // see https://github.com/webdriverio/gulp-webdriver/issues/20
            wdioBin: path.join(__dirname, 'node_modules', '.bin', 'wdio'),
            desiredCapabilities: {
                browserName: 'phantomjs'
            }
        }))
        .once('end', function () {
            selenium.child.kill();
        });

});
