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
const SERVICE_URL = 'https://source.unsplash.com/random/800x600';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let VK = arg.source._vkapi;

  // Переходим по ссылке сервиса, получаем прямую ссылку на случайное изображение. 
  // Передаём дальше readable stream
  return prequest(SERVICE_URL, {
      // Бинарная кодировка
      encoding: null, 

      // Разрешаем редиректы
      followAllRedirects: true
    })
    // Читаем из stream и загружаем изображение во ВКонтакте
    .then(bufferStream => {
      return VK.upload('photo_pm', {
        data: {
          // Собственно, сам stream, откуда читается содержимое изображения
          value: bufferStream, 
          options: {
            // Как правило, изображения с unsplash.com имеют формат .jpg
            filename: `unsplash-image_${Date.now()}.jpg`, 
            contentType: 'image/jpg'
          }
        }
      });
    })
    // Изображение загрузилось, прикрепляем его к сообщению
    .then(response => {
      return callback(null, {
        attachments: 'photo' + response[0].owner_id + '_' + response[0].id
      });
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     [], 
  description: 'Вернёт случайное изображение с unsplash.com.', 
  use: '/unsplash', 

  run
}