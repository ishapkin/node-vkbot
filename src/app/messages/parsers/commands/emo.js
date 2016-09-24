'use strict';

/**
 * Module dependencies
 * @private
 */
const apiKey   = require('../../../../config').api.emotions;
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const SERVICE_URL = 'https://api.projectoxford.ai/emotion/v1.0/recognize';

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
    // Отправляем запрос к сервису с ссылкой на фото, получаем данные
    .then(response => {
      let url = response[0].photo_604;

      return prequest.post(SERVICE_URL, {
        // В заголовках прописываем API ключ
        headers: {
          'Content-Type': 'application/json', 
          'Ocp-Apim-Subscription-Key': apiKey
        }, 

        // В теле запроса передаём параметр "url" (ссылка на фото)
        body: {
          url
        }, 

        // Парсим ответ в JSON
        json: true
      });
    })
    // Обрабатываем полученный от сервиса ответ
    .then(response => {
      // Пустой ответ => лица не обнаружены
      if (!response || !response[0]) 
        return callback(null, 'Не удалось обнаружить лицо на фотографии.');

      let textToSend = '';
      let emotions   = response[0].scores;

      // Преобразуем значения в более читаемый и компактный вид
      for (let i = 0, emoKeys = Object.keys(emotions), len = emoKeys.length; i < len; i++) 
        emotions[emoKeys[i]] = (emotions[emoKeys[i]] * 100).toFixed(1) + '%';

      // Ответный массив содержит более одного элемента, значит 
      // на фотографии более, чем одно лицо
      if (response.length > 1) 
        textToSend += 'На фото более одного лица. Показываются эмоции только первого. \n\n';

      textToSend += `😠 Злость: ${emotions.anger}\n` + 
                    `😏 Презрение: ${emotions.contempt}\n` + 
                    `😒 Отвращение: ${emotions.disgust}\n` + 
                    `😱 Страх: ${emotions.fear}\n` + 
                    `😊 Счастье: ${emotions.happiness}\n` + 
                    `😐 Нейтральность: ${emotions.neutral}\n` + 
                    `😞 Грусть: ${emotions.sadness}\n` + 
                    `😲 Удивление: ${emotions.surprise}`;

      return callback(null, textToSend);
    })
    // Обрабатываем возникающие ошибки
    .catch(error => {
      // Одна из следующих ошибок:
      // 1. Ошибка парсинга JSON
      // 2. Не удалось спарсить положения лица на фото
      // 3. Лиц на фото более 64
      // 4. Не удалось определить content-type
      if (error.statusCode === 400) 
        return callback(null, 'Невозможно распознать эмоции. Попробуйте загрузить другую фотографию.');

      // 401: Недействительный ключ API
      // 403: Достигли месячного лимита API в 30000 запросов
      if (error.statusCode === 401 || error.statusCode === 403) 
        return callback(error, 'Внутренняя ошибка. Пожалуйста, напишите об этом администратору: vk.com/botsforchats');

      // Достигли минутного лимита
      if (error.statusCode === 429) 
        return callback(null, 'Сейчас запрос не может быть обработан. Попробуйте через несколько минут.');

      return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
    });
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['эмоции', 'эмо'], 
  description: 'Определяет эмоции на лице человека.', 
  use: '/emo <изображение>', 

  run
}