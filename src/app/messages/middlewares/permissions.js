'use strict';

/**
 * Добавляет свойство permissionsMask
 *
 * Permissions mask:
 * 0 - простой юзер
 * 1 - пригласивший бота
 * 2 - создатель беседы
 * 3 - вип
 * 4 - админ
 */

/**
 * Module dependencies
 * @private
 */
const admins = require('../../../data/admins');
const vips   = require('../../../data/vips');

module.exports = messageObj => {
  let permissionsMask = 0;

  if (messageObj.chatUsers && messageObj.chatUsers[messageObj.fromId]) {
    let currentChatUser = messageObj.chatUsers[messageObj.fromId];

    if (currentChatUser.botInviter) 
      permissionsMask = 1;

    if (currentChatUser.chatAdmin) 
      permissionsMask = 2;
  }

  if (vips[messageObj.botId] && (vips[messageObj.botId] === true || ~vips[messageObj.botId].indexOf(messageObj.fromId))) 
    permissionsMask = 3;

  if (~admins.indexOf(messageObj.fromId)) 
    permissionsMask = 4;

  return {
    permissionsMask
  }
}