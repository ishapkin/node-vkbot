'use strict';

/**
 * Базовый класс для работы с сообщениями.
 */

/**
 * Module dependencies
 * @private
 */
const config      = require('../../config');
const debug       = require('../../lib/simple-debug')(__filename);
const LongPolling = require('./longpolling');
const processing  = require('./processing');
const Queue       = require('./queue');

/**
 * Проверка флагов полученного сообщения (для личных сообщений).
 * @param  {Number} flag Флаг сообщения (vk.com/dev/using_longpoll_2)
 * @return {Boolean}
 * @private
 */
function checkPmFlags (flag) {
  let flags = [33, 49, 545, 561];

  return !!~flags.indexOf(flag);
}

/**
 * Преобразует полученный массив участников беседы (messages.getChatUsers) в объект. 
 *
 * @param  {Array}    array   Исходный массив
 * @param  {Number}   botId   ID бота
 * @return {Object}
 * @private
 *
 * Вид возвращаемого объекта:
 *
 * {
 *   [user_id]: {
 *     firstName:    [first_name], 
 *     lastName:     [last_name], 
 *     chatAdmin:    [true/false], 
 *     botInviter:   [true/undefined], 
 *     invitedByBot: [true/false]
 *   }
 * }
 */
function chatUsersArrayToObj (array, botId) {
  let obj = {};
  let botInviter = null;

  for (let i = 0, len = array.length; i < len; i++) {
    let current = array[i];

    obj[current.id] = {
      firstName: current.first_name, 
      lastName: current.last_name
    }

    if (current.id === botId && current.id !== current.invited_by) 
      botInviter = current.invited_by;

    if (current.id === current.invited_by) 
      obj[current.id].chatAdmin = true;

    if (current.id !== botId && current.invited_by === botId) 
      obj[current.id].invitedByBot = true;
  }

  // Если пригласивший бота пользователь присутствует в беседе, 
  // указываем, что именно он пригласил бота
  if (botInviter != null && obj[botInviter] != undefined) 
    obj[botInviter].botInviter = true;

  return obj;
}

/**
 * Messages Class
 */
class Messages {
  constructor (parent) {
    // Ссылка на экземпляр класса Bot
    this.parent = parent;

    // Класс для работы с очередью сообщений
    this.Queue = new Queue();

    /**
     * Класс для работы с LongPoll подключением
     * @private
     */
    this._LongPolling = new LongPolling(this);

    /**
     * Информация о диалогах. 
     *
     * Формат записи свойств:
     *   <chat_id>: {
     *     users:            [users_object], 
     *     mode:             [chat_mode],
     *     botsCheckingTime: [bots_checking], 
     *     lastMessage:      String, 
     *     [_votes] (/vote)
     *   }
     *
     * [users_object] Object (undefined for personal chats) {
     *   <user_id>: {
     *     firstName:    String, 
     *     lastName:     String, 
     *     chatAdmin:    Boolean, 
     *     botInviter:   Boolean, 
     *     invitedByBot: Boolean
     *   }
     * } or null if bot has leaved by himself
     *
     * [chat_mode] String (undefined for personal chats)
     *   undefined or 'default' : default chat mode
     *   'vote'                 : voting mode (/vote)
     *
     * [bots_checking] Number (undefined for personal chats)
     * 
     * @private
     */
    this._conversations = new Proxy({}, {
      // Перехватываем обращение к несуществующему свойству 
      // "prop", где prop = chat_id
      get: function (target, prop) {
        if (target[prop] === undefined) 
          target[prop] = {};
        
        return target[prop];
      }
    });

    /**
     * Timestamp последнего успешно отправленного сообщения.
     * @type {Number}
     * @private
     */
    this._lastMessageTime = 0;
  }

  /**
   * Обновляет список участников беседы
   * @param  {Number} chat_id ID беседы
   * @return {Promise}
   * @private
   */
  _updateChatComp (chat_id) {
    return this.parent.VKApi.call('messages.getChatUsers', { chat_id, fields: 'first_name' })
      .then(response => {
        // Бота уже нет в беседе. Очищаем информацию о чате
        if (response.length === 0) {
          // 1. Удаляем список участников
          delete this._conversations[chat_id].users;

          // 2. Удаляем сообщения в этот чат из очереди
          // В случае, если бота кикнули (это отследить можно только проверив response.length === 0), 
          // то сообщение в любом случае не отправится. Даже если оно не удалится из очереди.
          // Но, на всякий случай, сообщения всё-таки удаляются, дабы очистить очередь.
          this.Queue.clear(chat_id);

          return;
        }

        // Сохраняем полученный список участников
        this._conversations[chat_id].users = chatUsersArrayToObj(response, this.parent._botId);
      })
      .catch(error => {
        // Internal server error or Too many requests error
        if (error.name === 'VKApiError' && (error.code === 10 || error.code === 6)) 
          return;

        debug.err('Error in _updateChatComp');
        debug.err(error);

        // Снова пытаемся получить список участников
        return this._updateChatComp(chat_id);
      });
  }

