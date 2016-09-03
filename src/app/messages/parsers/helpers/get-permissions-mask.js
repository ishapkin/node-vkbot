'use strict';

/**
 * Определяет, является ли пользователь админом/модером/випом
 * И возвращает permissionsMask
 */

/**
 * Module dependencies
 * @private
 */
const admins = require('../../../../data/admins');
const vips   = require('../../../../data/vips');

module.exports = (userId, botId) => {
  let permissionsMask = 0;

  if (vips[botId] && (vips[botId] === true || ~vips[botId].indexOf(userId))) 
    permissionsMask = 3;

  if (~admins.indexOf(userId)) 
    permissionsMask = 4;

  return permissionsMask;
}