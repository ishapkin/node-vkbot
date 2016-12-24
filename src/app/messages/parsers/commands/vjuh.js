'use strict';

/**
 * Module dependencies
 * @private
 */
const prequest = require('request-promise');
const redisDb     = require('../../helpers/redis');

/**
 * Local constants
 * @private
 */
const SERVICE_URL = 'http://risovach.ru/generator/vzhuh_1715393';

const MAX_LENGTH = 60;

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText = arg.fullText;
  let argObj  = arg.source;
  let VK      = argObj._vkapi;
  let redis   = redisDb.getRedis();

  // Static phrases are always here.
  let phrases = [
    'И ты не выспался',
    'И тебе не дала та симпатичная телка',
    'И ты заебался',
    'И ты обосрался',
    'И ты сыч'
  ];

  let phrase = argText ? argText.trim() : null;
  if (!argText) {
    redis.srandmember('commands:vjuh:phrasecache', function(err, reply) {
      if (reply === null) {
        let index = Math.round(Math.random() * (phrases.length - 1));
        phrase = phrases[index];

        // Cache once all static phrases
        for (var i=0; i<phrases.length; i++) {
          redis.sadd('commands:vjuh:phrasecache', phrases[i]);
        }
      }
      else {
        // We consider that phrase is trimmed and truncated already. No need additional processing.
        phrase = reply;
      }

      return sendAnswer(phrase);
    });
  }
  else {
    // Truncate phrase
    phrase = String(phrase).substr(0, MAX_LENGTH);

    // Cache phrase for future usage
    redis.sadd('commands:vjuh:phrasecache', phrase);

    return sendAnswer(phrase);
  }


  function sendAnswer(phrase) {
    redis.hget('commands:vjuh:phrase', phrase, function (err, reply) {
      let premise;
      // @fixme: Remove when convert string to binar buffer properly.
      if (true || reply === null) {
        premise = prequest.post(SERVICE_URL, {
          form: {
            zdata1: 'Вжух!!!',
            zdata2: phrase
          },
          encoding: null
        });
      }
      else {
        premise = new Promise(function (resolve, reject) {
          resolve(reply);
        });
      }

      premise.then(img_bytes => {
          if (reply === null) {
            redis.hset('commands:vjuh:phrase', phrase, img_bytes);
          }

          // let img_stream =  Buffer.from( img_bytes, 'binary' );

          return VK.upload('photo_pm', {
            // Данные для загрузки
            data: {
              value: img_bytes,
              options: {
                filename: `photo_${Date.now()}.jpg`,
                contentType: 'image/jpg'
              }
            }
          });
        })
        .then(response => {
          return callback(null, {
            attachments: 'photo' + response[0].owner_id + '_' + response[0].id
          });
        })
        // Обрабатываем возникающие ошибки
        .catch(error => {
          return callback(error, 'Произошла неизвестная ошибка :(');
        });
    });
  }
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['вжух', 'магия'],
  description: 'Предсказания кота-вжуха',
  use: '/vjuh [текст вжуха]',

  run
}
