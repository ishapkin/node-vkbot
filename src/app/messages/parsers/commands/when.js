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
const VARIANTS = [
  'Не скажу', 
  'Не знаю', 
  'Никогда', 
  'Сегодня', 
  'Завтра', 
  'Скоро', 
  null, 
  'Через несколько дней', 
  'На этой неделе', 
  'На следующей неделе', 
  'Через две недели', 
  'В этом месяце', 
  'В следующем месяце', 
  'В начале следующего месяца', 
  'В этом году', 
  'В конце года', 
  'В следующем году'
];

/**
 * Возвращает рандомную дату
 * @private
 */
function randomDate () {
  let min = (new Date()).getTime();
  let max = (new Date(2030, 0, 1)).getTime();

  return (new Date(min + Math.random() * (max - min))).toLocaleDateString('ru');
}

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  // Нет ни текста, ни фото к команде. Ничего не отвечаем
  if (arg.isNull) 
    return callback(null);

  let date = randomElem(VARIANTS);

  // Получаем рандомную дату, если date === null
  if (date === null) 
    date = `Это произойдет ${randomDate()}`;

  return callback(null, date);
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['когда'], 
  description: 'Определяет, когда произойдет событие.', 
  use: '/when <событие>', 

  run
}