'use strict';

/**
 * Базовый класс приложения
 * @public
 */
class Application {
  constructor () {
    /**
     * Объект для хранения экземпляров ботов
     * @type {Object}
     * @public
     *
     * {
     *   <bot_id>: Bot
     * }
     */
    this.bots = {};

    /**
     * Объект для хранения ссылок на базы данных
     * @type {Object}
     * @private
     *
     * {
     *   <db_name>: Reference
     * }
     */
    this._databases = {};
  }

  /**
   * Добавляет ботов в приложение
   * @param {Array} arrayOfBotInstances [Bot, Bot, ...]
   * @public
   */
  add (arrayOfBotInstances) {
    for (let i = 0, len = arrayOfBotInstances.length; i < len; i++) {
      let currentInstance = arrayOfBotInstances[i];

      // Сохраним ссылку на этот класс
      currentInstance.parent = this;

      // Сохраняем экземпляр бота
      this.bots[currentInstance._botId] = currentInstance;
    }
  }

  /**
   * Запускает ботов
   * @public
   */
  start () {
    for (let i = 0, keys = Object.keys(this.bots), len = keys.length; i < len; i++) {
      let currentInstance = this.bots[keys[i]];

      // Запускаем бота
      currentInstance.start();
    }
  }

  /**
   * Завершает работу ботов
   * @public
   */
  stop () {
    for (let i = 0, keys = Object.keys(this.bots), len = keys.length; i < len; i++) {
      let currentInstance = this.bots[keys[i]];

      // Завершаем работу бота
      currentInstance.shutdown();
    }
  }
}

module.exports = Application;