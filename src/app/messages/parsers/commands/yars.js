'use strict';

/**
 * Module dependencies
 * @private
 */
const api_key  = require('../../../../config').api.yandex.speech_cloud;
const yars_plugin = require('../../../../../develop/modules/yandex_speech_recognition');
const request = require('request');
const crypto  = require('crypto');
const fs = require('fs');

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

  // Set api key
  yars_plugin.settings.api_key = api_key;

  if (argObj.attachments && argObj.attachments.fwd) {
    return VK.call('messages.getById', {
      message_ids: argObj.messageId,
      preview_length: 1
    }).then(response => {
      if (!response.count || response.items.length === 0) {
        return Promise.reject('Error in VKApi call');
      }

      let attachment = response.items[0].fwd_messages[0].attachments[0];
      let url = attachment[attachment.type].url;

      // Download file to temporary folder.
      let tmpdir = '/tmp/vkbot'; // @fixme: Set from config
      if (!fs.existsSync(tmpdir)) {
        fs.mkdirSync(tmpdir);
      }

      let tmpfile = tmpdir + '/' + crypto.createHash('md5').update(attachment[attachment.type].title + new Date().toString() + Math.random()).digest('hex');
      request(url).pipe(fs.createWriteStream(tmpfile)).on('finish', function() {
        yars_plugin.recognize(tmpfile).then((response) => {
          fs.unlink(tmpfile, function() {});
          if (response.errors === null) {
            callback(null, response.response);
          }
          else {
            callback(null, 'Произошла ошибка :(');
          }
        })
      });
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

  aliases:     ['что', 'речь', 'отекстуй'],
  description: 'Распознает аудио в текст. Для распознавания отправьте в ответ на голосовое сообщение команду /yars или .отекстуй',
  use: '/yars <голосовое сообщение в ответе>',

  run
}
