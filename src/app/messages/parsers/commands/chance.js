'use strict';

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  // Не указано никакого текста, поэтому и отвечать не на что
  if (arg.fullText === null) 
    return callback(null);

  // Возвращаем случайно-генерируемую вероятность
  return callback(null, `Вероятность -- ${Math.floor(Math.random() * 101)}%`);
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['шанс', 'инфа', 'вероятность'], 
  description: 'Определяет вероятность события.', 
  use: '/chance <текст>', 

  run
}