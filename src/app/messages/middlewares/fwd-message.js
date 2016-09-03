'use strict';

/**
 * Добавляет свойство fwdMessage, которое содержит последнее пересланное 
 * сообщение из цепочки. (т.е. то сообщение, текст которого виден)
 *
 * [*] Только для текстовых персональных сообщений.
 */

module.exports = messageObj => {
  let attach = messageObj.attachments;
  let msg    = null;

  if (!messageObj.isMultichat && attach.fwd) {
    if (!~attach.fwd.indexOf(':')) {
      // Пересланное сообщение только одно, возвращаем его
      msg = attach[`fwd${attach.fwd}`];
    } else {
      // Пересланных сообщений несколько, возвращаем последнее (т.е. самое новое)
      let fwd = attach.fwd.split(':')[0];
      
      msg = attach[`fwd${fwd}`];
    }
  }

  if (!msg || msg.length === 0) 
    msg = null;

  return {
    fwdMessage: msg
  }
}