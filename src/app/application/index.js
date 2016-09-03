'use strict';

/**
 * Module dependencies
 * @private
 */
const config   = require('../../config');
const Messages = require('../messages');
const VKApi    = require('node-vkapi');

/**
 * Application main class
 */
class Application {
  constructor ({ id, token, condition, commands }) {
    // ID бота
    this._botId = parseInt(id);

    // Список всех команд текущего бота
    this._commands = commands;

    // Условие добавления
    this._cond = condition;

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
   * Запускает приложение
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
  shutdown () {
    return this._setStatusAndGetData('off');
  }

  /**
   * Изменяет статус бота и добавляет в друзья пользователей
   * @param  {String} status on/off
   * @private
   */
  _setStatusAndGetData (status) {
    let method = !this._cond ? 'setStatusAndAddFriends' : 'setStatusAndAddFriendsWithCondition';

    return this.VKApi.call('execute.' + method, {
      status, 
      condition: this._cond
    });
  }
}

module.exports = Application;