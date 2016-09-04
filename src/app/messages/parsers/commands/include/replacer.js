'use strict';

/**
 * Module dependencies
 * @private
 */
const words   = require('../../../../../data/restricted');
const checker = require('./checker');

/**
 * Local constants
 * @private
 */
const REPLACES = {
  // EN -> RU
  'a': 'а', 
  'c': 'с', 
  'e': 'е', 
  'o': 'о', 
  'p': 'р', 
  'x': 'х', 

  // RU -> EN
  'а': 'a', 
  'е': 'e', 
  'о': 'o', 
  'р': 'p', 
  'с': 'c', 
  'х': 'x'
};

// Регулярка, которая матчит самые популярные домены (и не только)
const REGEXP = /\.(?:[a-gik-pr-uwxмор][ac-gi-su-yоруф][a-gk-mr-tvxzгс]?[acehiosuvк]?[einoyв]?[etwа]?e?)/gmi;

// Запрещённые слова
const STOPREGEXP = new RegExp(Object.keys(words).join('|'), 'gmi');

/**
 * Удаляет ссылки и запрещённые слова из сообщения
 * @param  {String} message
 * @return {String} Обработанное сообщение
 * @public
 */
function replacer (message) {
  // Очищаем сообщение от ссылок
  let cleanMessage  = message.replace(REGEXP, match => `.${'*'.repeat(match.length - 1)}`);

  // В случайном порядке заменяем похожие русские буквы английскими и наоборот
  cleanMessage      = cleanMessage.replace(/.{1}/gmi, letter => {
    // Рандом решил, что букву менять не будем
    if (Math.random() < 0.5) 
      return letter;

    // Приведём букву к нижнему регистру
    let letterLowercased = letter.toLowerCase();

    // Похожая буква есть
    if (REPLACES[letterLowercased] !== undefined) {
      // Выясним, в каком регистре буква
      let isLetterLowercased = letter === letterLowercased;

      // Вернём "иностранного клона"
      return isLetterLowercased ? REPLACES[letterLowercased] : REPLACES[letterLowercased].toUpperCase();
    }

    // Похожей буквы нет, поэтому вернём то, что и было
    return letter;
  });

  // Заменяем запрещённые слова, если они есть
  if (STOPREGEXP.test(cleanMessage)) 
    cleanMessage = cleanMessage.replace(STOPREGEXP, match => words[match]);

  // Последняя проверочка
  if (checker(cleanMessage)) 
    cleanMessage = 'Пожалуйста, не используйте запрещённые слова при общении с ботом.';

  return cleanMessage;
}

module.exports = replacer;