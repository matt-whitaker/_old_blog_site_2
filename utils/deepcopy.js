"use strict";
const ncp = require('ncp');

module.exports = (src, target) => {
  return new Promise((res, rej) => {
    ncp(src, target, (err) => {
      if(err) return rej(err);
      else res();
    })
  });
};