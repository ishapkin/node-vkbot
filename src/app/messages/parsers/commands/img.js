'use strict';

/**
 * Ищет изображения в Google
 */

const prequest = require('request-promise');
const parsers  = require('./include/parsers');

function run (arg, callback) {
  let self    = this; // this = Application

  let argText = arg.fullText;
  let VK      = arg.source._vkapi;

  // Нет запроса
  if (argText === null) 
    return callback(null);

  // Обрезаем текст. Гугл принимает до ~150 символов, но нам столько не нужно
  argText = argText.replace(/<br>/g, ' ').slice(0, 100);

  // Создаём URL для запроса
  let reqUrl = 'https://google.ru/search?newwindow=1&site=imghp&tbm=isch&source=hp&q=' + encodeURIComponent(argText);

  // Делаем запрос в Google, установив нужные заголовки. 
  // Заголовки нужны для того, чтобы Google отдавал мобильную легковесную версию сайта, 
  // которую легче распарсить
  return prequest(reqUrl, {
    headers: {
      'User-Agent': 'SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)', 
      'Referer': 'https://www.google.ru/'
    }
  })
  .then(response => parsers.parseGoogleImgUrl(response))
  .then(result => {
    // Если result === null, значит, таких изображений нет. 
    if (result === null) 
      throw callback(null, 'Не найдено изображений по вашему запросу.');

    return result;
  })
  .then(imgurl => {
    // В данном случае imgurl является функцией, которая возвращает 
    // URL изображений, начиная с первого. Каждый новый вызов функций - новый URL 
    // следующего изображения по счёту.
    // 
    // Если вдруг изображения по ссылке не существует, пытаемся получить следующего, 
    // и так далее до успешной попытки. Функция передаёт дальше объект Request, из 
    // которого можно читать буффер изображения
    return (function tryAgain () {
      return prequest(imgurl(), { encoding: null, followAllRedirects: true })
        .catch(e => {
          if (e.error.code === 'ENOTFOUND') 
            return tryAgain();

          throw callback(null, 'Не удаётся получить изображение. Скорее всего, оно повреждено.');
        });
    })();
  })
  .then(imageBuffer => {
    // На этом этапе загружается изображение во ВКонтакте. 
    // Загружается оно как граффити
    return VK.upload('graffiti', {
      data: {
        value: imageBuffer, 
        options: {
          filename: `image${Date.now()}.png`, 
          contentType: 'image/png'
        }
      }
    });
  })
  .then(uploadResponse => {
    // Изображение загружно. Это документ под видом граффити. 
    // Возвращаем ответ
    return callback(null, {
      attachments: 'doc' + uploadResponse[0].owner_id + '_' + uploadResponse[0].id
    });
  })
  .catch(error => {
    // Если error === undefined, значит, скорее всего, уже был вызван callback
    if (error !== undefined) {
      // photos_list is invalid: битое изображение
      if (error.name === 'VKApiError' && error.code === 100) 
        return callback(null, 'Не удалось загрузить изображение. Скорее всего, оно повреждено. \nПопробуйте сделать другой запрос.');

      // Оборвалось соединение. Пробуем ещё раз
      if (error.error && error.error.code === 'ECONNRESET') 
        return run(arg, callback);

      return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
    }
  });
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 3, 

  aliases:     ['картинка'], 
  description: 'Осуществляет поиск изображния в Google.', 
  use: '/img <запрос>', 

  run
}