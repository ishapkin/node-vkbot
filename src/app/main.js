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
const timeago      = require('timeago.js');
      // Добавим русскую локализацию для timeago.js
      timeago.register('ru', require('../../node_modules/timeago.js/locales/ru'));

const Application  = require('./application/Application');
const debug        = require('../lib/simple-debug')(__filename);
const init         = require('./application/init');
const pm2sender    = require('../lib/pm2-sender');

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
  let event  = messageObject.data.event;
  let target = messageObject.data.target;

  // Обработаем событие обновления базы данных
  if (event === 'database_updated') {
    if (target === 'banned.json') 
      bannedDatabase.reload();

    if (target === 'users.json') 
      usersDatabase.reload();
  }

  // Обработаем событие отправки запрошенных данных
  if (event === 'data_needed') {
    // Нужно отправить необходимые данные для команды сообщества "/status"
    if (target === 'status') {
      // Информация о состоянии ботов
      let botsInfo = [];

      for (let i = 0, keys = Object.keys(app.bots), len = keys.length; i < len; i++) {
        let currentBot                = app.bots[keys[i]];
        let currentBotName            = currentBot._name;
        let currentBotQueueLength     = currentBot.Messages.Queue.queue.length;
        let currentBotLastMessageTime = currentBot.Messages._lastMessageTime;
            currentBotLastMessageTime = (new timeago()).format(currentBotLastMessageTime, 'ru');

        botsInfo.push(`🐩 ${currentBotName}\n✉ Сообщений в очереди: ${currentBotQueueLength}\n✏ Последний ответ: ${currentBotLastMessageTime}`);
      }

      // Отправляем данные
      pm2sender('server', {
        botsInfo: botsInfo.join('\n\n')
      }, () => null);
    }
  }
});