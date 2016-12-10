'use strict';

/**
 * Module dependencies.
 * @private
 */
const JsonDatabase = require('node-json-db');
const pm2sender    = require('../../lib/pm2-sender');

/**
 * Run fn
 * @param  {Array}     args
 * @param  {Function}  callback
 * @public
 */
function run (args, callback) {
  let database = new JsonDatabase('./data/users.json', true);
  let user_id  = parseInt(args[0]);
  let bot_id   = parseInt(args[1]);

  if (!user_id) 
    return callback(null, '"user_id" должен состоять только из цифр.');

  // Загружаем базу данных
  database.load();

  // Достаём из неё данные текущего юзера
  let currentUserData = database.data[user_id];

  // Проверяем наличие VIP у указанного бота
  if (Array.isArray(currentUserData) && currentUserData.includes(bot_id)) 
    return callback(null, 'Данный пользователь уже имеет VIP у этого бота.');

  // Пользователь VIP у всех ботов
  if (currentUserData === 'all') 
    return callback(null, 'Данный пользователь уже имеет VIP у всех ботов.');

  // Если bot_id указан, то выдаем юзеру VIP у указанного бота. 
  // Если bot_id не указан, то выдаем VIP у всех ботов
  if (bot_id)
    database.push(`/${user_id}[]`, bot_id, false);
  else
    database.push(`/${user_id}`, 'all');

  // Оповещаем приложение (./app) об изменениях в базе данных
  pm2sender('app', {
    event:  'database_updated', 
    target: 'users.json'
  }, isSent => {
    if (isSent) 
      return callback(null, 'Операция успешна.');

    return callback(null, 'Произошла ошибка при обновлении базы данных.');
  });
}

module.exports = {
  use: '/vip <user_id> [bot_id]', 
  run
}