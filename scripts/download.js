"use strict";

// IvUq68oTMQMAAAAAAAAA21CGdyblOIX9ST-Hc9_-zkfnUwtIVPztQBcX-iQok4aA
const _ = require('ramda');
const execute = require('child_process').exec;
const https = require('https');
const _path = require('path');
const request = require('request');
const mkdirp = require('mkdirp');
const fs = require('fs');

const { ACCESS_TOKEN } = process.env;
const DT_PATH = '/DisjointedThinking';

const ENTRY_TYPE_FOLDER = 'folder';
const ENTRY_TYPE_FILE = 'file';

const listFolderRecursive = (path) => {
  const options = {
    uri: 'https://api.dropboxapi.com/2/files/list_folder',
    method: 'POST',

    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    json: true,
    body: {"path": path, "recursive": true}
  };

  return new Promise((res, rej) => {
    request(options, (error, response, body) => {
      if (error) {
        return rej(error);
      }

      res(body);
    })
  });
};

const download = (path, output) => {
  const options = {
    uri: 'https://content.dropboxapi.com/2/files/download',
    method: 'POST',

    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Dropbox-API-Arg': `{"path":"${path}"}`
    }
  };

  mkdirp(_path.dirname(output));

  return new Promise((res, rej) => {
    request(options).pipe(fs.createWriteStream(output)).on('close', (error, response, body) => {
      if (error) {
        return rej(error);
      }

      res(body);
    });
  });
};



listFolderRecursive(DT_PATH)
  .then((json) => {
    const isFile = (entry) => entry['.tag'] === ENTRY_TYPE_FILE;
    const isImage = (entry) => entry.path_lower.indexOf('/images/') > -1;
    const isMarkdown = (entry) => entry.path_lower.indexOf('/source/') > -1;

    const getFiles = _.filter(isFile);
    const getImages = _.filter(isImage);
    const getMds = _.filter(isMarkdown);

    const files = getFiles(json.entries);
    const images = getImages(files);
    const mds = getMds(files);

    const path = images[0].path_lower;
    const relativePath = _path.relative('/disjointedthinking', path);

    const target = `${process.cwd()}/${relativePath}`;

    return download(path, target);
  })
  .catch((error) => {
    console.error(error);
  });