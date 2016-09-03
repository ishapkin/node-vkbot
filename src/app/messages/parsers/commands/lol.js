'use strict';

/**
 * Local constants
 * @private
 */
const LOL_WORD  = 'АЗХ';
const MAX_COUNT = 99;
const DEF_COUNT = 5;

/**
 * Определяет количество повторений
 * @param  {String} count arg.firstWord
 * @return {Number}
 * @private
 */
function getCount (count) {
  let cnt = parseInt(count) || DEF_COUNT;

  if (cnt > MAX_COUNT) 
    cnt = MAX_COUNT;

  return cnt;
}

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let count  = getCount(arg.firstWord);
  let result = LOL_WORD.repeat(count);

  return callback(null, result);
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['лол'], 
  description: 'Генерирует смех определенной длины из символов АЗХ.', 
  use: '/lol [кол-во]', 

  run
}