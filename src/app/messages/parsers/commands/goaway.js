'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argObj = arg.source;
  let VK     = argObj._vkapi;

  // VIP и ниже не может кикнуть бота из беседы, если он не является её админом или пригласившим бота
  if (argObj.permissionsMask <= 3 && !(argObj.chatUsers[argObj.fromId].botInviter || argObj.chatUsers[argObj.fromId].chatAdmin)) 
    return callback(null);

  // Выходим из беседы
  return VK.call('messages.removeChatUser', {
      chat_id: argObj.chatId, 
      user_id: argObj.botId 
    })
    .then(() => {
      // Присваиваем null, т.к. бот вышел сам. 
      // this = Application
      this.Messages.__state.chatUsers[argObj.chatId] = null;

      // Ничего не отправляем
      return callback(null);
    })
    // Обрабатываем возникающие ошибки
    .catch(() => callback(null));
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 1, 

  aliases:     ['выйди'], 
  description: 'По этой команде бот сам выходит из чата.', 
  use: '/goaway', 

  run
}