'use strict';

/**
 * Module dependencies
 * @private
 */
const parseId            = require('./include/parse-id');
const getPermissionsMask = require('../helpers/get-permissions-mask');

/**
 * Process command
 * @param  {String}     act
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function processCommand (act, arg, callback) {
  let argObj = arg.source;
  let VK     = argObj._vkapi;
  let userId = parseId(arg.firstWord);
  let actPrf = act === 'ban' ? 'за' : 'раз';

  // ID пользователя не указан или имеет неверный формат
  if (userId === null) 
    return callback(null);

  // Получаем ID пользователя по его никнейму
  return VK.call('utils.resolveScreenName', {
      screen_name: userId
    })
    // Обрабатываем ответ
    .then(response => {
      if (Array.isArray(response) || response.type !== 'user') 
        throw callback(null, `Данного пользователя не существует.`);

      let user_id         = parseInt(response.object_id);
      let permissionsMask = getPermissionsMask(user_id, argObj.botId);

      // Нижестоящий пользователь не сможет забанить вышестоящего
      if (permissionsMask >= argObj.permissionsMask) 
        throw callback(null, `Нельзя ${actPrf}блокировать пользователя с правами равными либо больше ваших.`);

      // Попытки внести бота в чёрный список бота?
      if (argObj.botId === user_id) 
        throw callback(null, 'Нет, меня заблокировать не удастся. :-)');

      return user_id;
    })
    // Блокируем пользователя
    .then(uid => {
      return VK.call(`account.${act}User`, {
        user_id: uid
      });
    })
    // После успешной блокировке сообщаем об этом
    .then(banned => callback(null, `Пользователь ${actPrf}блокирован.`))
    // Обрабатываем возникающие ошибки
    .catch(error => {
      if (error !== undefined) {
        // Access denied: юзера уже нет в ЧС/либо юзер уже есть в ЧС
        if (error.name === 'VKApiError' && error.code === 15) 
          return callback(null, `Пользователь уже был ${actPrf}блокирован ранее.`);

        return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
      }
    });
}

module.exports = processCommand;