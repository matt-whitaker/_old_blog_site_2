const fileType  = require('file-type');
const Promise   = require('bluebird');
const fsPath    = require('path');

module.exports = (file) => new Promise((res, rej) => {
  const mimeType = fileType(file.contents);

  if (!mimeType || !mimeType.mime) {
    if(fsPath.extname(file.path) === '.html') {
      return res('text/html');
    }

    if(fsPath.extname(file.path) === '.css') {
      return res('text/css');
    }

    return rej(new Error('MIME could not be parsed'));
  }

  return res(mimeType.mime);
});