'use strict';

/**
 * Local constants
 * @private
 */
const PHOTO_URL = 'photo-126103019_424522667'; // vk.com/photo-126103019_424522667

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText = arg.fullText;

  // Нет текста к команде, ничего не отправляем
  if (argText === null) 
    return callback(null);

  return callback(null, {
    message: 'Внимание, важная информация!', 
    attachments: PHOTO_URL
  });
}

module.exports = {
  enabled: true, 
  unique:  'mchat', 
  mask: 1, 

  aliases:     ['внимание'], 
  description: 'Перешлет ваше сообщение с особым форматированием (Внимание, важная информация).', 
  use: '/warn <текст>', 

  run
}