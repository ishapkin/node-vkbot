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
const MAX_COUNT = 30;

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let redis   = redisDb.getRedis();

  return redis.smembers('commands:vjuh:phrasecache').then(function(reply) {
    let message = '';
    if (reply === null) {
      message = 'Вжухов нет';
    }
    else {
      message = 'Вжухов в базе: ' + String(reply.length) + "\n";
      message += String(reply.slice(0, MAX_COUNT-1).join("\n")).substr(0, 1000);
    }

    return Promise.resolve({
      error_message: null,
      answer: message
    });

  }).then(response => {

    return callback(response.error_message, response.answer);
  }).catch(error => {

    return callback(error, "Произошла ошибка");
  });
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 4,

  aliases:     ['вжухи'],
  description: `Покажет список всех вжухов (максимум ${MAX_COUNT})`,
  use: '/vjuhs',

  run
}
