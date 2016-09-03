'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let cmdList  = this._commands; // this = Application
  let gCommand = null;
  let argText  = arg.fullText;

  // Нет запроса, ничего не делаем
  if (argText === null) 
    return callback(null);

  // Изменяем текст сообщения. 
  // По сути, говорим гуглу, что искать нужно только на википедии
  arg.message = 'site:ru.wikipedia.org ' + argText;

  // Пробегаемся по списку команд и находим команду "g"
  for (let i = 0, len = cmdList.length; i < len; i++) {
    let current = cmdList[i];

    if (cmdList[i].command === 'g') {
      gCommand = cmdList[i];
      break;
    }
  }

  // Запускаем команду "g" для поиска в гугле
  return gCommand.run.call(this, arg, callback);
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['вики', 'википедия'], 
  description: 'Ищет в Википедии.', 
  use: '/wiki <запрос>', 

  run
}