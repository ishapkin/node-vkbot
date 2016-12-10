'use strict';

/**
 * Сканирование списка друзей и удаление тех, кто не писал боту более месяца.
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
              'var friends = API.friends.get({ user_id: userId, offset: offset, count: 1000 }).items;' + 
              'while (offset < 10000) {' + 
              '  var friendsCount = friends.length;' + 
              '  friendsToReturn = friendsToReturn + friends;' + 
              '  offset = offset + 1000;' + 
              '  if (friendsCount < 1000) {' + 
              '    offset = 10000;' + 
              '  }' + 
              '  friends = API.friends.get({ user_id: userId, offset: offset, count: 1000 }).items;' + 
              '}' + 
              'return friendsToReturn;'
      })
      .then((friendsArray = []) => {
        console.log('Друзей получено:', friendsArray.length);

        let inactive  = [];
        let delsCount = 0;

        async.whilst(
          function () {
            return friendsArray.length > 0;
          }, 

          function (callback) {
            let friendsToCheck = friendsArray.splice(0, 25);

            // Set now date in UNIX-time
            let nowDate = new Date();
                nowDate.setMonth(nowDate.getMonth() - 1);
                nowDate = Math.floor(nowDate.getTime() / 1000);

            api.call('execute', {
              code: 'var ids = [' + friendsToCheck.join(',') + '];' + 
                    'var nowDate = ' + nowDate + ';' + 
                    'var friendIdsToReturn = [];' + 
                    'var messages = null;' + 
                    'var userId = null;' + 
                    'while (ids.length > 0) {' + 
                    '  userId   = ids.pop();' + 
                    '  messages = API.messages.getHistory({ user_id: userId, count: 1 }).items;' + 
                    '  if ((messages.length == 0) || ((nowDate - messages[0].date)/60/60/24 >= 30)) {' + 
                    '    friendIdsToReturn = friendIdsToReturn + [userId];' + 
                    '  }' + 
                    '}' + 
                    'return friendIdsToReturn;'
              })
              .then(response => {
                inactive = inactive.concat(response);

                return callback(null);
              })
              .catch(error => {
                console.log('Возникла ошибка при проверке друзей: ', error);

                return callback(null);
              });
          }, 

          function (error, result) {
            console.log('Из них неактивные:', inactive.length);

            async.whilst(
              function () {
                return inactive.length > 0;
              }, 

              function (callback) {
                let friendsToDelete = inactive.splice(0, 25);

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