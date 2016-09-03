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
const SERVICE_URL = 'http://www.anekdot.ru/rss/randomu.html';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  // Делаем запрос к сервису. Получаем один рандомный анекдот
  return prequest(SERVICE_URL)
    .then(res => {
      // Матчим анекдот
      let anekdot = res.match(/\['([^']+)/)[1];
          anekdot = anekdot.replace(/<br>/, '\n');

      return callback(null, anekdot);
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['анекдот'], 
  description: 'Парсит и присылает случайный анекдот с anekdot.ru', 
  use: '/joke', 

  run
}