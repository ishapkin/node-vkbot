'use strict';

/**
 * Отвечает на сообщения-обращения к боту ("Бот, <...>").
 */

/**
 * Module dependencies
 * @private
 */
const prequest       = require('request-promise');
const config         = require('../../../config');
const getFromLocalDB = require('./helpers/get-answer-from-local-db');
const commandParser  = require('./_command-parser');
const cleverbot      = require('../helpers/cleverbot');

/**
 * Функция, возвращающая фейк-коллбэк, который всегда отдаёт null.
 * Используется для того, чтобы отбросить "разговорную форму" команд для личных сообщений, не дублируя при этом
 * большое количество кода.
 */
function fakeNullResult () {
  return function (callback) {
    return callback(null);
  }
}

module.exports = function (messageObj) {
  let self        = this; // this = Application
  let isMultichat = messageObj.isMultichat;
  let botPattern  = config.messages['bot-patterns'][messageObj.botId] || config.messages['bot-patterns']['default'];

  return {
    cond: isMultichat ? botPattern.test(messageObj.message) : true,
    priority: 0,

    fn: function appealParser (cb) {
      let message = messageObj.message;

      // Устанавливаем статус набора текста "<Бот> печатает..."
      messageObj._vkapi.call('messages.setActivity', {
        type: 'typing',
        [isMultichat ? 'peer_id' : 'user_id']: isMultichat ? (messageObj.chatId + 2000000000) : messageObj.fromId
      }).then(response => null).catch(error => null);

      /**
       * Пытаемся вызывать команды, вызванные в "разговорной форме" (Бот, <команда>).
       * * Только для бесед.
       *
       * Если команда возвращает null, то получаем ответ у Клевера.
       */

      // Вырезаем сообщение без обращения к боту.
      if (isMultichat) {
        message = message.replace(/^[^\s,]+(.*)/, '$1').trim();

        while (message.startsWith(','))
          message = message.slice(1);

        message = message.trim();

        // Обновляем сообщение для применения к парсеру команд.
        messageObj.message = '/' + message;
      }

      // Вызываем commandParser, если сообщение пришло в беседе,
      // иначе - фейковую функцию, которая вернёт null.
      (isMultichat ? commandParser : fakeNullResult).call(self, messageObj)(result => {
        // Есть какой-то результат, возвращаем его.
        if (result !== null)
          return cb(result);

        // Возвращаем прежнее значение сообщения.
        messageObj.message = message;

        // Сообщение не содержит ни одного русского символа
        // Даже не пытаемся получать ответ
        if (!/[а-яё]/ig.test(message))
          return cb('Sorry, I don\'t speak English :(');

        // Пытаемся получить ответ от cleverbot.com
        return cleverbot.send({
            user: config.api.cleverbot,
            message: {
              text:  message.slice(0, 250)
            },
            enabled: (config.api.cleverbot.enabled ? true : false)
          })
          .then(cleverAns => {
            let ansMess = cleverAns.response.trim();

            // Не пришло внятного ответа
            // Или от cleverbot.com пришло рекламное сообщение,
            // Тогда получаем ответ из локальной базы ответов
            if (ansMess.length < 2 || /(?:botlike\sfor\sme)|(?:clever)|(?:angry\sdude)|(?:real\sperson,\ssorry)/.test(ansMess.toLowerCase())) {
              return getFromLocalDB(message, answer => cb({
                message: answer,
                forward: isMultichat
              }));
            }

            // Ответ пришёл и он нормальный
            // Удаляем точку в конце предложения
            if (ansMess.endsWith('.'))
              ansMess = ansMess.slice(0, -1);

            // Отправляем ответ пользователю
            return cb({
              message: ansMess,
              forward: isMultichat,
              replaceUrls: true
            });
          })
          .catch(cleverErr => {
            // При парсинге ответа с cleverbot.com произошла ошибка. Обычно это 403 Forbidden Error.
            // Отдаём ответ из локальной базы ответов
            return getFromLocalDB(message, answer => cb({
              message: answer,
              forward: isMultichat
            }));
          });
      });
    }
  }
}
