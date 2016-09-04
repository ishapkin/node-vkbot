'use strict';

/**
 * Module dependencies
 * @private
 */
const search = require('./_vk-search.js');

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['музыка'], 
  description: 'Осуществляет поиск аудиозаписей во ВКонтакте по заданному запросу.', 
  use: '/music <запрос> [кол-во]', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return search('music', arg, callback);
  }
}