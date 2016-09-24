'use strict';

/**
 * Парсер будет применен в том случае, когда боту были переведены деньги.
 */

/**
 * Module dependencies
 * @private
 */
const fs          = require('fs');
const debug       = require('../../../lib/simple-debug')(__filename);
const makeUserVip = require('../../../data/methods/make-user-vip');

/**
 * Local constants
 * @private
 */
const SUCCESS_MESSAGE = 'Спасибо за пожертвование!\n\nВам стали доступны функции VIP-пользователя.';
const ERROR_MESSAGE   = 'Спасибо за пожертвование!\n\nДля получения функций VIP-пользователя напишите в сообщения нашего паблика (vk.com/botsforchats).';

/**
 * Parser function
 * @param  {Object} messageObj Объект сообщения
 * @return {Object}            { cond, fn }
 * @public
 */
function parser (messageObj) {
  let attachments = messageObj.attachments;

  return {
    cond: attachments.attach1_type === 'money_transfer', 
    fn: function (callback) {
      // <from_id>_<to_id>:<???>
      let attach   = attachments.attach1;
      let amount   = attachments.attach1_amount;
      let currency = attachments.attach1_currency;

      let botId  = messageObj.botId;
      let userId = messageObj.fromId;

      // Даём пользователю VIP-ку
      makeUserVip({
        userId, 
        botId
      }, function (isUserVip) {
        // <is_vip> <date> - <user_id>-<bot_id>:<amount><currency>
        let lineToLog = (isUserVip ? '[+]' : '[-]') + ` ${(new Date()).toLocaleString('ru')} - ${userId}-${botId}:${amount}${currency}\n`;

        // Логгируем информацию о переводе
        fs.writeFile('./logs/money-transfers.txt', lineToLog, { flag: 'a' }. function (error) {
          if (error) 
            debug.err(lineToLog);

          return callback(isUserVip ? SUCCESS_MESSAGE : ERROR_MESSAGE);
        });
      });
    }
  }
}

module.exports = parser;