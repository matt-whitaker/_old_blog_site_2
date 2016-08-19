const Ramda = require('ramda');

console.log("Registering Ramda.js");

hexo.extend.helper.register('getRamda', () => Ramda);