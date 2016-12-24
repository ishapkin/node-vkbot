'use strict';

/**
 * Local constants
 * @private
 */
const WEEKDAYS      = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MONTHS        = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const EMOJI_POSTFIX = '&#8419;'; // Постфикс для Emoji-смайлов (Пример: 4&#8419 - это цифра 4 смайлом).

/**
 * Форматирует значения секунд (или минут) в Emoji-like цифры
 * Пример: 1 минута --> 01 минута (Emoji)
 * @param  {Number/String} digits
 * @return {String}
 * @private
 */
function formatDate (digits) {
  let digitStr = digits.toString();

  if (digitStr.length === 1)
    digitStr = '0' + digitStr;

  // Конвертируем простые цифры в Emoji-цифры, добавляя Emoji-постфикс.
  digitStr = digitStr.replace(/(.{1})/g, `$1${EMOJI_POSTFIX}`);

  return digitStr;
}

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let now = new Date();

  // Adjust offset of time using UTC+offset.
  // @fixme: Set offset in config
  now.setHours(now.getUTCHours() + 3);

  let hours   = formatDate(now.getHours());
  let minutes = formatDate(now.getMinutes());
  let weekday = WEEKDAYS[now.getDay()];
  let day     = now.getDate();
  let month   = MONTHS[now.getMonth()];
  let year    = now.getFullYear();

  return callback(null, `${hours} : ${minutes} (МСК)\n${weekday}, ${day} ${month}, ${year} год`);
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['время', 'сейчас'],
  description: 'Присылает текущую дату и время.',
  use: '/now',

  run
}
