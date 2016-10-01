'use strict';

/**
 * Сканирование списка друзей и удаление заблокированных.
 *
 * ID бота, для которго нужно найти и удалить собачек, нужно передать как аргумент при вызове функции через консоль.
 */

const BOT_ID  = process.argv[2];

const account = (require('../build/accounts'))[BOT_ID];
const async   = require('async');
const VKApi   = require('node-vkapi');

const api = new VKApi({
  auth: account.auth
});

api.auth.user({ type: 'android', scope: 'all' })
  .then(() => {
    api.call('execute', {
        code: 'var userId = ' + BOT_ID + ';' + 
              'var offset = 0;' + 
              'var friendsToReturn = [];' + 
              'var friends = API.friends.get({ user_id: userId, fields: "deactivated", offset: offset, count: 1000 }).items;' + 
              'while (offset < 10000) {' + 
              '  var friendsCount = friends.length;' + 
              '  friendsToReturn = friendsToReturn + friends;' + 
              '  offset = offset + 1000;' + 
              '  if (friendsCount < 1000) {' + 
              '    offset = 10000;' + 
              '  }' + 
              '  friends = API.friends.get({ user_id: userId, fields: "deactivated", offset: offset, count: 1000 }).items;' + 
              '}' + 
              'return friendsToReturn;'
      })
      .then(friendsArray => {
        console.log('Друзей получено:', friendsArray.length);

        let deactivated = [];
        let delsCount   = 0;

        for (let i = 0, len = friendsArray.length; i < len; i++) 
          if (friendsArray[i].deactivated) 
            deactivated.push(friendsArray[i].id);

        console.log('Из них заблокированных:', deactivated.length);

        async.whilst(
          function () {
            return deactivated.length > 0;
          }, 

          function (callback) {
            let friendsToDelete = deactivated.splice(0, 25);

            api.call('execute', {
                code: 'var ids = [' + friendsToDelete.join(',') + '];' + 
                      'while (ids.length > 0) {' + 
                      '  API.friends.delete({ user_id: ids.pop() });' + 
                      '}' + 
                      'return "ok";'
              })
              .then(response => {
                delsCount += friendsToDelete.length;

                return callback(null);
              })
              .catch(error => {
                console.log('Возникла ошибка при удалении друзей: ', error);

                return callback(null);
              });
          }, 

          function (error, result) {
            console.log('Друзей удалено:', delsCount);
          }
        );
      })
      .catch(error => {
        console.log('Возникла ошибка при получении списка друзей:', error);
      });
  })
  .catch(error => {
    console.log('Не удалось авторизоваться:', error);
  });