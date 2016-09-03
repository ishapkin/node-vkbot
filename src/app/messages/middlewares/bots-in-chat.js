'use strict';

/**
 * Добавляет свойство botsInChat, в котором содержатся ID ботов, известных на данный момент.
 * Свойство !== null в том случае, если в чате >= 2 ботов, помимо данного нашего бота, или
 * если в чате присутствует ещё один наш бот (или более).
 *
 * Вернёт { botsInChat: true }, если в беседе есть ещё как минимум один НАШ бот.
 * 
 * [*] Только для бесед.
 */

/**
 * Module dependencies
 * @private
 */
const botIds       = require('../../../data/bots');
const accounts     = require('../../../accounts');
const accountsKeys = Object.keys(accounts);

module.exports = messageObj => {
  let chatUsersIds = Object.keys(messageObj.chatUsers || {});
  let botId = messageObj.botId + ''; // Приводим ID бота к строке для точного сравнения
  let botsInChat = null;

  if (messageObj.isMultichat && chatUsersIds.length > 0) {
    let newArray = botIds.concat(chatUsersIds).sort();
    let matches = [];

    let newArray2 = accountsKeys.filter(v => v !== botId).concat(chatUsersIds).sort();

    for (let i = 0, len = newArray2.length; i < len; i++) {
      if (newArray2[i + 1] !== undefined) {
        if (newArray2[i] === newArray2[i + 1]) 
          return {
            botsInChat: true
          }
      }
    }

    for (let i = 0, len = newArray.length; i < len; i++) {
      if (newArray[i + 1] !== undefined) {
        if (newArray[i] === newArray[i + 1]) 
          matches.push(newArray[i]);
      }
    }

    if (matches.length >= 2) 
      botsInChat = matches;
  }

  return {
    botsInChat
  }
}