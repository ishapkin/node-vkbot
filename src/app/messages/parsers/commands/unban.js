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
  description: 'Выносит пользователя из чёрного списка.', 
  use: '/unban <user_id>', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return vkBans('unban', arg, callback);
  }
}