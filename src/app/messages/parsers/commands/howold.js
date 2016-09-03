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

  aliases:     ['возраст'], 
  description: 'Определяет возраст человека по фотографии.', 
  use: '/howold <изображение>', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return microsoft('how-old', arg, callback);
  }
}