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

  aliases:     ['фото'], 
  description: 'Осуществляет поиск фотографий во ВКонтакте по заданному запросу.', 
  use: '/photo <запрос> [кол-во]', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return search('photo', arg, callback);
  }
}