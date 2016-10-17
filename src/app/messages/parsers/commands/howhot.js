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
const SERVICE_URL = 'http://howhot.io/main.php';
const GENDER      = {
  'Female': '👩 Женщина', 
  'Male':   '👨 Мужчина'
};

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argPhoto  = arg.attachment('photo');
  let messageId = arg.source.messageId;
  let VK        = arg.source._vkapi;

  // Нет прикреплённого фото
  if (argPhoto === null) 
    return callback(null);

  // Получаем объект сообщения по его ID
  return VK.call('messages.getById', {
      message_ids: messageId
    })
    // Получаем сначала access_key, а затем 
    // объект фотографии, используя полученный ключ доступа
    .then(response => {
      let key = response.items[0].attachments[0].photo.access_key;

      return VK.call('photos.getById', {
        photos: argPhoto + '_' + key
      });
    })
    // Из полученного объекта фотографии "вытаскиваем" прямую ссылку на фото. 
    // Переходим по ссылке и передаём дальше readable stream
    .then(response => {
      let url = response[0].photo_604;

      return prequest(url, {
        // Бинарная кодировка
        encoding: null
      });
    })
    // Делаем запрос к сервису, получаем данные
    .then(imageBuffer => {
      return prequest.post(SERVICE_URL, {
        // Данные для отправки
        formData: {
          // Сервис требует наличие поля "browseFile"
          browseFile: {
            // Собственно, сам stream, откуда читается содержимое фотографии
            value: imageBuffer, 
            options: {
              // Абсолютно все фото ВКонтакте имеют формат .jpg
              filename: `image${Date.now()}.jpg`, 
              contentType: 'image/jpg'
            }
          }
        }, 

        // Парсить ответ нужно в JSON
        json: true
      });
    })
    // Обрабатываем полученный ответ сервиса
    .then(response => {
      // Сексуальность не определена. Скорее всего, на фото нет лица
      if (response.success !== true) 
        return callback(null, 'Определить сексуальность не удалось. Попробуйте другую фотографию.');

      let rmes = response.message;

      return callback(
        null, 
        `Пол: ${GENDER[rmes.gender]}\n` + 
        `Возраст: ${rmes.age}\n` + 
        `Сексуальность: ${parseFloat(rmes.hotness).toFixed(1)}/10`
      );
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['секс', 'сексуальность'], 
  description: 'Определяет сексуальность человека.', 
  use:         '/howhot <изображение>', 

  run
}