'use strict';

/**
 * Module dependencies
 * @private
 */
const parsers  = require('./include/parsers');
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const SERVICE_SEARCH_URL = 'http://stavklass.ru/images/search';
const SERVICE_RANDOM_URL = 'http://stavklass.ru/images/random.jpg';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let VK         = arg.source._vkapi;
  let url        = SERVICE_SEARCH_URL;
  let encoding   = 'utf8';
  let searchText = arg.fullText;
  let paramName  = 'image[text]';
  let isRandom   = false;

  // Если запрос не указан, либо он === 'random', то 
  // выставляем настройки для получения случайного изображения
  if (searchText === null || searchText === 'random') {
    url        = SERVICE_RANDOM_URL;
    encoding   = null;
    searchText = Date.now();
    paramName  = 'n';
    isRandom   = true;
  } else {
    // Обрезаем длинные поисковые запросы до 100 символов
    searchText = searchText.replace(/<br>/g, ' ').slice(0, 100);
  }

  return prequest(url, {
      encoding, 
      qs: {
        [paramName]: searchText
      }
    })
    .then(response => {
      // Если isRandom === true, значит в response сейчас находится readable stream, 
      // поэтому просто передаём его по цепочке
      if (isRandom === true) 
        return response;

      // Парсим ссылку на изображение
      return parsers.parseStavKlassImgUrl(response)
        // Затем переходим по ссылке и возвращаем readable stream
        .then(imageUrl => {
          return prequest(imageUrl, {
            // Бинарная кодировка
            encoding: null
          });
        });
    })
    // Читаем из stream и загружаем изображение во ВКонтакте
    .then(bufferStream => {
      return VK.upload('photo_pm', {
        data: {
          // Собственно, сам stream, откуда читается содержимое изображения
          value: bufferStream, 
          options: {
            // Как правило, изображения с stavklass.ru имеют формат .jpg
            filename: `stavklass-image_${Date.now()}.jpg`, 
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
    .catch(error => {
      if (error && error.statusCode == '500') 
        return callback(null, 'По вашему запросу ничего не найдено.');

      return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
    });
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['класс'], 
  description: 'Ищет и отправляет мемчик по запросу с сайта stavklass.ru.', 
  use: '/klass [запрос]', 

  run
}