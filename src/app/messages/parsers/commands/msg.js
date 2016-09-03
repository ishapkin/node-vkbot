'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let VK      = arg.source._vkapi;
  let argText = arg.fullText;

  // Запрос не указан. Ничего не отправляем
  if (argText === null) 
    return callback(null);

  return VK.call('messages.search', {
      // Поисковый запрос
      q: argText, 

      // По умолчанию, ищем 20 сообщений
      count: 20, 

      // == 1 для того, чтобы не искать только что отправленное сообщение
      offset: 1
    })
    // Обрабатываем ответ
    .then(response => {
      if (response.items.length === 0) 
        return callback(null, 'По вашему запросу ничего не найдено.');

      return callback(null, {
        message: 'Результаты по вашему запросу', 
        forward_messages: response.items.map(v => v.id)
      });
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.'));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 4, 

  aliases:     [], 
  description: 'Ищет и пересылает сообщение из диалогов бота по указанному запросу. \nЕсли запрос не указан, возвращает рандомное сообщение.', 
  use: '/msg <запрос>', 

  run
}