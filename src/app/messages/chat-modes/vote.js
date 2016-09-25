'use strict';

/**
 * Режим голосования для бесед. 
 *
 * Игнорируем абсолютно все команды и обращения к боту. 
 * Записываем присланные варианты ответов в Messages._conversations[chat_id]._votes.
 */

/**
 * Process messages for vote mode
 * @param  {Object} messageObject Объект сообщения
 * @public
 *
 * Функции передаётся контекст (this) класса Messages (../Messages.js)
 */
function processor ({ chatId, fromId, message }) {
  // Берём первый символ сообщения
  let num = message.slice(0, 1);

  // Если это цифра от 1 до 5, то считаем её за вариант ответа
  if (/[1-5]/.test(num)) 
    this._conversations[chatId]._votes[fromId] = num;
}

module.exports = processor;