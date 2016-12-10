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
  let database = new JsonDatabase('./data/banned.json', true);
  let user_id  = parseInt(args[0]);

  if (!user_id) 
    return callback(null, '"user_id" должен состоять только из цифр.');

  // Загружаем базу данных
  database.load();

  // Проверяем наличие пользователя в списке заблокированных
  if (Array.isArray(database.data) && !database.data.includes(user_id)) 
    return callback(null, 'Данного пользователя нет в списке заблокированных.');

  // Добавляем пользователя в список заблокированных
  let index = database.data.indexOf(user_id);

  database.data.splice(index, 1);
  database.save();

  // Оповещаем приложение (./app) об изменениях в базе данных
  pm2sender('app', {
    event:  'database_updated', 
    target: 'banned.json'
  }, isSent => {
    if (isSent) 
      return callback(null, 'Операция успешна.');

    return callback(null, 'Произошла ошибка при обновлении базы данных.');
  });
}

module.exports = {
  use: '/unban <user_id>', 
  run
}