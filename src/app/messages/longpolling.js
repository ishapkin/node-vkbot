'use strict';

/**
 * Подключение к LongPoll серверу и получение обновлений. 
 * Обновления можно получать, повесив обработчик на событие "updates".
 */

/**
 * Module dependencies
 * @private
 */
const EventEmitter = require('events').EventEmitter;
const debug        = require('../../lib/simple-debug')(__filename);
const prequest     = require('request-promise');

class LongPolling extends EventEmitter {
  constructor (parent) {
    super();

    this.parent = parent;
  }

  /**
   * Полностью обновляет LongPoll URL и подключается к серверу снова
   * @return {Promise}
   * @private
   */
  _updateFullLinkAndStart () {
    debug.out('= Updating full LongPoll URL and starting checking again.');

    return this.parent.parent.VKApi.call('execute.getLongPollServerLink')
      .then(link => {
        debug.out('+ URL was successfully got. Starting checking now.');

        return this.check(link);
      })
      .catch(err => {
        debug.err('- Error in LongPolling._updateFullLinkAndStart()');
        debug.err(err.stack);

        return this._updateFullLinkAndStart();
      });
  }

  /**
   * Получает обновления от LongPoll сервера
   * @param  {String} link
   * @return {Promise}
   * @public
   */
  check (link = null) {
    if (link === null) 
      return this._updateFullLinkAndStart();

    debug.out('+ Request to LongPoll Server was sent.');

    return prequest(link, { json: true })
      .then(res => {
        // Критическая ошибка в LongPoll-соединении (failed code >= 2). 
        // Нужно полностью обновить LongPoll-сессию (key и ts)
        if (res.failed && res.failed !== 1) 
          return this._updateFullLinkAndStart();

        // Обновление LongPoll URL (установка свежего timestamp)
        link = link.replace(/ts=.*/, 'ts=' + res.ts);

        // Никаких обновлений получено не было. 
        // Подключаемся по-новой
        if (!res.updates || res.updates.length < 1) 
          return this.check(link);

        // Получены обновления. Сообщаем об этом
        this.emit('updates', res.updates);

        // Подключаемся по-новой для прослушивания обновлений
        return this.check(link);
      })
      .catch(error => {
        // Скорее всего, произошла одна из ошибок: ETIMEDOUT, EHOSTUNREACH, ESOCKETTIMEDOUT, ECONNRESET, ECONNREFUSED, ENOTFOUND, 502 code, etc. 
        // Переподключаемся. 
        // В логи ничего не пишем
        return this._updateFullLinkAndStart();
      });
  }
}

module.exports = LongPolling;