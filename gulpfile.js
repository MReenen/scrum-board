/**
 * scrum-board
 *
 * @category   scrum-board
 * @author     Vaibhav Mehta <vaibhav@decodingweb.com>
 * @copyright  Copyright (c) 2016 Vaibhav Mehta <https://github.com/i-break-codes>
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @version    1.0 Beta
 */

const Gulp = require('gulp');
const BrowserSync  = require('browser-sync');
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS     = require('gulp-clean-css');
const uglify       = require('gulp-uglify');
const renameFiles  = require('gulp-rename');

const Url = 'http://localhost:8888/scrum/';
const Browser = 'google chrome';

function browserSync(cb){
  BrowserSync.init({
    server: {
      // baseDir: "app",
      proxy: Url,
      // files: ['app/views/**/*.*', 'public/**/*.css', 'public/**/*.js'],
      browser: Browser,
      port: 3005,
      // open: false
    }
  }, function (err, bs){
    cb();
  });
};

function bsReload(cb){
  BrowserSync.reload();
  cb();
};

function css(){
  return Gulp.src('src/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 3 version'))
    .pipe(Gulp.dest('app/assets/stylesheets'))
}
function cssMinify(){
  return Gulp.src('app/assets/stylesheets/**/*.css')
    .pipe(cleanCSS({debug: true}, function(details) {
      console.log('Original Size : ' + details.name + ': ' + details.stats.originalSize + ' bytes');
      console.log('Minified Size : ' + details.name + ': ' + details.stats.minifiedSize + ' bytes');
    }))
    .pipe(renameFiles({ suffix: '.min' }))
    .pipe(Gulp.dest('app/assets/stylesheets'))
    // .pipe(browserSync.reload({ // ??
    //   stream:true
    // }));
};

function jsMinify(){
  return Gulp.src('src/javascript/**/*.js')
    .pipe(uglify())
    .pipe(renameFiles({ suffix: '.min' }))
    .pipe(Gulp.dest('app/assets/scripts'))
    // .pipe(browserSync.reload({ // ??
    //   stream: true, 
    //   once: true
    // }));
};

const cssTask = Gulp.series(css, cssMinify);
const jsTask = jsMinify
const buildTask = Gulp.parallel(cssTask, jsTask);

exports.server = browserSync;
exports.cssBuild = cssTask;
exports.jsBuild = jsTask;
exports.build = buildTask;
exports.default = Gulp.series(buildTask, browserSync);