'use strict';

/**
 * Точка входа в приложение (./app)
 *
 * Создаёт и запускает отдельный экземпляр приложения для каждого бота. 
 * Все экземпляры хранятся в классе Application. 
 */

/**
 * Module dependencies.
 * @private
 */
const async        = require('async');
const JsonDatabase = require('node-json-db');

const Application  = require('./application/Application');
const debug        = require('../lib/simple-debug')(__filename);
const init         = require('./application/init');

// Accounts data
const accounts    = require('../accounts');
const accountKeys = Object.keys(accounts);

// Database files
const usersDatabase  = new JsonDatabase('./data/users.json', true);
const bannedDatabase = new JsonDatabase('./data/banned.json', true);

const app = new Application();

debug.out('= Loading databases');

usersDatabase.load();
bannedDatabase.load();

debug.out('= Starting of all the bots was begin');

/**
 * Инициализируем экземпляры всех ботов, указанных в accounts.js:
 *   1. Будут получены команды для каждого бота;
 *   2. Будет получен токен для каждого бота;
 *   3. Будет возвращен экземпляр каждого бота.
 */
async.series(
  // Составляем массив функций-инициализаторов
  accountKeys.map(botId => {
    let authData   = accounts[botId];
    let initObject = Object.assign(authData, { id: botId });
    
    return init(initObject);
  }), 

  /**
   * Функция, вызываемая по завершении инициализации ботов
   * @param  {Object} error   
   * @param  {Array} results  Массив экземпляров ботов
   * @private
   */
  function (error, results) {
    // Ошибка при запуске бота. Скорее всего, не удалось получить токен.
    // Завершаем процесс, разбираемся с ошибкой.
    if (error) {
      debug.err('- Fatal error: one of tokens was not got. Shutting down');
      process.exit(0);
    }

    debug.out('+ All bots\' instances were created.');

    // Добавляем ботов в приложение
    app.add(results);

    // Установим ссылки на базы данных
    app._databases['users']  = usersDatabase;
    app._databases['banned'] = bannedDatabase;

    // Запускаем приложение
    app.start();

    debug.out('+ All bots were started.');
  }
);


/**
 * Устанавливаем статус ботам "Оффлайн" при завершении работы приложения. 
 * А также сохраняем некоторые временные данные
 */
process.on('SIGINT', () => {
  debug.err('= SIGINT received. Saving data and turning off bots');

  // Завершаем работу ботов
  app.stop();

  debug.err('+ All bots were turned off');

  // Завершим процесс, если он ещё не завершен.
  // При этом, нужно убедиться, что функция .shutdown() отработала.
  // process.exit(0);
});

/**
 * Обрабатываем межпроцессные сообщения
 * @param  {Object} messageObject
 */
process.on('message', messageObject => {
  let dataObject = messageObject.data;

  // Обработаем событие обновления базы данных
  if (dataObject.event === 'database_updated') {
    if (dataObject.target === 'banned.json') 
      bannedDatabase.reload();

    if (dataObject.target === 'users.json') 
      usersDatabase.reload();
  }
});