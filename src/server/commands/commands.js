'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs = require('fs');

/**
 * Run fn
 * @param  {Array}     args
 * @param  {Function}  callback
 * @public
 */
function run (args, callback) {
  fs.readdir(__dirname, function (error, results = []) {
    let commands = results.map(v => v.slice(0,-3)).filter(v => !v.startsWith('_')).join('\n');

    callback(null, 'Доступные команды:\n\n' + commands);
  });
}

module.exports = {
  use: '/commands', 
  run
}