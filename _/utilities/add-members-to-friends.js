'use strict';

/**
 * Сканирование списка подписчиков и добавление в друзья.
 *
 * ID бота, для которго нужно просканировать и добавить друзей, нужно передать как аргумент при вызове функции через консоль.
 */

const BOT_ID   = process.argv[2];
const GROUP_ID = 'botsforchats';

const account = (require('../build/accounts'))[BOT_ID];
const async   = require('async');
const VKApi   = require('node-vkapi');

const api = new VKApi({
  auth: account.auth
});

api.auth.user({ scope: 'all', type: 'android' })
  .then(() => {
    api.call('execute', {
        code: 'var userId = ' + BOT_ID + ';' + 
              'var offset = 0;' + 
              'var followersToReturn = [];' + 
              'var followers = API.users.getFollowers({ user_id: userId, offset: offset, count: 1000 }).items;' + 
              'while (offset < 10000) {' + 
              '  var followersCount = followers.length;' + 
              '  followersToReturn = followersToReturn + followers;' + 
              '  offset = offset + 1000;' + 
              '  if (followersCount < 1000) {' + 
              '    offset = 10000;' + 
              '  }' + 
              '  followers = API.users.getFollowers({ user_id: userId, offset: offset, count: 1000 }).items;' + 
              '}' + 
              'return followersToReturn;'
      })
      .then((followersArray = []) => {
        console.log('Подписчиков получено:', followersArray.length);

        let followed  = [];
        let addsCount = 0;

        async.whilst(
          function () {
            return followersArray.length > 0;
          }, 

          function (callback) {
            let followersToCheck = followersArray.splice(0, 100);

            api.call('groups.isMember', {
                group_id: GROUP_ID, 
                user_ids: followersToCheck.join(',')
              })
              .then(response => {
                for (let i = 0, len = response.length; i < len; i++) 
                  if (response[i].member == 1) 
                    followed.push(response[i].user_id);

                return callback(null);
              })
              .catch(error => {
                console.log('Возникла ошибка при проверке подписчиков: ', error);

                return callback(null);
              });
          }, 

          function (error, result) {
            console.log('Из них подписаны на паблик:', followed.length);

            async.whilst(
              function () {
                return followed.length > 0;
              }, 

              function (callback) {
                let friendsToAdd = followed.splice(0, 25);

                api.call('execute', {
                    code: 'var ids = [' + friendsToAdd.join(',') + '];' + 
                          'while (ids.length > 0) {' + 
                          '  API.friends.add({ user_id: ids.pop() });' + 
                          '}' + 
                          'return "ok";'
                  })
                  .then(response => {
                    addsCount += friendsToAdd.length;

                    return callback(null);
                  })
                  .catch(error => {
                    console.log('Возникла ошибка при добавлении друзей:', error);

                    return callback(null);
                  });
              }, 

              function (error, result) {
                console.log('Добавлено в друзья:', addsCount);
              }
            );
          }
        );
      })
      .catch(error => {
        console.log('Возникла ошибка при получении списка подписчиков:', error);
      });
    })
    .catch(error => {
      console.log('Не удалось авторизоваться:', error);
    });