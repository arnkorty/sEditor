// Include gulp
var gulp = require('gulp');

// Include our plugins
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var html5lint = require('gulp-html5-lint');
var eslint = require('gulp-eslint');

var checkPages = require('check-pages');

// Default task
gulp.task('default', [ 'js', 'html', 'links', 'minify' ]);

// Lint our JavaScript files
gulp.task('js', function () {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('html', function () {
  return gulp.src([ '*.html', 'examples/*.html' ])
    .pipe(html5lint());
});

// Check for broken and invalid links in the web pages
gulp.task('links', function (callback) {
  var options = {
    pageUrls: [
      'index.html',
      'examples/basic.html',
      'examples/clear-formatting.html',
      'examples/events.html',
      'examples/form-post.html',
      'examples/formatblock-example.html',
      'examples/html-editor.html',
      'examples/multiple-editors.html',
      'examples/simple-toolbar.html'
    ],
    checkLinks: true,
    summary: true
  };

  checkPages(console, options, callback);
});

// Minify our JS
gulp.task('minify', function () {
  return gulp.src('src/*.js')
    .pipe(uglify())
    .pipe(rename('seditor.min.js'))
    .pipe(gulp.dest('js'));
});

// Watch files for changes
gulp.task('watch', function () {
  gulp.watch([ 'src/*.js', 'index.html', 'examples/*.html' ],
    [ 'js', 'html', 'links', 'minify' ]);
});
