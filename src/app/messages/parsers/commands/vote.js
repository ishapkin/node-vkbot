'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText = arg.fullText;
  let chatId  = arg.source.chatId;

  // Не указаны аргументы
  if (argText === null) 
    return callback(null);

  let _args    = argText.split('@');
  let question = _args[0].trim();
  let answers  = _args[1] && _args[1].trim().split(' ');

  if (_args.length < 2) 
    return callback(null, 'Вопрос и ответы должны быть разделены символом @.');

  if (answers.length < 2) 
    return callback(null, 'Укажите как минимум 2 варианта ответа.');

  // Включаем режим голосования для данного чата
  this.Messages.setChatMode(chatId, 'vote');

  // Сохраним голоса во временной переменной
  this.Messages._conversations[chatId]._votes = {};

  // Голосование длится ровно две минуты
  setTimeout(() => {
    let results = this.Messages._conversations[chatId]._votes;

    let message    = '';
    let votes      = [];
    let indanswers = [];
    let votesCount = 0;

    // Обрабатываем результаты голосования
    for (let i = 0, keys = Object.keys(results), len = keys.length; i < len; i++) {
      let current = results[keys[i]];

      votes[current - 1] = (votes[current - 1] || 0) + 1;
      votesCount += 1;
    }

    // Собираем массив ответов с количеством голосов
    for (let i = 0, len = answers.length; i < len; i++) 
      indanswers.push([votes[i] || 0, answers[i]]);

    // Сортируем голоса по убыванию
    indanswers = indanswers.sort((a, b) => a[0] > b[0] && -1 || a[0] < b[0] && 1 || 0);

    // Собираем ответ для отправки
    message = indanswers.map((value, index) => `${(index + 1)}. ${value[1]} (${Math.round(value[0] * 100 / votesCount)}%)`).join('\n');

    // Помещаем сообщение в очередь
    this.Messages.Queue.enqueueTo(0, {
      chat_id: chatId, 
      message: 'Голосование завершено. Результаты: \n\n' + message
    }, chatId);

    // Возвращаем режим 'default'
    this.Messages.setChatMode(chatId, 'default');

    // Удаляем переменную _votes
    delete this.Messages._conversations[chatId]._votes;
  }, 1000 * 60 * 2);

  return callback(
    null, 
    question + '\n\n' + 
    answers.map((value, index) => `${(index + 1)}. ${value}`).join('\n') + '\n\n' + 
    'Чтобы проголосовать, отправьте в чат номер варианта.\n' + 
    'Голосование продлится ровно 2 минуты.\n\n' + 
    'Во время голосования бот не выполняет никаких команд.'
  );
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 3, 

  aliases:     ['голосование'], 
  description: 'Позволяет провести голосование прямо в беседе.', 
  use: '/vote <вопрос> @ <ответ_1> <ответ_2> [ответ_3] [ответ_4] [ответ_5]', 

  run
}