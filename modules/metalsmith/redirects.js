'use strict';
/* eslint-env es6 */

// Debugging
const {debug, warn, error} = require('../debugger')('metalsmith-redirects');

// npm packages
const each = require('async').each;
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const util = require('util');

const get_placeholder_key = require('../get_placeholder_key');
const key_to_url = require('../key_to_url');

const get_redirect_url = function (file, metadata) {
    const page = file.redirect_source || file.redirect || '';
    let url;

    const key = (page) ? get_placeholder_key(page, file.url.key) : '';
    try {
        url = key_to_url(key, metadata.pages);
    }
    catch (e) {
        warn('%s; Title: "%s"', e.message, file.title);
    }
    return url;
};

const escape_regex_url = str => str.replace(/([\.\+])/g, '\\$1');

/**
 * A Metalsmith plugin to add redirects to yaml file.
 *
 * @return {Function}
**/
const file_contents_preprocess = function () {
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();
        let redirects;
        const redirects_file = path.join(metalsmith.path(), 'redirects.yml');
        const finished = function (err) {
            let yaml_string = '';
            if (err) {
                return done(err);
            }
            try {
                yaml_string = yaml.safeDump(redirects, {indent: 4});
                fs.writeFileSync(redirects_file, yaml_string);
            }
            catch (e) {
                error('Redirects: %o', redirects);
                error('Problem encoding to YAML or writing file: %s', e);
                return done(new Error('YAML Conversion Failed with: ' + e + '\n\nredirects: ' + util.inspect(redirects, { showHidden: true, depth: null })));
            }
            return done();
        };

        // Get exisiting redirects
        try {
            redirects = yaml.safeLoad(fs.readFileSync(redirects_file, 'utf8')) || {};
        }
        catch (e) {
            redirects = {};
            error('Failed to load: %s: %j', redirects_file);
        }

        const matches = [];
        Object.keys(files).forEach(function (filepath) {
            const file = files[filepath];

            if (file.confluence && file.confluence.shortlink || file.redirect || file.redirect_source) {
                matches.push(filepath);
                debug('Pushed: %s with: %s', filepath, file.redirect);
            }
        });

        const add_redirect = function (filepath, callback) {
            const file = files[filepath];

            let redirect_url = '';
            if (file.redirect || file.redirect_source) {
                redirect_url = get_redirect_url(file, metadata);
            }

            if (redirect_url) {
                let this_url = get_placeholder_key('', file.url.key);
                this_url = '^/' + this_url;

                redirects[this_url] = redirect_url;
                file.layout = 'redirect.hbs';
            }
            if (file.confluence && file.confluence.shortlink) {
                if (redirect_url) {
                    redirects['^/x/' + file.confluence.shortlink] = redirect_url;
                }
                else {
                    redirects['^/x/' + file.confluence.shortlink] = file.url.full;
                }
            }

            // Not /pages/viewpage.action?pageId=28475451
            if (file.confluence && file.confluence.source_link && !~file.confluence.source_link.indexOf('pages/viewpage.action?')) {
                const source_url = '^' + escape_regex_url(file.confluence.source_link) + '/?$';

                if (redirect_url) {
                    redirects[source_url] = redirect_url;
                }
                else {
                    redirects[source_url] = file.url.full;
                }
            }

            callback();
        };

        each(matches, add_redirect, finished);
    };
};

module.exports = file_contents_preprocess;
