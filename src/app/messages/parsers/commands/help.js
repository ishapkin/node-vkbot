'use strict';

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['помощь'], 
  description: 'Выводит помощь по использованию бота.', 
  use: '/help', 

  /**
   * Run command
   * @param  {Arguments}  arg
   * @param  {Function}   callback
   * @public
   */
  run: function (arg, callback) {
    return callback(
      null, 
      'Список всех команд с описанием:\nvk.com/page-110327182_51316051\n\n' + 
      'Список всех ботов:\nvk.com/page-110327182_51827848\n\n' + 
      'Правила использования:\nvk.com/page-110327182_52141351\n\n' + 
      'Частозадаемые вопросы:\nvk.com/page-110327182_51827803\n\n' + 

      'Чтобы получить список доступных вам команд, напишите в чат <</команды>> (без кавычек).\n\n' + 
      'По всем возникающим вопросам можно писать в сообщения паблика (vk.com/botsforchats).'
    );
  }
}