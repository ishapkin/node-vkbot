'use strict';

/**
 * Запуск pm2-демона и добавление процессов в него
 */

/**
 * Module dependencies
 * @private
 */
const pm2   = require('pm2');
const async = require('async');

/**
 * pm2.start() wrapper
 * @param  {Array} arrOfStartOpts
 * @return {Array}
 * @private
 */
function startWrapper (arrOfStartOpts) {
  return arrOfStartOpts.map(value => (callback => pm2.start(value, callback)));
}

// Подключаемся к демону
pm2.connect(error => {
  // Ошибка при подключении
  if (error) {
    console.error(error);
    process.exit(1);
  }

  // Создаем процессы
  async.series(
    startWrapper([
      // Сервер
/*      {
        name: 'server', 
        script: './server', 
        cwd: __dirname, 
        error_file: __dirname + '/logs/server-error.log', 
        out_file: __dirname + '/logs/server-out.log'
      }, */

      // Приложение
      {
        name: 'app', 
        script: './app/main.js', 
        cwd: __dirname, 
        env: {
          "DEBUG": process.env.DEBUG
        }, 
        max_memory_restart: '300M', 
        kill_timeout: 5000,
        error_file: __dirname + '/logs/app-error.log', 
        out_file: __dirname + '/logs/app-out.log'
      }
    ]), 
    function (error, results) {
      // При запуске процессов возникли ошибки
      if (error) {
        console.error(error);
        process.exit(1);
      }

      console.log('All processes were successfully started!');
      console.log('Use `npm run monit` or `npm run logs` to monitor processes statuses.');

      // Отключаемся от демона
      pm2.disconnect();
    }
  );
});