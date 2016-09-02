'use strict';
/* eslint-env es6 */

// Debugging
const module_name = 'metalsmith-review-flag';
const debug_lib = require('debug');
const debug = debug_lib(module_name);
const info = debug_lib(`${module_name}:info`);
const error = debug_lib(`${module_name}:error`);

// npm packages
const moment = require('moment');

// functions
const needs_review = function (file, comment, status = 'not-ok') {
    debug('needs_review - comment: "%s", file: "%s"', comment, file.title);
    file.review = file.review || {};
    file.review.status = status;
    file.review.comment = (file.review.comment) ? file.review.comment + '\n\n' + comment : comment;
};

// plugin
const review_flag = function () {
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();
        const review_messages = metadata.site.review_messages;

        if (!review_messages) {
            error('Review messages not set in `config.yml`');
            return done(new Error('Review messages not set in `config.yml`'));
        }

        if (metadata.site.review_period) {
            let review_point = moment().startOf('day');
            if (metadata.site.review_release_date) {
                review_point = moment(metadata.site.review_release_date, 'YYYY-MM-DD');
                if (!review_point.isValid()) {
                    error('Review release date is not a valid date (YYYY-MM-DD). %s', metadata.site.review_release_date);
                    return done(new Error('Review release date is not a valid date'));
                }
            }
            let review_period_split = metadata.site.review_period.split(' ');
            if (review_period_split.length === 2) {
                let review_period = moment.duration(+review_period_split[0], review_period_split[1]);

                if (review_period.asMilliseconds()) {
                    Object.keys(files).forEach(function (filepath) {
                        debug('Filepath: %s', filepath);
                        let file = files[filepath];

                        if (file.review && file.review.date) {
                            let review_date = moment(file.review.date, 'YYYY-MM-DD');
                            if (review_date.isValid()) {
                                let within_review_period = review_date.add(review_period).isAfter(review_point);
                                if (!within_review_period) {
                                    // Invalid Review Date
                                    needs_review(file, review_messages.overdue);
                                }
                            }
                            else {
                                // Invalid Review Date
                                needs_review(file, review_messages.invalid_date);
                            }
                        }
                        else {
                            // Review date not set.
                            needs_review(file, review_messages.not_set);
                        }
                    });
                }
                else {
                    error('Review period did not result in a valid duration. %s', metadata.site.review_period);
                    return done(new Error('Review period did not result in a valid duration'));
                }
            }
            else {
                error('Review period in incorrect form. %s', metadata.site.review_period);
                return done(new Error('Review period in incorrect form'));
            }
        }
        else {
            info('No review period set');
        }

        return done();
    };
};


module.exports = review_flag;
