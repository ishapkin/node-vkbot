'use strict';

/**
 * Run fn
 * @param  {Array}     args
 * @param  {Function}  callback
 * @public
 */
function run (args, callback) {
  callback(null, 'Статус ботов / статус бана/випа юзера.');
}

module.exports = {
  use: '/status', 
  run
}