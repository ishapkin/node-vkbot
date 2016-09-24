'use strict';

/**
 * Определяет, является ли пользователь админом/модером/випом 
 * и возвращает permissionsMask
 */

/**
 * Module dependencies
 * @private
 */
const admins = require('../../../../data/admins');

module.exports = function (userId, botId) {
  const vips          = require('../../../../data/vips/' + botId);
  let permissionsMask = 0;

  if (~vips.indexOf(userId)) 
    permissionsMask = 3;

  if (~admins.indexOf(userId)) 
    permissionsMask = 4;

  return permissionsMask;
}