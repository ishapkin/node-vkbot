'use strict';

/**
 * Module dependencies
 * @private
 */
const randomElem = require('./helpers/random-elem');

/**
 * Local constants
 * @private
 */
const ONLINE_FLAGS = ['-online', '-on', '-онлайн'];

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argObj         = arg.source;
  let VK             = argObj._vkapi;
  let chatUsers      = argObj.chatUsers;
  let userId         = arg.firstWord;
  let needToBeOnline = false;

  // Беседа переполнена
  if (chatUsers && chatUsers.length === 50) 
    return callback(null);

  // Первый аргумент указывает на то, что нужно приглашать только онлайн-юзеров
  if (~ONLINE_FLAGS.indexOf(userId)) {
    userId = null;
    needToBeOnline = true;
  }

  // ID содержит только цифры
  if (/^\d+$/.test(userId)) {
    // Юзер уже состоит в беседе
    if (~Object.keys(chatUsers).indexOf(userId)) 
      return callback(null);

    userId = 'id' + userId;
  }

  // ID пользователя не указан, либо был указан параметр "-online"
  if (userId === null) 
    // Получаем 500 случайных друзей
    return VK.call('friends.get', {
      order: 'random', 
      count: 500, 
      fields: 'online'
    })
    // Обрабатываем ответ
    .then(response => {
      let friends = [];

      for (let i = 0, len = response.items.length; i < len; i++) {
        let current = response.items[i];

        // Убедимся в том, что пользователя нет в беседе и его статус соответствует желаемому
        if (!~Object.keys(chatUsers).indexOf(current.id.toString()) && current.online >= +needToBeOnline) 
          friends.push(current.id);
      }

      // Не нашлось ни одного подходящего пользователя
      if (friends.length === 0) 
        throw callback(null, 'Не удалось найти подходящего пользователя. Повторите запрос позже.');

      // Добавляем пользователя в беседу
      return VK.call('messages.addChatUser', {
        chat_id: argObj.chatId, 
        user_id: randomElem(friends)
      });
    })
    // При успешном добавлении ничего не отвечаем
    .then(() => callback(null))
    // Обрабатываем возникающие ошибки
    .catch(error => {
      if (error !== undefined) {
        return callback(null, 'Произошла неизвестная ошибка. Повторите запрос позже.');
      }
    });

  // Добавляем в беседу по ID пользователя
  return VK.call('execute.inviteById', {
    chat_id: argObj.chatId, 
    user_id: userId
  })
  // При успешном добавлении ничего не отвечаем
  .then(() => callback(null))
  // Обрабатываем возникающие ошибки
  .catch(error => callback(null, 'Не удалось добавить пользователя в беседу, так как:\n1. Он уже состоит в ней.\n2. Он не является другом бота.'));
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 3, 

  aliases:     ['пригласи'], 
  description: 'Приглашает в беседу рандомного друга бота.', 
  use: `/invite [user_id | ${ONLINE_FLAGS.join(' | ')}]`, 

  run
}