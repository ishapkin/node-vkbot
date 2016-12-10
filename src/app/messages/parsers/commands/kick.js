'use strict';

/**
 * Module dependencies
 * @private
 */
const parseId            = require('./include/parse-id');
const getPermissionsMask = require('../helpers/get-permissions-mask');

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argObj    = arg.source;
  let VK        = argObj._vkapi;
  let userId    = parseId(arg.firstWord);
  let chatUsers = argObj.chatUsers;

  // Не указан (или неверно указан) ID пользователя
  // Либо список участников беседы пуст
  if (userId === null || !chatUsers) 
    return callback(null);

  // Получаем ID пользователя по его никнейму
  return VK.call('utils.resolveScreenName', {
      screen_name: userId
    })
    // Обрабатываем ответ от ВКонтакте
    .then(response => {
      if (Array.isArray(response) || response.type !== 'user') 
        throw callback(null, 'Данного пользователя не существует.');

      let user_id         = parseInt(response.object_id);
      let permissionsMask = getPermissionsMask.call(this, user_id, argObj.botId);

      // Этого пользователя нет в чате
      if (!chatUsers[user_id]) 
        throw callback(null, 'Данного пользователя нет в беседе, либо список участников ещё не обновился.');

      // Если бот не создатель беседы, то он сможет кикать только тех, кого он пригласил сам
      if (chatUsers[argObj.botId] && !chatUsers[argObj.botId].chatAdmin && !chatUsers[user_id].invitedByBot) 
        throw callback(null, 'К сожалению, я не создатель беседы. Поэтому я могу исключать из беседы только тех, кого я пригласил сам.');

      // Нижестоящий пользователь не сможет кикнуть вышестоящего
      if (
          permissionsMask > argObj.permissionsMask || 
          permissionsMask == argObj.permissionsMask && !(chatUsers[argObj.fromId] && (chatUsers[argObj.fromId].botInviter || chatUsers[argObj.fromId].chatAdmin))
        ) 
        throw callback(null, 'Нельзя исключить из беседы пользователя с правами равными либо больше ваших.');

      return user_id;
    })
    // Кикаем пользователя из чата
    .then(uid => {
      return VK.call('messages.removeChatUser', {
        chat_id: argObj.chatId, 
        user_id: uid
      });
    })
    // После успешного кика ничего не отвечаем
    .then(kicked => callback(null))
    // Обрабатываем возникающие ошибки
    .catch(error => {
      if (error !== undefined) {
        // Access denied: нельзя кикнуть этого юзера
        if (error.name === 'VKApiError' && error.code === 15) 
          return callback(null, 'К сожалению, я не могу исключить из беседы этого пользователя.');

        return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
      }
    });
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 3, 

  aliases:     [], 
  description: 'Кикает пользователя из чата.', 
  use: '/kick <user_id>', 

  run
}