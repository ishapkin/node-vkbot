'use strict';

/**
 * Реализует функции некоторых сервисов Microsoft:
 *   how-old.net  (howold.js)
 *   what-dog.net (whatdog.js)
 *
 * Работает без каких-либо токенов или авторизации.
 */

/**
 * Module dependencies
 * @private
 */
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const SERVICE_URL = 'https://www.%type%.net/Home/Analyze';
const GENDER      = {
  'Female': '👩 Женщина', 
  'Male':   '👨 Мужчина'
};

/**
 * Преобразует ответ сервера в текстовое сообщение.
 * @param  {String} type
 * @param  {Object} response
 * @return {String}
 * @private
 */
function processResponse (type, response) {
  let jsonResponse = null;

  // Пытаемся спарсить ответ в JSON
  try {
    jsonResponse = JSON.parse(JSON.parse(response));
  } catch (e) {}

  // Спарсить не удалось. Сообщаем об этом
  if (jsonResponse === null) 
    return 'Данные не были получены. Попробуйте повторить запрос позже.';

  // Обрабатываем ответ сервиса how-old.net
  if (type === 'how-old') {
    // Массив данных о найденных на фото лицах
    let faces   = jsonResponse.Faces;
    let message = '';

    // Массив пуст => лиц на фото нет
    if (faces.length === 0) 
      return 'Не удалось обнаружить лицо на фотографии.';

    // Пробегаемся по массиву и собираем информацию в сообщение
    for (let i = 0, len = faces.length; i < len; i++) {
      let current = faces[i].attributes;

      message += GENDER[current.gender] + ', возраст ' + current.age + '\n';
    }

    // Возвращаем сообщение
    return message;
  }

  // Обрабатываем ответ сервиса what-dog.net
  if (type === 'what-dog') {
    // IsDog !== true => на фото не собака
    if (jsonResponse.IsDog !== true) 
      return 'Не удалось обнаружить собаку на фотографии.';

    // Возвращаем сообщение
    return `Порода: ${jsonResponse.BreedName}`;
  }

  // Неизвестное значение переменной type. Возвращаем null
  return null;
}

/**
 * Process command
 * @param  {String}     type
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function processCommand (type, arg, callback) {
  let argPhoto  = arg.attachment('photo');
  let messageId = arg.source.messageId;
  let VK        = arg.source._vkapi;

  // Нет прикреплённого фото. Ничего не отправляем
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
      return prequest.post(SERVICE_URL.replace(/%type%/, type), {
        // Устанавливаем необходимые параметры запроса
        qs: {
          isTest: false
        }, 

        // Устанавливаем необходимые заголовки
        headers: {
          'Content-Type':   'application/octet-stream', 
          'Content-Length': imageBuffer.length
        }, 

        // Отправляем содержимое изображения в теле запроса
        body: imageBuffer
      });
    })
    // Обрабатываем ответ сервиса
    .then(response => {
      let message = processResponse(type, response);

      return callback(null, message);
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = processCommand;