const del = require('del');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const changed = require('gulp-changed');
const cleanCSS = require('gulp-clean-css');
const extReplace = require('gulp-ext-replace');
const react = require('gulp-react');
const sass = require('gulp-sass');
const minifier = require('gulp-uglify/minifier');
const useref = require('gulp-useref');
const watch = require('gulp-watch');
const runSequence = require('run-sequence');
const spawnSync = require('spawn-sync');
const uglifyjs = require('uglify-js-harmony');

gulp.task('clean', () => del.sync(['package/**', '!package', '!package/node_modules/**']));

gulp.task('build:jsx-release', ['clean'], () => gulp.src('src/**/*.jsx')
  .pipe(changed('package'))
  .pipe(react({ harmony: false, es6module: true }))
  .pipe(minifier({}, uglifyjs))
  .pipe(extReplace('.js'))
  .pipe(gulp.dest('package')));

gulp.task('build:jsx-debug', ['clean'], () => gulp.src('src/**/*.jsx')
  .pipe(changed('package'))
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
  .pipe(changed('package'))
  .pipe(minifier({}, uglifyjs))
  .pipe(gulp.dest('package')));

gulp.task('build:js-debug', ['build:jsx-debug'], () => gulp.src('src/**/*.js')
  .pipe(changed('package'))
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
  .pipe(changed('package'))
  .pipe(useref())
  .pipe(gulp.dest('package')));

gulp.task('build:html-debug', () => gulp.src('src/**/*.html')
  .pipe(changed('package'))
  .pipe(gulp.dest('package')));

gulp.task('build:scss', () => gulp.src('src/**/*.{scss,sass}')
  .pipe(changed('package'))
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(cleanCSS({ keepSpecialComments: 0 }))
  .pipe(gulp.dest('package')));

gulp.task('build:css', () => gulp.src('src/**/*.css')
  .pipe(changed('package'))
  .pipe(autoprefixer())
  .pipe(cleanCSS({ keepSpecialComments: 0 }))
  .pipe(gulp.dest('package')));

gulp.task('media', () => gulp.src('src/**/*.{eot,svg,ttf,woff,png,jpg,jpeg,json}')
  .pipe(changed('package'))
  .pipe(gulp.dest('package')));

gulp.task('package_copy', () => gulp.src('package.json')
  .pipe(changed('package'))
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