'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argObj    = arg.source;
  let VK        = argObj._vkapi;
  let chatUsers = argObj.chatUsers;

  // Список участников беседы не может быть пуст
  if (!chatUsers) 
    return callback(null);

  let usersToKick = [];
  let isBotAdmin  = chatUsers[argObj.botId].chatAdmin;

  // Отбираем тех, кого будем кикать
  for (let key in chatUsers) {
    let userId = parseInt(key);

    // Будем кикать не более 25-ти пользователей за раз
    if (usersToKick.length === 25) 
      break;

    // Вызывающего команду админа и самого бота кикать не будем
    if (userId === argObj.fromId || userId === argObj.botId) 
      continue;

    // Если бот является админом чата, то кикнуть он может любого
    if (isBotAdmin) {
      usersToKick.push(userId);
      continue;
    }

    // Если бот не является админом чата, то кикнуть 
    // он может только тех, кого пригласил сам
    if (chatUsers[userId].invitedByBot) 
      usersToKick.push(userId);
  }

  // Боту некого кикать. Ничего не делаем в таком случае
  if (usersToKick.length === 0) 
    return callback(null);

  // Вызываем execute-команду, которая кикнет указанных пользователей
  return VK.call('execute.kickByIds', {
      chat_id: argObj.chatId, 
      user_ids: usersToKick.join(',')
    })
    // При получении ответа ничего не отвечаем
    .then(response => callback(null))
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error));
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 4, 

  aliases:     [], 
  description: 'Кикает всех пользователей, которых пригласил сам бот. \n\n* Команда только для админов.', 
  use: '/kickall', 

  run
}