'use strict';

/**
 * Добавляет свойство permissionsMask
 *
 * Permissions mask:
 * 0 - простой юзер
 * 1 - пригласивший бота
 * 2 - создатель беседы
 * 3 - VIP
 * 4 - админ
 */

/**
 * Module dependencies
 * @private
 */
const admins = require('../../../data/admins');

/**
 * Middleware function
 * @param  {Object} messageObj Объект сообщения
 * @return {Object}            Добавляемое свойство
 * @public
 */
function middleware (messageObj) {
  // Получаем список VIP-пользователей для текущего бота
  const vips          = require('../../../data/vips/' + messageObj.botId);
  let permissionsMask = 0;
  let currentChatUser = messageObj.chatUsers && messageObj.chatUsers[messageObj.fromId];

  if (currentChatUser) {
    // Пригласивший бота
    if (currentChatUser.botInviter) 
      permissionsMask = 1;

    // Создатель беседы
    if (currentChatUser.chatAdmin) 
      permissionsMask = 2;
  }

  // VIP-пользователь
  if (~vips.indexOf(messageObj.fromId)) 
    permissionsMask = 3;

  // Администратор
  if (~admins.indexOf(messageObj.fromId)) 
    permissionsMask = 4;

  return {
    permissionsMask
  }
}

module.exports = middleware;