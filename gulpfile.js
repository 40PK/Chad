/* eslint-disable import/no-extraneous-dependencies,no-console */
const del = require('del');
const exec = require('child_process').exec;
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
const uglifyjs = require('uglify-js-harmony');
const packager = require('electron-packager');

const pkg = require('./package.json');
/* eslint-enable import/no-extraneous-dependencies */

gulp.task('clean', () => del.sync(['package/**', '!package', '!package/node_modules/**']));

gulp.task('build:jsx-release', ['clean'], () => gulp.src('src/**/*.jsx')
  .pipe(changed('package'))
  .pipe(react({ harmony: false, es6module: true }))
  .pipe(minifier({ mangle: true }, uglifyjs))
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
  .pipe(minifier({ mangle: true }, uglifyjs))
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

gulp.task('install', () => exec('cd package && npm i --production'));

gulp.task('run', ['build-debug'], () => {
  exec('npm start');
  watch(['src/**', '!src/main.js'], () => {
    gulp.start('build-debug');
  });
});

gulp.task('build-release', cb => {
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

gulp.task('build-debug', cb => {
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


const defaultOptions = {
  version: '1.3.4',
  dir: './package',
  'app-version': pkg.version,
  out: 'builds',
  overwrite: true,
  prube: true,
};

const cb = (err, paths) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  if (paths) console.log(paths.join('\n'));
};

gulp.task('package:mac', () => {
  const options = Object.assign(defaultOptions, {
    platform: 'darwin',
    arch: 'x64',
    'app-bundle-id': 'com.perkovec.chad',
    icon: './src/icons/chad.icns',
  });
  packager(options, (err, paths) => {
    cb(err, paths);
    exec('cd builds/Chad-darwin-x64 && zip -ryXq9 ../Chad-OSX.zip Chad.app');
  });
});

gulp.task('package:linux', () => {
  const options = Object.assign(defaultOptions, {
    platform: 'linux',
    arch: 'all',
    'app-bundle-id': 'com.perkovec.chad',
    icon: './src/icons/chad.png',
  });
  packager(options, (err, paths) => {
    cb(err, paths);
    exec('cd builds/Chad-linux-x64 && zip -ryXq9 ../Chad-linux-x64.zip *');
    exec('cd builds/Chad-linux-ia32 && zip -ryXq9 ../Chad-linux-x32.zip *');
  });
});

gulp.task('package:windows', () => {
  const options = Object.assign(defaultOptions, {
    platform: 'win32',
    arch: 'all',
    'version-string': {
      productName: pkg.productName,
    },
    icon: './src/icons/chad.ico',
  });
  packager(options, (err, paths) => {
    cb(err, paths);
    exec('cd builds/Chad-win32-x64 && zip -ryXq9 ../Chad-win-x64.zip *');
    exec('cd builds/Chad-win32-ia32 && zip -ryXq9 ../Chad-win-x32.zip *');
  });
});