  /**
   * "Цикл" проверки обновлений с LongPoll сервера, а также
   * обработка полученных результатов и отправка сообщений
   * @private
   */
  _updatesLoop () {
    // Установим обработчик на событие "updates". 
    // Массивы обновлений из LongPolling попадают сюда
    this._LongPolling.on('updates', updatesArray => {
      // Пробегаемся по массиву обновлений и обрабатываем сообщения
      for (let i = 0, len = updatesArray.length; i < len; i++) {
        let current = updatesArray[i];

        // Значение 51 в нулевом элементе массива свидетельствует о том, 
        // что информация беседы была изменена. Поэтому обновляем 
        // список участников текущей беседы
        if (current[0] === 51 && this._conversations[current[1]].users) 
          this._updateChatComp(parseInt(current[1]));

        // Значение 4 в нулевом элементе массива -> пришло новое сообщение. 
        // Обрабатываем все сообщения, за исключением сообщений от бота
        if (current[0] === 4 && ((current[7].from && parseInt(current[7].from) !== this.parent._botId) || checkPmFlags(current[2]))) {
          let currentUserId = current[7].from ? parseInt(current[7].from) : parseInt(current[3]);

          // Если пользователь, написавший сообщение, заблокирован, то 
          // сообщение обработано не будет. 
          if (this.parent.parent._databases['banned'].data.includes(currentUserId)) 
            return;

          processing.call(this, current);
        }
      }
    });

    debug.out('+ LongPolling listener was set');

    // Подключаемся к LongPoll серверу и проверяем обновления
    this._LongPolling.check();

    debug.out('+ LongPolling checking was started');
  }

  /**
   * "Цикл" проверки очереди сообщений. 
   * Если она не пуста, то отправляется первое сообщение из очереди
   * @private
   */
  _queueLoop () {
    let queue = this.Queue;

    if (!queue.isEmpty()) {
      let message = queue.dequeue();

      // Если список юзеров === null, значит, бот ушёл сам из чата chat_id
      // В таком случае, сообщение не отправляем
      if (message && message.chat_id && this._conversations[message.chat_id].users === null) 
        message = null;

      return this._send(message)
        .then(() => {
          // Обновим timestamp последнего успешно отправленного сообщения
          this._lastMessageTime = Date.now();

          return setTimeout(() => this._queueLoop(), config.messages.delay);
        })
        .catch(error => {
          debug.err('- Error in Messages._queueLoop()');
          debug.err(error.stack);

          return setTimeout(() => this._queueLoop(), config.messages.delay);
        });
    }

    return setTimeout(() => this._queueLoop(), config.messages.delay);
  }

  /**
   * Отправляет сообщения во ВКонтакте.
   * @param  {Object} messageObj Объект сообщения
   * @return {Promise}
   * @private
   */
  _send (messageObj) {
    if (messageObj === null) 
      return Promise.resolve();

    return this.parent.VKApi.call('messages.send', messageObj)
      .catch(error => {
        // Flood Control error
        if (error.name === 'VKApiError' && error.code === 9) {
          messageObj.message = messageObj.message + ' 😊';

          return this._send(messageObj);
        }

        // Internal server error
        if (error.name === 'VKApiError' && error.code === 10) 
          return;

        debug.err('Messages.send()', error);
      });
  }

  /**
   * Устанавливает режим беседы.
   * @param {String} mode Режим
   * @public
   */
  setChatMode (chatId, mode) {
    this._conversations[chatId].mode = mode;
  }

  /**
   * Возвращает значение режима беседы.
   * @param  {Number} chatId ID беседы
   * @return {String}
   * @public
   */
  getChatMode (chatId) {
    return this._conversations[chatId].mode;
  }

  /**
   * Запускает модуль сообщений:
   * 1. Активируется цикл проверки сообщений в очереди для отправки;
   * 2. Активируется цикл проверки новых сообщений через LongPoll.
   * @public
   */
  start () {
    this._updatesLoop();
    this._queueLoop();
  }
}

module.exports = Messages;