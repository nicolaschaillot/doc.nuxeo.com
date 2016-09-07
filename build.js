'use strict';
/* eslint-env es6 */
/* eslint no-console: 0 */

// Assume production if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Set Debugging up
if (!process.env.DEBUG) {
    process.env.DEBUG = '*:info,*:error';
}

// Debugging
const {debug, info, error} = require('./modules/debugger')('nuxeo-build');

// npm packages
const Promise = require('bluebird');
const co = require('co');
const fs = require('fs');
const path = require('path');

// Promisified
const readFile = Promise.promisify(fs.readFile);

// local packages
const builder = require('./lib/builder');

const repo_id = process.argv[2];
const branch = process.argv[3];
const source_path = process.argv[4].replace(/(^"|"$)/g, '');
const target_path = process.argv[5].replace(/(^"|"$)/g, '');
debug({repo_id, branch, source_path, target_path});

co(function *() {
    console.time('Build');
    info('Starting Build: %s - %s', repo_id, branch);

    // Get the metadata
    const metadata_raw = yield readFile(path.join(__dirname, 'temp/metadata.json'));
    const metadata = JSON.parse(metadata_raw);

    debug(Object.keys(metadata));

    yield builder(source_path, metadata, target_path, repo_id);

    console.timeEnd('Build');

}).catch(function (err) {
    error(err);
    throw err;
});
