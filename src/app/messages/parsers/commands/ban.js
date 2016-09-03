'use strict';

/**
 * Module dependencies
 * @private
 */
const vkBans = require('./_ban-unban');

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 4, 

  aliases:     [], 
  description: 'Вносит пользователя в чёрный список.', 
  use: '/ban <user_id>', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return vkBans('ban', arg, callback);
  }
}