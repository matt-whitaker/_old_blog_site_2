"use strict";

if (['development', 'production'].every((e) => process.env.NODE_ENV === e)) {
  throw(new Error("NODE_ENV can only be development or production!"));
}

const del = require('del');

const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const watch = require('gulp-watch');
const Hexo = require('hexo');

require('dotenv').config();

const download = require('./utils/download.js');

const SRC_ROOT = 'src/';
const EJS_GLOB = `${SRC_ROOT}**/*.ejs`;
const LESS_RESET_GLOB = `${SRC_ROOT}_3rd-party/reset.less`;
const LESS_GLOB = `${SRC_ROOT}**/*.less`;
const LESS_EXCL_GLOB = `!${SRC_ROOT}_3rd-party/font-awesome/**/*.less`;
const IMAGE_GLOB = 'images/**/*';
const YML_GLOB = `${SRC_ROOT}**/*.yml`;

const DEST_ROOT = 'themes/dt/';
const DEST_LAYOUT_PATH = `${DEST_ROOT}layout/`;
const DEST_YML_PATH = `${DEST_ROOT}`;
const DEST_CSS_PATH = `${DEST_ROOT}source/css/`;
const DEST_CSS_FILENAME = 'app.css';
const DEST_IMAGE_PATH = `${DEST_ROOT}source/images/`;

const PUBLIC_ROOT = 'public/';

const FONT_EXTENSIONS = ['otf', 'eot', 'svg', 'ttf', 'woff', 'woff2'];

const hexo = new Hexo(process.cwd(), {});

gulp.task('clean:assets', () => {
  return del([ './source', './images' ]);
});

if (process.env.NODE_ENV === 'production') {
  gulp.task('retrieve:assets', ['clean:assets'], () => {
    return download();
  });
} else {
  // copy the assets from the depth of the machine... ie my dropbox folder
  gulp.task('retrieve:assets', ['clean:assets'], () => {
    return Promise.all([
      new Promise((res, rej) => {
        gulp.src(['**/*', '!_config.yml'], { cwd: process.env.DROPBOX_PATH })
          .pipe(gulp.dest('./'))
          .on('end', res)
          .on('error', console.error);
      }),
      new Promise((res, rej) => {
        gulp.src('./source', { cwd: process.env.DROPBOX_PATH })
          .pipe(gulp.dest('./'))
          .on('end', res)
          .on('error', console.error);
      })
    ])
  });
}

gulp.task('copy:ejs', () => {
  return gulp.src(EJS_GLOB)
    .pipe(gulp.dest(DEST_LAYOUT_PATH));
});

gulp.task('copy:yml', () => {
  return gulp.src(YML_GLOB)
    .pipe(gulp.dest(DEST_YML_PATH));
});

gulp.task('copy:images', [], () => {
  return gulp.src(IMAGE_GLOB)
    .pipe(gulp.dest(DEST_IMAGE_PATH));
});

gulp.task('compile:less', () => {
  return gulp.src([LESS_RESET_GLOB, LESS_GLOB, LESS_EXCL_GLOB])
    .pipe(less(LESS_GLOB))
    .pipe(sourcemaps.init())
    .pipe(concat(DEST_CSS_FILENAME))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST_CSS_PATH));
});

gulp.task('clean:theme', () => {
  return del([
    DEST_ROOT
  ]);
});

gulp.task('clean:public', () => {
  return del([
    PUBLIC_ROOT
  ]);
});

gulp.task('clean', ['clean:theme', 'clean:public']);

gulp.task('build', [
  'copy:images', 
  'copy:yml', 
  'copy:ejs', 
  'compile:less'
]);

gulp.task('build:watch', [
  'copy:images',
  'copy:yml',
  'copy:ejs',
  'compile:less',
  'retrieve:assets'
]);