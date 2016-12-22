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
const SERVICE_URL = 'http://risovach.ru/generator/vzhuh_1715393';

const MAX_LENGTH = 60;

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText = arg.fullText;
  let argObj  = arg.source;
  let VK      = argObj._vkapi;

  // Делаем запрос к сервису. Получаем один рандомный анекдот
  let phrases = [
    'И ты не выспался',
    'И тебе не дала та симпатичная телка',
    'И ты заебался',
    'И ты обосрался',
    'И ты сыч'
  ];

  let phrase = argText;
  if (!argText) {
    let index = Math.round(Math.random() * (phrases.length - 1));
    phrase = phrases[index];
  }

  // Truncate phrase
  phrase = String(phrase).substr(0, MAX_LENGTH);

  return prequest.post(SERVICE_URL, {
    form: {
      zdata1: 'Вжух!!!',
      zdata2: phrase
    },
    json: true,
    encoding: null
  })
  .then(img_binary => {
    return VK.upload('photo_pm', {
      // Данные для загрузки
      data: {
        value: img_binary,
        options: {
          filename: `photo_${Date.now()}.jpg`,
          contentType: 'image/jpg'
        }
      }
    });
  })
  .then(response => {
    return callback(null, {
      attachments: 'photo' + response[0].owner_id + '_' + response[0].id
    });
  })
  // Обрабатываем возникающие ошибки
  .catch(error => {
    return callback(error, 'Произошла неизвестная ошибка :(');
  });
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['вжух', 'магия'],
  description: 'Предсказания кота-вжуха',
  use: '/vjuh [текст вжуха]',

  run
}
