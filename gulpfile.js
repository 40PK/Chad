const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const uglifyjs = require('uglify-js-harmony');
const minifier = require('gulp-uglify/minifier');
const react = require('gulp-react');
const sass = require('gulp-sass');
const useref = require('gulp-useref');
const runSequence = require('run-sequence');
const watch = require('gulp-watch');
const spawnSync = require('spawn-sync');
const extReplace = require('gulp-ext-replace');

gulp.task('clean', () => del.sync(['package/**', '!package', '!package/node_modules/**']));

gulp.task('build:jsx-release', ['clean'], () => gulp.src('src/**/*.jsx')
  .pipe(react({ harmony: false, es6module: true }))
  .pipe(minifier({}, uglifyjs))
  .pipe(extReplace('.js'))
  .pipe(gulp.dest('package')));

gulp.task('build:jsx-debug', ['clean'], () => gulp.src('src/**/*.jsx')
  .pipe(react({ harmony: false, es6module: true }))
  .pipe(minifier({
    mangle: false,
    compress: false,
    output: {
      beautify: true,
      indent_level: 2,
    },
  }, uglifyjs))
  .pipe(extReplace('.js'))
  .pipe(gulp.dest('package')));

gulp.task('build:js-release', ['build:jsx-release'], () => gulp.src('src/**/*.js')
  .pipe(minifier({}, uglifyjs))
  .pipe(gulp.dest('package')));

gulp.task('build:js-debug', ['build:jsx-debug'], () => gulp.src('src/**/*.js')
  .pipe(minifier({
    mangle: false,
    compress: false,
    output: {
      beautify: true,
      indent_level: 2,
    },
  }, uglifyjs))
  .pipe(gulp.dest('package')));

gulp.task('build:html-release', () => gulp.src('src/**/*.html')
  .pipe(useref())
  .pipe(gulp.dest('package')));

gulp.task('build:html-debug', () => gulp.src('src/**/*.html')
  .pipe(gulp.dest('package')));

gulp.task('build:scss', () => gulp.src('src/**/*.{scss,sass}')
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(cleanCSS({ keepSpecialComments: 0 }))
  .pipe(gulp.dest('package')));

gulp.task('build:css', () => gulp.src('src/**/*.css')
  .pipe(autoprefixer())
  .pipe(cleanCSS({ keepSpecialComments: 0 }))
  .pipe(gulp.dest('package')));

gulp.task('media', () => gulp.src('src/**/*.{eot,svg,ttf,woff,png,jpg,jpeg,json}')
  .pipe(gulp.dest('package')));

gulp.task('package_copy', () => gulp.src('package.json')
  .pipe(gulp.dest('package')));

gulp.task('install', () => spawnSync('npm', ['i', '--production'], { cwd: './package' }));

gulp.task('run', () => {
  watch(['src/**', '!src/main.js'], { ignoreInitial: true }, () => {
    gulp.start('build-debug');
  });
});

gulp.task('build-release', (cb) => {
  runSequence(
    'clean',
    'build:js-release',
    'build:html-release',
    'build:scss',
    'build:css',
    'media',
    'package_copy',
    'install',
  cb);
});

gulp.task('build-debug', (cb) => {
  runSequence(
    'clean',
    'build:js-debug',
    'build:html-debug',
    'build:scss',
    'build:css',
    'media',
    'package_copy',
    'install',
  cb);
});
