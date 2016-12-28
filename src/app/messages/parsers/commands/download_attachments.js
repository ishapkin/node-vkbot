'use strict';

/**
 * Module dependencies
 * @private
 */

/**
 * Local constants
 * @private
 */

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let firstWord = arg.firstWord;
  let argObj    = arg.source;
  let VK        = argObj._vkapi;

  let filename = firstWord ? String(firstWord).substr(0, 32) : null;
  if (argObj.attachments && argObj.attachments.fwd) {
    //let fwd_msg_ids = [argObj.attachments.fwd.split(',')[0].split('_')[1]]; // @fixme: Support multiple ids

    return VK.call('messages.getById', {
      message_ids: argObj.messageId,
      preview_length: 1
    }).then(response => {
      if (!response.count || response.items.length === 0) {
        return Promise.reject('Error in VKApi call');
      }

      let attachment = response.items[0].fwd_messages[0].attachments[0];
      let url = attachment[attachment.type].url;
      let title = filename ? filename + '.' + attachment[attachment.type].ext : attachment[attachment.type].title;

      return callback(null, title + ': ' + url); // @todo: Shortn url
    }).catch(error => {
      return callback(null, error);
    });
  }
  else {
    return callback(null, 'В сообщении нет прикрепленных сообщений с медиа.');
  }
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['качни', 'скачай', 'скачать', 'стяни', 'слей', 'мссылку', 'dlink'],
  description: 'Скачивает прикрепленные медиафайлы (выводит прямые ссылки)',
  use: '/dlink <голосовое сообщение в ответе>',

  run
}
