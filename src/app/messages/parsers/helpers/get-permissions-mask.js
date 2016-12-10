'use strict';

/**
 * Определяет, является ли пользователь админом/модером/випом 
 * и возвращает permissionsMask.
 *
 * Функции передаётся контекст (this) класса Bot (./bot/Bot.js)
 */

/**
 * Module dependencies
 * @private
 */
const admins = require('../../../../data/admins');

module.exports = function (userId, botId) {
  // Получаем данные о VIP-статусах для текущего юзера
  const userVipData = this.parent._databases['users'].data[userId];

  let permissionsMask = 0;

  // VIP-пользователь
  if (userVipData === 'all' || Array.isArray(userVipData) && userVipData.includes(messageObj.botId)) 
    permissionsMask = 3;

  // Администратор
  if (~admins.indexOf(userId)) 
    permissionsMask = 4;

  return permissionsMask;
}