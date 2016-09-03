'use strict';

/**
 * Парсер будет применен в том случае, когда боту прислали подарок. 
 * Пользователю, приславшему подарок, будет отправлено благодарственное сообщение.
 */

module.exports = function (messageObj) {
  return {
    cond: messageObj.attachments.attach1_type === 'gift', 
    fn: cb => cb('Спасибо за подарок, дружище! :-) :-*')
  }
}