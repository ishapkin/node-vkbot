'use strict';

/**
 * Module dependencies
 * @private
 */
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const SERVICE_URL = 'http://zenrus.ru/build/js/currents.js';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  // Получаем данные о текущем курсе
  return prequest(SERVICE_URL)
    // Обрабатываем ответ
    .then(response => {
      let rates = null;

      // Пытаемся спарсить массив данных о текущих курсах
      try {
        rates = JSON.parse(response.split('=')[1].trim());
      } catch (e) {}

      // Спарсить не удалось
      if (rates === null) 
        return callback(null, 'Данные не были получены. Попробуйте повторить запрос позже.');

      return callback(
        null, 
        `💵 1 доллар = ${rates[0]} руб.\n` + 
        `💶 1 евро = ${rates[1]} руб.\n` + 
        `🛢 1 баррель нефти = $${rates[2]}`
      );
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(null, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['курс', 'доллар', 'евро', 'нефть'], 
  description: 'Присылает актуальный курс доллара, евро и нефти.', 
  use: '/rate', 

  run
}