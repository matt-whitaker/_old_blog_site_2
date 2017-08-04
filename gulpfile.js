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
const EJS_GLOB = `${SRC_ROOT}**/*.ejs`;
const LESS_RESET_GLOB = `${SRC_ROOT}less/_3rd-party/reset.less`;
const LESS_GLOB = `${SRC_ROOT}less/**/*.less`;

const DEST_ROOT = 'themes/dt/';
const DEST_LAYOUT_PATH = `${DEST_ROOT}layout/`;
const DEST_CSS_PATH = `${DEST_ROOT}source/css/`;
const DEST_CSS_FILENAME = 'app.css';

const PUBLIC_ROOT = 'public/';

const hexo = new Hexo(process.cwd(), {});

gulp.task('clean:assets', () => {
  return del([ './source' ]);
});

// if (process.env.NODE_ENV === 'production') {
//   gulp.task('retrieve:assets', ['clean:assets'], () => {
//     return download();
//   });
// } else {
//   // copy the assets from the depth of the machine... ie my dropbox folder
//   gulp.task('retrieve:assets', ['clean:assets'], () => {
//     const copyAssets = () => (new Promise((res, rej) => {
//       gulp.src(['**/*'], { cwd: process.env.DROPBOX_PATH })
//         .pipe(gulp.dest('./'))
//         .on('end', res)
//         .on('error', (err) => console.error(err) || rej(err));
//     }));
//
//     const moveConfig = () => (new Promise((res, rej) => {
//       gulp.src('config.')
//         .pipe(gulp.dest('./'))
//         .on('end', res)
//         .on('error', (err) => console.error(err) || rej(err));
//     }));
//
//     return copyAssets().then(moveConfig);
//   });
// }

gulp.task('copy:ejs', () => {
  return gulp.src(EJS_GLOB)
    .pipe(gulp.dest(DEST_LAYOUT_PATH));
});

gulp.task('compile:less', () => {
  return gulp.src([LESS_RESET_GLOB, LESS_GLOB])
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
  'copy:ejs', 
  'compile:less'
]);

gulp.task('build:watch', [
  'copy:ejs',
  'compile:less',
  'retrieve:assets'
]);

const config = {
  src: PUBLIC_ROOT,
};

gulp.task('deploy', deploy(config));