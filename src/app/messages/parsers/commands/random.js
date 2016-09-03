'use strict';

/**
 * Local constants
 * @private
 */
const RAND_DEFAULT = [0, 100];

/**
 * Возвращает случайное число из диапазона
 * @param  {Array} arrFromTo  [from, to]
 * @return {Number}
 * @private
 */
function randomInteger (arrFromTo) {
  let min = parseInt(arrFromTo[0]);
  let max = parseInt(arrFromTo[1]);

  return Math.floor(min + Math.random() * (max + 1 - min));
}

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argFirst = arg.firstWord;
  let fromTo   = [];

  if (argFirst === null) 
    fromTo = RAND_DEFAULT;
  else {
    if (~argFirst.indexOf('-')) 
      fromTo = argFirst.split('-');
    else 
      fromTo = [0, argFirst];
  }

  // Проверяем, числа ли переданы
  for (let i = 0, len = fromTo.length; i < len; i++) {
    if (isNaN(parseInt(fromTo[i]))) 
      fromTo[i] = RAND_DEFAULT[i];
  }

  return callback(null, `Случайное число: ${randomInteger(fromTo)}`);
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['roll'], 
  description: 'Вернёт случайное число из указанного диапазона.', 
  use: '/random [диапазон]', 

  run
}