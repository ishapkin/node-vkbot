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

  aliases:     ['гиф', 'гифка'], 
  description: 'Осуществляет поиск .gif-документов во ВКонтакте по заданному запросу.', 
  use: '/gif <запрос> [кол-во]', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return search('gif', arg, callback);
  }
}