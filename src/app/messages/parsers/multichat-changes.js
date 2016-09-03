'use strict';

/**
 * Парсер будет применен в том случае, когда бот был приглашен в беседу 
 * или когда беседа была только что создана вместе с ботом. 
 * Бот отправляет сообщение-приветствие.
 */

/**
 * Local constatns
 * @private
 */
const MESSAGE = `Привет! 

Я -- чат-бот от паблика << vk.com/botsforchats >>. 
Умею общаться и выполнять команды.

Чтобы получить помощь, напишите в чат <</помощь>> (или <</help>>).`;

module.exports = function (messageObj) {
  return {
    cond: (messageObj.attachments.source_act === 'chat_invite_user' && parseInt(messageObj.attachments.source_mid) === messageObj.botId) || messageObj.attachments.source_act === 'chat_create', 
    fn: cb => cb(MESSAGE)
  }
}