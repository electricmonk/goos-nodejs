var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var webdriver = require('gulp-webdriver');
var selenium = require('selenium-standalone');

var paths = {
    scripts: ['src/**/*.js', 'test/**/*.js'],
    views: 'src/**/*.handlebars'
}

gulp.task('clean', function (cb) {
    del(["dist/**/*"], cb)
});

// Copy all other files to dist directly
gulp.task('copy', ['clean'], function() {
    // Copy views
    gulp.src(paths.views)
        .pipe(gulp.dest(function (vfile) {
            return path.join('dist', path.relative(vfile.cwd, vfile.base));
        }));
});

gulp.task('transpile', ['clean'], function () {
    return gulp.src(paths.scripts, {nodir: true})
        .pipe(sourcemaps.init())
        .pipe(babel({stage: 0}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(function (vfile) {
            return path.join('dist', path.relative(vfile.cwd, vfile.base));
        }));
});

gulp.task('build', ['copy', 'transpile']);

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
    gulp.watch(paths.scripts, ['test']);
});

gulp.task('e2e-watch', ['e2e'], function () {
    gulp.watch(paths.scripts, ['e2e']);
});

gulp.task('test', ['build'], function () {
    return gulp.src(['dist/test/unit/**/*.spec.js', 'dist/test/integration/**/*.spec.js'], {read: false})
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
