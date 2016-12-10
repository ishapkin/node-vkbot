'use strict';

/**
 * Module dependencies.
 * @private
 */
const accessToken = require('../../config')['vk-group'].token;
const admins      = require('../../data/admins');
const debug       = require('../../lib/simple-debug');
const fs          = require('fs');
const path        = require('path');
const VKApi       = require('node-vkapi');

function sendMessage (message, user_id) {
  let api = new VKApi({
    token: accessToken
  });

  api.call('messages.send', { message, user_id })
    .then(response => null)
    .catch(error => null);
}

/**
 * New community message processor
 * @param {Object}   messageObject
 * @param {Function} callback
 * @public
 */
function processMessage (messageObject = {}) {
  let fromId  = messageObject.user_id;
  let message = messageObject.body;

  // Сообщение прислал не админ либо сообщение не начинается со слеша
  if (!admins.includes(fromId) || !message.startsWith('/')) 
    return;

  let _wordsArray = message.split(' ');
  let command     = _wordsArray[0].substr(1).toLowerCase();
  let secondWord  = _wordsArray[1];

  // Получим список файлов в ../commands и проверим на наличие указанной команды
  fs.readdir(path.join(__dirname, '../commands'), function (error, results) {
    if (!results.includes(command + '.js')) 
      return sendMessage('Такой команды не существует.', fromId);

    let cmdToUse = require('../commands/' + command);

    // Выведем помощь по команде, если первый аргумент === "/?"
    if (secondWord === '/?') 
      return sendMessage(cmdToUse.use, fromId);

    // Запускаем команду
    cmdToUse.run(_wordsArray.slice(1), function (error, result) {
      if (error === null && !result) 
        return;

      // Логгируем ошибки
      if (error) 
        debug.err(error);

      // Нечего отправлять в ответ
      if (!result) 
        return;

      // Отправляем сообщение
      sendMessage(result, fromId);
    });
  });
}

module.exports = processMessage;