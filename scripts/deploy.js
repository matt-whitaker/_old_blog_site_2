const gulp        = require('gulp');
const deploy      = require('./helpers/deploy');
const handleError = require('./utils/handleError');

module.exports = (config) => () => {
  return gulp.src(`${config.src}/**/*.*`)
    .pipe(deploy(config))
    .on('error', handleError);
};