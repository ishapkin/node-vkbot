'use strict';

/**
 * Реализует функцию поиска во ВКонтакте. 
 * Ищет аудио-, видеозаписи, фотографии и .gif-документы.
 *
 * Используется командами:
 *   gif.js
 *   music.js
 *   photo.js
 *   video.js
 */

/**
 * Module dependencies
 * @private
 */
const checker = require('./include/checker');

/**
 * Local constants
 * @private
 */
const NOT_FOUND_TEXT = 'По вашему запросу ничего не найдено.';
const DEF_COUNT      = 1;
const MAX_COUNT      = 8;
const CONFIG         = {
  music: {
    label: 'audio', 
    attach: 'audio', 
    params: {
      auto_complete: 0, // не исправлять ошибки в запросе
      lyrics: 0, // находить аудио не только со словами, но и без
      performer_only: 0, // искать не только по исполнителю
      sort: 2 // сортировать по популярности
    }
  }, 

  video: {
    label: 'video', 
    attach: 'video', 
    params: {
      hd: 0, // искать не только HD
      adult: 0, // "Безопасный поиск"
      sort: 2 // сортировать по релевантности
    }
  }, 

  photo: {
    label: 'photos', 
    attach: 'photo', 
    params: {
      sort: 1
    }
  }, 

  gif: {
    label: 'docs', 
    attach: 'doc', 
    params: {}
  }
};

/**
 * Определяет количество элементов для поиска
 * @param  {String} count arg.firstWord
 * @return {Number}
 * @private
 */
function getCount (count) {
  let cnt = parseInt(count) || DEF_COUNT;

  if (cnt > MAX_COUNT) 
    cnt = MAX_COUNT;

  return cnt;
}

/**
 * Process command
 * @param  {String}     type
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function processCommand (type, arg, callback) {
  let [query, count] = arg.queryCount;
  let typeObject     = CONFIG[type];
  let VK             = arg.source._vkapi;

  // Запрос не указан
  if (query === null) 
    return callback(null);

  // Обрезаем длинные запросы до 100 символов
  query = query.slice(0, 100);

  // Определим, сколько элементов искать
  count = getCount(count);

  // Для .gif-документов добавляем слово "gif" в поисковую строку
  if (type === 'gif') 
    query = 'gif ' + query;

  let params = Object.assign({ q: query, count }, typeObject.params);

  return VK.call(typeObject.label + '.search', params)
    // Обрабатываем ответ
    .then(response => {
      let items       = response.items;
      let attachItems = [];

      // Ничего не найдено
      if (items.length === 0) 
        return callback(null, NOT_FOUND_TEXT);

      // Пробегаемся по массиву найденных элементов и 
      // собираем новый отфильтрованный массив
      for (let i = 0, len = items.length; i < len; i++) {
        let current = items[i];

        // Ищем gif, но нашелся "левый" документ, пропускаем его
        if (type === 'gif' && current.ext !== 'gif') 
          continue;

        // Проверим, не содержит ли название трека запрещённые слова
        if (type === 'music') {
          let fullTitle = current.artist + ' ' + current.title;

          // Название содержит запрещённые слова, ничего не отправляем
          if (checker(fullTitle)) 
            return callback(null, 'Название аудиозаписи содержит запрещённые слова.');
        }

        // Добавляем элемент в новый массив
        attachItems.push(typeObject.attach + current.owner_id + '_' + current.id);
      }

      // В отфильтрованном массиве нет элементов, ничего не отправляем
      if (attachItems.length === 0) 
        return callback(null, NOT_FOUND_TEXT);

      return callback(null, {
        attachments: attachItems
      });
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = processCommand;