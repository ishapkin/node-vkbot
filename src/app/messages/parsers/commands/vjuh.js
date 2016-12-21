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
	let phrases = [
		'И ты не выспался',
		'И тебе не дала та симпатичная телка',
		'И ты заебался',
		'И ты обосрался',
		'И ты сыч'
	];

	let index = Math.round(Math.random() * (phrases.length - 1));
      return callback(null, 'Вжух!!! ' + phrases[index]);
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['вжух', 'магия', '/вжух'], 
  description: 'Предсказания кота-вжуха', 
  use: '/vjuh', 

  run
}
