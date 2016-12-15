'use strict';

/**
 * Module dependencies.
 * @private
 */
const pm2sender    = require('../../lib/pm2-sender');

/**
 * Run fn
 * @param  {Array}     args
 * @param  {Function}  callback
 * @public
 */
function run (args, callback) {
  // Отправим приложению запрос на получение данных
  pm2sender('app', {
    event:  'data_needed', 
    target: 'status'
  }, isSent => {
    if (isSent) {
      process.once('message', appStatusObject => {
        let dataObject = appStatusObject.data;

        return callback(null, dataObject.botsInfo);
      });

      return;
    }

    return callback(null, 'Произошла ошибка при попытке связаться с приложением.');
  });
}

module.exports = {
  use: '/status', 
  run
}