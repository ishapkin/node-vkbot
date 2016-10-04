'use strict';

/**
 * Module dependencies
 * @private
 */
const fs = require('fs');

/**
 * Выдаёт пользователю userId VIP-ку
 * @param  {Number} userId ID пользователя
 * @param  {Number} botId  ID бота
 * @return {Boolean}
 * @public
 */
function maker ({ userId, botId }, callback) {
  const vips = require('../../data/vips/' + botId);

  // Пользователь уже VIP
  if (~vips.indexOf(userId)) 
    return callback(true);

  // Даём VIP-ку
  vips.push(userId);

  // Сохраняем обновлённый список VIP-ов
  fs.writeFile('./data/vips/' + botId + '.json', JSON.stringify(vips), function (error) {
    if (error) 
      return callback(false);

    return callback(true);
  });
}

module.exports = maker;