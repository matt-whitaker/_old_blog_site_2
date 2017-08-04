"use strict";

if (['development', 'production'].every((e) => process.env.NODE_ENV === e)) {
  throw(new Error("NODE_ENV can only be development or production!"));
}

const del = require('del');

const sequence = require('gulp-sequence');
const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const watch = require('gulp-watch');
const Hexo = require('hexo');

const deploy = require('./scripts/deploy');

require('dotenv').config();

const download = require('./utils/download.js');

const SRC_ROOT = 'src/';
const DEST_ROOT = 'themes/dt/';
const LESS_RESET_GLOB = `${SRC_ROOT}less/_3rd-party/reset.less`;
const LESS_GLOB = `${SRC_ROOT}less/**/*.less`;
const DEST_CSS_PATH = `${DEST_ROOT}source/css/`;
const DEST_CSS_FILENAME = 'app.css';

const PUBLIC_ROOT = 'public/';

const hexo = new Hexo(process.cwd(), {});

gulp.task('less', () => {
  return gulp.src([LESS_RESET_GLOB, LESS_GLOB])
    .pipe(less(LESS_GLOB))
    .pipe(sourcemaps.init())
    .pipe(concat(DEST_CSS_FILENAME))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST_CSS_PATH));
});

const config = {
  src: PUBLIC_ROOT,
};

gulp.task('deploy', deploy(config));
gulp.task('build', ['less']);