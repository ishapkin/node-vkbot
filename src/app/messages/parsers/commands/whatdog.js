'use strict';

/**
 * Module dependencies
 * @private
 */
const microsoft = require('./_microsoft-services');

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['порода'], 
  description: 'Определяет породу собаки по фото.', 
  use: '/whatdog <изображение>', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return microsoft('what-dog', arg, callback);
  }
}