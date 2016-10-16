'use strict';

/**
 * Module dependencies
 * @private
 */
const search = require('./_vk-search.js');

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 3, 

  aliases:     ['видео'], 
  description: 'Осуществляет поиск видеозаписей во ВКонтакте по заданному запросу.', 
  use: '/video <запрос> [кол-во]', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return search('video', arg, callback);
  }
}