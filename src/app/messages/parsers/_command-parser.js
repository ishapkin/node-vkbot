'use strict';

/**
 * Парсер команд. Вынесен в отдельный файл для того, чтобы мог легко использоваться в
 * парсере обращений к боту.
 */

/**
 * Module dependencies
 * @private
 */
const path      = require('path');
const debug     = require('../../../lib/simple-debug')(__filename);
const Arguments = require('./helpers/arg-parser');

/**
 * Local constants.
 * @private
 */
const PRMS_LEVELS = [
  // 0: все юзеры
  null,

  // 1: пригласившие бота
  'Команда доступна тем, кто пожертвовал на развитие ботов, или является создателем беседы, или пригласил бота в беседу.',

  // 2: создатели бесед
  'Команда доступна тем, кто пожертвовал на развитие ботов, или является создателем беседы.',

  // 3: vip (пожертвовавшие)
  'Команда доступна тем, кто пожертвовал на развитие ботов.'
];

function commandParser (messageObj) {
  let self    = this; // this = Bot
  let message = messageObj.message;
  let cmdList = self._commands;

  return cb => {
    let args = new Arguments(messageObj);
    let cmd = message.split(' ')[0].substr(1).toLowerCase();
    let convType = messageObj.isMultichat ? 'mchat' : 'pm';
    let cmdToUse;

    // Пробегаемся по списку команд и вычисляем, существует ли вызванная команда.
    for (let i = 0, len = cmdList.length; i < len; i++) {
      let current = cmdList[i];

      // Проверяем, существует ли команда.
      if (current.command === cmd || ~current.aliases.indexOf(cmd)) {
        // Проверяем соответствие уникальности команды.
        if (!current.unique || current.unique === convType)
          cmdToUse = current;

        break;
      }
    }

    // Такой команды не существует или её нельзя использовать, ничего не делаем.
    if (!cmdToUse)
      return cb(null);

    // Объект, который будет возвращаться, если нужно вывести помощь по команде.
    let helpObject = {
      message: `${(cmdToUse.use || '')}\n\n${cmdToUse.description}${cmdToUse.aliases.length > 0 ? ('\n\nПсевдонимы команды: /' + cmdToUse.aliases.join(', /')) : ''}`.trim(),
      forward: messageObj.isMultichat
    };

    // Если первый аргумент === '/?', то выводим помощь по команде.
    if (args.firstWord === '/?' || args.firstWord === '.?')
      return cb(helpObject);

    // Недостаточно прав для использования команды.
    if (messageObj.permissionsMask < cmdToUse.mask) {
      return cb({
        message: 'Недостаточно прав для использования команды.\n\n' + PRMS_LEVELS[cmdToUse.mask],
        forward: messageObj.isMultichat
      });
    }

    // Запускаем команду.
    // Передаём ей контекст приложения (Application class).
    return cmdToUse.run.call(self, args, (error, result) => {
      // При выполнении команды возникла некритичная ошибка.
      if (error === null && !result)
        return cb(null);

      // При выполнении команды возникла критичная ошибка. Выводим её.
      if (error) {
        debug.err(`[/${cmdToUse.command}] Error was occured:`);
        debug.err(error);
      }

      // Нечего отправлять во ВКонтакте.
      if (!result)
        return cb(null);

      // "Достаём" сообщение, которое предстоит отправить.
      let messageToSend = typeof result === 'string' ? result : result.message;

      // Объект сообщения, который будет возвращён.
      let returnObject  = {
        message: messageToSend,
        attachments: result.attachments,
        forward_messages: result.forward_messages || null,
        forward: result.forward !== undefined ? result.forward : messageObj.isMultichat
      };

      // Указываем, в каких командах удалять ссылки
      if (~['hf', 'joke', 'who'].indexOf(cmdToUse.command))
        returnObject.replaceUrls = true;

      // Ошибок нет. Возвращаем результат работы.
      return cb(returnObject);
    });
  }
}

module.exports = commandParser;
