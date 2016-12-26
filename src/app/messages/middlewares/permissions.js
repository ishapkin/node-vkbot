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
 *
 * Функции передаётся контекст (this) класса Bot (./bot/Bot.js)
 */
function middleware (messageObj) {
  // Получаем данные о VIP-статусах для текущего юзера
  const userVipData = this.parent._databases['users'].data[messageObj.fromId];

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
  if (userVipData === 'all' || Array.isArray(userVipData) && userVipData.includes(messageObj.botId))
    permissionsMask = 3;

  // Администратор
  if (~admins.indexOf(messageObj.fromId) || ~admins.indexOf(String(messageObj.fromId)))
    permissionsMask = 4;

  return {
    permissionsMask
  }
}

module.exports = middleware;
