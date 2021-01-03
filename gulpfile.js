/**
 * scrum-board
 *
 * @category   scrum-board
 * @author     Vaibhav Mehta <vaibhav@decodingweb.com>, Mats van Reenen <mail@matsvanreenen.nl>
 * @copyright  Copyright (c) 2016,2020 Vaibhav Mehta <https://github.com/i-break-codes>
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @version    1.0 Beta
 */

// const BrowserSync  = require('browser-sync');
const fs   = require('fs');
const http = require('http');
const Gulp = require('gulp');
Gulp.clean = require('gulp-clean');
Gulp.sass         = require('gulp-sass');
Gulp.autoprefixer = require('gulp-autoprefixer');
Gulp.cleanCSS     = require('gulp-clean-css');
Gulp.uglify       = require('gulp-uglify');
Gulp.rename       = require('gulp-rename');

const PORT = 3000;

function httpd(){
  function servePage(req, res, url){
    if(url[url.length - 1] == '/'){
      return servePage(req, res, url + 'index.html')
    }
    urlSplit = url.split('.');
    if(urlSplit[urlSplit.length-1].length > 4){
      return servePage(req, res, url + '/index.html')
    }
    fs.readFile(__dirname + '/app' + url, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
  http.createServer(function (req, res) {
    servePage(req, res, req.url)
  }).listen(PORT);
}

function css(){
  return Gulp.src('src/stylesheets/**/*.scss')
    .pipe(Gulp.sass().on('error', Gulp.sass.logError))
    .pipe(Gulp.autoprefixer('last 3 version'))
    .pipe(Gulp.dest('app/assets/stylesheets'))
}
function cssMinify(){
  return Gulp.src(['app/assets/stylesheets/**/*.css', '!app/assets/stylesheets/**/*.min.css'])
    .pipe(Gulp.cleanCSS({debug: true}, function(details) {
      console.log('Original Size : ' + details.name + ': ' + details.stats.originalSize + ' bytes');
      console.log('Minified Size : ' + details.name + ': ' + details.stats.minifiedSize + ' bytes');
    }))
    .pipe(Gulp.rename({ suffix: '.min' }))
    .pipe(Gulp.dest('app/assets/stylesheets'))
};

function jsMinify(){
  return Gulp.src('src/scripts/**/*.js')
    .pipe(Gulp.uglify())
    .pipe(Gulp.rename({ suffix: '.min' }))
    .pipe(Gulp.dest('app/assets/scripts'))
};

function clean(mode = 'all'){
  const opts = {read: false, allowEmpty: true}
  switch(mode){
    case 'cssTmp':
      return function cleanTmpCSS(){
        return Gulp.src(['app/assets/stylesheets/**/*.css', '!app/assets/stylesheets/**/*.min.css'], opts)
          .pipe(Gulp.clean())
      }
    case 'tmp':
      return clean('cssTmp');

    case 'css':
      return function cleanCSS(){
        return Gulp.src(['app/assets/stylesheets'], opts)
          .pipe(Gulp.clean())
      }
    case 'js':
      return function cleanJS(){
        return Gulp.src(['app/assets/scripts'], opts)
          .pipe(Gulp.clean())
      }
    case 'all':
      return Gulp.parallel(clean('css'), clean('js'));
    default:
      console.log(`WARNING: Clean: invalid mode '${mode}'`)
      console.log(`dong 'tmp' instad of '${mode}'`)
      return clean('tmp')
  }
}

const cssTask = Gulp.series(css, cssMinify, clean('cssTmp'));
const jsTask = jsMinify;
const buildTask = Gulp.parallel(cssTask, jsTask);

exports.clean = clean('all');
exports.server = httpd;
exports.cssBuild = cssTask;
exports.jsBuild = jsTask;
exports.build = Gulp.series(clean('all'), buildTask);
exports.default = Gulp.series(buildTask, httpd);