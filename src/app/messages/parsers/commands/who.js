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
const VARIANTS = {
  answerWords: [
    'Я думаю, это %username%', 
    'Определенно, это %username%', 
    'Несомненно, это %username%', 
    'Мне кажется, что это %username%', 
    'По-моему, это %username%', 
    'Скорее всего, это %username%', 
    'Все знают, что это %username%', 
    'Это %username%, без сомнений.', 
    '%username%. Кто ж ещё!', 
    'Кто-кто.. Ты!'
  ], 

  noUsersAnswers: [
    'Не скажу.', 
    'Не хочу говорить.', 
    'У меня нет настроения тебе отвечать.', 
    'Я не хочу тебе отвечать :p'
  ]
};

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText   = arg.fullText;
  let botId     = arg.source.botId;
  let chatUsers = arg.source.chatUsers;
  let returnAnswer;

  // Текста к команде нет, поэтому и вызывать её смысла тоже нет
  if (argText === null) 
    return callback(null);

  if (chatUsers) {
    // Убираем бота из списка
    delete chatUsers[botId];

    let randomUserName = chatUsers[randomElem(Object.keys(chatUsers))].firstName;

    returnAnswer = randomElem(VARIANTS.answerWords).replace(/%username%/, randomUserName);
  } else {
    returnAnswer = randomElem(VARIANTS.noUsersAnswers);
  }

  return callback(null, returnAnswer);
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 0, 

  aliases:     ['кто'], 
  description: 'Вернёт случайного пользователя из списка участников беседы.', 
  use: '/who <текст>', 

  run
}