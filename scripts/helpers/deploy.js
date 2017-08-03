const through2      = require('through2');
const uuid          = require('uuid');
const util          = require('gulp-util');
const R             = require('ramda');
const fsPath        = require('path');
const request       = require('request-promise');
const comments      = require('html-comments');
const AWS           = require('aws-sdk');
const Promise       = require('bluebird');
const colors        = require('colors');
const handleError   = require('../utils/handleError');
const getFileType   = require('../utils/getFileType');

module.exports = function deploy (config) {
  const keys = [];
  let promise;

  const s3 = new AWS.S3();
  const cloudfront = new AWS.CloudFront();

  return through2.obj(function (chunk, enc, next) {
    const bucket = process.env.AWS_BUCKET;
    const srvRoot = config.src;
    const { cwd, base, path, history } = chunk;

    const key = fsPath.relative(fsPath.resolve(cwd, srvRoot), path);
    keys.push(key);

    return Promise.resolve()
      .then(() => getFileType(chunk))
      .then((mime) => ({
        Bucket: bucket,
        Key: key,
        Body: chunk.contents,
        ACL: 'public-read',
        ContentType: mime
      }))
      .tap(({ ContentType }) => util.log(`Uploading ${key} as ${ContentType}`))
      .then((params) => s3.putObject(params).promise())
      .tap(() => this.push(chunk))
      .tap(() => next())
      .catch(console.error);
  }, function (next) {
    util.log('Invalidating CDN')
    return Promise.resolve()
      .then(
        R.when(() => process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
        () => cloudfront.createInvalidation({
          DistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
          InvalidationBatch: {
            CallerReference: uuid.v4(),
            Paths: {
              Quantity: 1,
              Items: [
                '/*'
              ]
            }
          }
        }).promise()))
      .then(() => next());
  });
};