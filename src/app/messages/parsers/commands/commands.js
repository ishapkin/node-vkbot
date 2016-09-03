'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let cmdList  = this._commands; // this = Application
  let convType = arg.source.isMultichat ? 'mchat' : 'pm';
  let perMask  = arg.source.permissionsMask;

  let availableCommands = [];

  // Собираем список команд
  for (let i = 0, len = cmdList.length; i < len; i++) {
    let current = cmdList[i];

    // На лету фильтруем команды (оставляем только доступные текущему пользователю)
    if ((!current.unique || current.unique === convType) && perMask >= current.mask)
      availableCommands.push(current.command);
  }

  return callback(
    null, 
    'Список доступных Вам команд.\n\n' + 
    `/${availableCommands.join('\n/')}\n\n` + 
    'Чтобы получить помощь по определенной команде, напишите в чат: <<команда /?>>. ' + 
    `Например: /${availableCommands[0]} /?`
  );
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['команды'], 
  description: 'Выводит список всех команд, которые доступны запросившему пользователю.', 
  use: '/commands', 

  run
}