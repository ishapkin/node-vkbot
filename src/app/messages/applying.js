'use strict';

const parsers     = require('./parsers');
const middlewares = require('./middlewares');
const debug       = require('../../lib/simple-debug')(__filename);

/**
 * Применение подходящего парсера к сообщению
 * @param  {Object} messageObj Объект сообщения
 * @return {Promise}
 * @public
 */
function parser (messageObj) {
  return new Promise(resolve => {
    let parsersToUse = [];
    let parserToUse;

    // Фильтрация подходящих парсеров
    for (let i = 0, len = parsers.length; i < len; i++) {
      let parser = parsers[i].call(this, messageObj);

      if (parser.cond === true) {
        delete parser.cond;

        if (parser.priority === undefined) 
          parser.priority = Infinity;

        parsersToUse.push(parser);
      }
    }

    // Сортировка по приоритетности
    if (parsersToUse.length > 1) 
      parsersToUse = parsersToUse.sort((a, b) => (b.priority - a.priority) || 0);

    // Берём самый приоритетный парсер
    if (parsersToUse.length !== 0) 
      parserToUse = parsersToUse[0].fn;

    // Удостоверимся в наличии функции парсера
    if (parserToUse === undefined) 
      return resolve(null);

    debug.out('= Parser used', parserToUse.name);

    // Применяем парсер к сообщению
    return parserToUse(res => resolve(res));
  });
}

/**
 * Применение всех миддлвэйров к сообщению
 * @param  {Object} messageObj Объект сообщения
 * @return {Promise}           Объект с новыми свойствами
 * @public
 */
function middleware (messageObj) {
  return new Promise(resolve => {
    let newVars = [];
    let output;

    // Прогоняем сообщения через мидлвэйры
    for (let i = 0, len = middlewares.length; i < len; i++) 
      newVars.push(middlewares[i].call(this, messageObj));

    // Вносим изменения в исходный объект сообщения
    output = Object.assign(messageObj, ...newVars);

    // Возвращаем результат (новый объект сообщения)
    return resolve(output);
  });
}

module.exports = {
  parser, 
  middleware
}