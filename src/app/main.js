'use strict';

/**
 * Точка входа в приложение (./app)
 *
 * Создаёт и запускает отдельный экземпляр приложения для каждого бота. 
 * Все экземпляры хранятся в BotInstances
 */

/**
 * Module dependencies
 * @private
 */
const async = require('async');
const debug = require('../lib/simple-debug')(__filename);
const init  = require('./application/init');

const accounts    = require('../accounts');
const accountKeys = Object.keys(accounts);

// {
//    <bot_id>: <instance>
//    <...>
// }
var BotInstances = {};

/**
 * Сохраняет некоторые важные данные перед завершением процесса
 */
function turnoff () {
  debug.out('= SIGINT received. Saving data and turning off bots');

  for (let i = 0, keys = Object.keys(BotInstances), len = keys.length; i < len; i++) {
    let botId = BotInstances[keys[i]]._botId;

    // Установим статус "оффлайн"
    BotInstances[keys[i]].shutdown();
  }

  debug.out('+ All bots were turned off');

  // Завершим процесс, если он ещё не завершен.
  // При этом, нужно убедиться, что функция .shutdown() отработала.
  // process.exit(0);
}

debug.out('= Starting of all the bots was begin');

// Запускаем всех ботов, указанных в accounts.json
async.series(
  accountKeys.map(v => init(Object.assign(accounts[v], { id: v }))), 
  function (error, results) {
    // Ошибка при запуске бота. Скорее всего, не удалось получить токен.
    // Завершаем процесс, разбираемся с ошибкой.
    if (error) {
      debug.err('- Fatal error: one of tokens was not got. Shutting down');
      process.exit(0);
    }

    debug.out('+ All bots\' instances were created. Starting bots');

    // Запускаем всех ботов по очереди
    for (let i = 0, len = results.length; i < len; i++) {
      let botId = accountKeys[i];

      // Сохраняем экземпляр бота
      BotInstances[botId] = results[i];

      // Запускаем бота
      BotInstances[botId].start();

      debug.out(`+ Bot "id${botId}" was started`);
    }

    debug.out('+ All bots were started');
  }
);


/**
 * Устанавливаем статус ботам "Оффлайн" при завершении работы приложения. 
 * А также сохраняем некоторые временные данные
 */
process.on('SIGINT', () => turnoff());