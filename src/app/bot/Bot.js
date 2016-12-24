'use strict';

/**
 * Module dependencies
 * @private
 */
const config   = require('../../config');
const Messages = require('../messages/Messages');
const VKApi    = require('node-vkapi');

/**
 * Bot main class
 */
class Bot {
  constructor ({ id, token, condition, name, commands }) {
    // ID бота
    this._botId = parseInt(id);

    // Список всех команд текущего бота
    this._commands = commands;

    // Условие добавления бота в друзья
    this._cond = condition;

    // Имя бота
    this._name = name;

    // Класс для работы с сообщениями
    this.Messages  = new Messages(this);

    // Экземпляр node-vkapi
    this.VKApi = new VKApi({
      token,
      captcha: config.api.captcha
    });
  }

  /**
   * "Цикл" проверки новых заявок в друзья.
   *
   * Помимо подтверждения заявок в друзья, также:
   * 1. Удаляются исходящие заявки
   * 2. Обновляется статус активности
   *
   * @param {Boolean} firstTimeStart Первый запуск? - true
   * @private
   */
  _friendsLoop (firstTimeStart) {
    return setTimeout(() => {
      return this._setStatusAndGetData('on')
        .then(() => this._friendsLoop())
        .catch(() => this._friendsLoop());
    }, firstTimeStart ? 0 : config.friends['check-interval']);
  }

  /**
   * Запускает текущего бота
   * @public
   */
  start () {
    this._friendsLoop(true);
    this.Messages.start();
  }

  /**
   * Устанавливает статус "Оффлайн" боту, а также выходит из ВКонтакте
   * @public
   */
  shutdown (callback) {
    return this._setStatusAndGetData('off')
      .then(() => callback && callback())
      .catch(() => callback && callback());
  }

  /**
   * Изменяет статус бота и добавляет в друзья пользователей
   * @param  {String} status 'on' or 'off'
   * @private
   */
  _setStatusAndGetData (status) {
    let method = !this._cond ? 'setStatusAndAddFriends' : 'setStatusAndAddFriendsWithCondition';

    // Bot link
    var thisBot = this;

    if (!this._cond && 1==2) { // @fixme
      return this.VKApi.call('friends.getRequests', {
        'out': 0,
        'need_viewed': 1,
      }).then(response => {
        if (response.count && response.count > 0) {
          for (var i=0; i<response.items.length; i++) {
            setTimeout(function() {
              thisBot.VKApi.call('friends.add', {
                'user_id': response.items[i],
                'follow': 0,
                'text': ''
              }).then(_data => {
                console.log('Added friend ' + response.items[i] + ' by request');
              });
            }, 1000);
          }
        }

	return "ok";
      });
    }

    return this.VKApi.call('execute.' + method, {
      status,
      condition: this._cond
    });
  }
}

module.exports = Bot;
