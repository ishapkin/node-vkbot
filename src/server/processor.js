'use strict';

/**
 * Module dependencies.
 * @private
 */
const messageProcessor = require('./processors/message');

/**
 * Callback API processor for object returned
 * @param {Object} dataObject
 * @public
 */
function processor (dataObject = {}) {
  let type = dataObject.type;

  // dataObject пуст
  if (!type) 
    return;

  // Обработчик нового сообщения
  if (type === 'message_new') 
    return messageProcessor(dataObject.object);
}

module.exports = processor;