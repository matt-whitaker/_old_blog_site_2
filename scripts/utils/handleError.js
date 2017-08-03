const util = require('gulp-util');

module.exports = function handleError (err) {
  util.log(err);
  this.emit('end');
};