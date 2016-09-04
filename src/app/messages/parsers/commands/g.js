'use strict';

/**
 * Module dependencies
 * @private
 */
const prequest = require('request-promise');
const parsers  = require('./include/parsers');
const replacer = require('./include/replacer');

/**
 * Local constants
 * @private
 */
const SERVICE_URL = 'https://google.ru/search';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText = arg.fullText;
  let VK      = arg.source._vkapi;

  // Поисковый запрос не задан
  if (argText === null) 
    return callback(null);

  // Обрезаем текст. Гугл принимает до ~150 символов, но нам столько не нужно
  argText = argText.replace(/<br>/g, ' ').slice(0, 90);

  // Делаем запрос с мобильным User-Agent
  return prequest(SERVICE_URL, {
    // Указываем параметры запроса
    qs: {
      q:   argText, 
      num: 2, 
      pws: 0
    }, 

    // Проставляем необходимые заголовки (мобильный User-Agent и Referrer)
    headers: {
      'User-Agent': 'SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)', 
      'Referer': 'https://www.google.ru/'
    }
  })
  // Парсим результаты
  .then(response => parsers.parseGoogleResults(response))
  .then(result => {
    // Проверим, есть ли ответ на запрос
    if (result === null) 
      throw callback(null, 'По вашему запросу ничего не найдено.');

    return result;
  })
  .then(parsed => {
    let link = parsed.link;
    let text = replacer(parsed.text);

    // Ссылки нет, проверять нечего
    if (link.length === 0) 
      return text;

    // Проверим, не заблокирована ли ссылка во ВКонтакте
    return VK.call('utils.checkLink', {
        url: link
      })
      .then(response => {
        if (response.status === 'not_banned') 
          // Ссылка не заблокирована. Возвращаем текст с ссылкой
          return text + '\n' + link;
        else
          // Ссылка заблокирована или ещё не проверена
          return 'Найденный по вашему запросу сайт заблокирован во ВКонтакте.';
      })
      // Обрабатываем возникающие ошибки
      .catch(error => {
        // Не удалось проверить, заблокирована ли ссылка. 
        // В таком случае вместо ответа возвращаем ниже приведенный текст
        return 'Не удалось получить данные. Повторите запрос позже.';
      });
  })
  // Отправляем сообщение
  .then(message => callback(null, message))
  // Обрабатываем возникающие ошибки
  .catch(error => {
    if (error !== undefined) {
      // Соединение оборвалось. Попробуем ещё раз
      if (error.error && error.error.code === 'ECONNRESET') 
        return run(arg, callback);

      return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
    }
  });
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['google', 'гугл'], 
  description: 'Ищет в Google и возвращает результат.', 
  use: '/g <запрос>', 

  run
}