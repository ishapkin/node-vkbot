'use strict';

/**
 * Module dependencies
 * @private
 */
const commandParser = require('./_command-parser');

module.exports = function (messageObj) {
  let self = this; // this = Application

  return {
    // Условие, при котором этот парсер применится к сообщению
    cond: /^\//.test(messageObj.message), 

    // Сама функция парсера.
    fn: commandParser.call(self, messageObj)
  }
}