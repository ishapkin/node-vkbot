'use strict';

/**
 * Module dependencies
 * @private
 */
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const PHOTO_URL = 'photo4219809_456239902';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  return callback(null, {
    message: '',
    attachments: PHOTO_URL,
  });
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['спок', 'споке', 'споки'],
  description: 'Желает всем споки.',
  use:         '/spok',

  run
}
