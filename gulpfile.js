"use strict";

const del = require('del');

const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

const SRC_ROOT = 'src/';
const EJS_GLOB = `${SRC_ROOT}**/*.ejs`;
const LESS_GLOB = `${SRC_ROOT}**/*.less`;
const LESS_EXCL_GLOB = `!${SRC_ROOT}_3rd-party/**/*.less`;
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

gulp.task('copy:ejs', () => {
  gulp.src(EJS_GLOB)
    .pipe(gulp.dest(DEST_LAYOUT_PATH));
});

gulp.task('copy:yml', () => {
  gulp.src(YML_GLOB)
    .pipe(gulp.dest(DEST_YML_PATH));
});

gulp.task('copy:images', () => {
  gulp.src(IMAGE_GLOB)
    .pipe(gulp.dest(DEST_IMAGE_PATH));
});

gulp.task('compile:less', () => {
  gulp.src([LESS_GLOB, LESS_EXCL_GLOB])
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
gulp.task('build', ['copy:images', 'copy:yml', 'copy:ejs', 'compile:less']);