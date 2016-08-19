"use strict";

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

  return new Promise((res, rej) => {
    request(options).pipe(fs.createWriteStream(output)).on('close', (error, response, body) => {
      if (error) {
        return rej(error);
      }

      res(body);
    });
  });
};

module.exports = () => {
  if (!ACCESS_TOKEN) {
    throw(new Error("ACCESS_TOKEN MISSING!"));
  }

  return listFolderRecursive(DT_PATH)
    .then(({ entries }) => {
      const isFile = (entry) => entry['.tag'] === ENTRY_TYPE_FILE;
      const isDirectory = (entry) => entry['.tag'] === ENTRY_TYPE_FOLDER;

      const getFiles = _.filter(isFile);
      const getDirectories = _.filter(isDirectory);
      const getFilePath = (entry) => entry.path_lower;
      const getFilePaths = _.map(getFilePath);

      const files = getFiles(entries);
      const paths = getFilePaths(files);

      const directories = getDirectories(entries);

      const normalizeDirectory = (dir) => dir.path_lower.replace('/disjointedthinking', '');
      const normalizeDirectories = _.map(normalizeDirectory);

      const normalizedDirectories = normalizeDirectories(directories);

      for (let dir of normalizedDirectories) {
        if (dir) {
          mkdirp(`${process.cwd()}${dir}`)
        }
      }

      const downloadAll = _.map((path) => {
        const relativePath = _path.relative('/disjointedthinking', path);
        const target = `${process.cwd()}/${relativePath}`;

        return download(path, target);
      });


      return Promise.all(downloadAll(paths));
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}