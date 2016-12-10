'use strict';

/**
 * Обработка обновлений, полученных через LongPolling
 */

/**
 * Module dependencies
 * @private
 */
const apply       = require('./applying');
const debug       = require('../../lib/simple-debug')(__filename);
const replaceUrls = require('./parsers/commands/include/replacer');

/**
 * Обработка и помещение сообщения в очередь
 * @param  {Array} item  Элемент массива обновлений
 * @return {Promise}
 * @public
 *
 * Функции передаётся контекст (this) класса Messages (./Messages.js)
 */
function processUpdates (item) {
  let messageObject = assembleMessage.call(this, item);
  let messageObjectMiddlewared;

  // Нет объекта сообщения. Скорее всего, оно не обработано, т.к. идентично предыдущему, 
  // либо его прислал в беседу заблокированный пользователь
  if (messageObject === null) 
    return null;

  let chatMode = this.getChatMode(messageObject.chatId);

  // Режим беседы отличен от 'default' (или undefined). 
  // Делегируем дальнейшую обработку сообщения другому обработчику
  if (chatMode && chatMode !== 'default') 
    return (require('./chat-modes/' + chatMode)).call(this, messageObject);

  // 1. Применяем мидлвэйры
  // 2. Проверяем, всё ли ок (есть ли боты в беседе)
  // 3. Применяем парсер (обращение, команда, приглашение, etc.)
  // 4. Собираем сообщение и помещаем в очередь
  return apply.middleware.call(this.parent, messageObject)
    .then(messageObj => {
      messageObjectMiddlewared = messageObj;

      return checking.call(this, messageObj);
    })
    .then(messageObj => {
      // После проверки было возвращено значение null. 
      // Значит, ничего отвечать не надо, т.к. в беседе есть боты
      if (messageObj === null) 
        return null;

      // В объекте есть свойство apply === false. В этом случае, применять парсер не будем, 
      // отправляем укзанное сообщение.
      if (messageObj.apply === false) {
        delete messageObj.apply;

        return messageObj;
      }

      return apply.parser.call(this.parent, messageObj);
    })
    .then(newMessageObj => {
      // Парсер вернул null. Ничего отправлять не придется
      if (newMessageObj === null) 
        return null;

      let messToSend = makeMessageObject(messageObject, newMessageObj);

      if (messToSend !== null) {
        // Сообщения от админов, модеров и випов обрабатываются в первую очередь
        if (messageObjectMiddlewared.permissionsMask >= 1) {
          // Max - current
          let position = 4 - messageObjectMiddlewared.permissionsMask;

          this.Queue.enqueueTo(position, messToSend, messageObjectMiddlewared.chatId);
        } else 
          this.Queue.enqueue(messToSend, messageObjectMiddlewared.chatId);
      }
    })
    .catch(error => {
      debug.err('processUpdates()', error);
    });
}

/**
 * Обрабатывает обновления, которые были получены через LongPolling.
 * @param  {Array}    item      Элемент массива обновлений.
 * @private
 * 
 * Функции передаётся контекст (this) класса Messages (./Messages.js)
 */
function assembleMessage (item) {
  /**
   * Разбираем массив обновлений на читаемые переменные
   */
  // Текст сообщения
  let message = item[6] || '';

  // ID сообщения
  let messageId = item[1];

  // Вложения (прикрепления)
  let attachments = item[7] || {};

  // ID диалога
  let convId = parseInt(item[3]);

  // ID беседы
  let mchatId = convId - 2000000000;

  // ID пользователя, от которого пришло сообщение в беседу
  let mchatFromId = parseInt(attachments.from);

  // == true, если сообщение пришло в беседе
  let isMultichat = mchatFromId && true || false;

  // Точный ID диалога, в который пришло сообщение
  let dialogId = isMultichat ? mchatId : convId;

  // Точный ID пользователя, от которого пришло сообщение
  let fromId = isMultichat ? mchatFromId : convId;

  // Предыдущее сообщение в данном диалоге
  let prevMessage = (this._conversations[dialogId].lastMessage || '').toLowerCase();

  // Участники этой беседы ещё не были загружены, поэтому получим их прямо сейчас
  if (isMultichat && !this._conversations[mchatId].users) 
    this._updateChatComp(mchatId);

  // Не обрабатываем сообщение, если оно идентично предыдущему
  if (message.toLowerCase() === prevMessage) 
    return null;

  // Сохраняем последнее сообщение в диалоге
  this._conversations[dialogId].lastMessage = message;

  // Объект сообщения (для использования в парсерах, миддлвэйрах и командах)
  let messToParse = {
    _vkapi: this.parent.VKApi, 
    attachments, 
    botId: this.parent._botId, 
    chatId: dialogId, 
    chatUsers: isMultichat && this._conversations[mchatId].users || null, 
    fromId, 
    isMultichat, 
    message, 
    messageId
  };

  return messToParse;
}

/**
 * Выполняет некоторые проверки перед тем, как применять парсер к сообщению.
 * @param  {Object} messageObj Объект сообщения (после применения мидлвэйров).
 * @return {Promise}
 * @private
 *
 * Функции передаётся контекст (this) класса Messages (./Messages.js).
 */
function checking (messageObj) {
  return Promise.resolve()
    .then(() => {
      // В беседе есть другие чат-боты (помимо текущего)
      if (messageObj.botsInChat !== null) {
        // Объект участников беседы
        let chatUsers = messageObj.chatUsers;

        // Массив ID ботов (string)
        let botIds = messageObj.botsInChat;

        // Дата обнаружения ботов
        let checkingDate = this._conversations[messageObj.chatId].botsCheckingTime;

        // Если === true, значит в чате есть ещё наши боты => выходим.
        // Для этого установим старую дату, чтобы бот моментально вышел
        if (messageObj.botsInChat === true) 
          checkingDate = new Date('11.11.11');

        // Дата уже была ранее установлена, но боты ещё не кикнуты
        if (checkingDate !== undefined) {
          let now = Date.now();

          // Прошло более 3-х минут
          if ((now - checkingDate) > 3*60*1000) {
            delete this._conversations[messageObj.chatId].botsCheckingTime;

            // Выходим из беседы
            return this.parent.VKApi.call('messages.removeChatUser', {
                chat_id: messageObj.chatId, 
                user_id: messageObj.botId
              })
              .then(() => {
                // Присваиваем null, т.к. бот вышел сам
                this._conversations[messageObj.chatId].users = null;

                // Возвращаем null, чтобы в очередь ничего не помещалось
                return null;
              })
              .catch(() => null);
          } else {
            return null;
          }
        } else {
          // Дата не была ранее установлена. Боты только что обнаружены. 
          // Устанавливаем дату и выводим предупреждение
          this._conversations[messageObj.chatId].botsCheckingTime = Date.now();

          return {
            apply: false, 
            message: 'Оказывается, в беседе помимо меня есть ещё боты..' + 
                     '\nК сожалению, я не буду отвечать на ваши сообщения, ' + 
                     'пока в беседе присутствует более одного бота, не считая меня.' + 
                     '\n\nВам стоит удалить из беседы некоторых ботов.' + 
                     '\n\nБоты:' + 
                     '\n' + botIds.map(v => `${chatUsers[v].firstName} (vk.com/id${v})`).join('\n') + 
                     '\n\nЯ жду 3 минуты, перед тем как уходить.', 
            forward: false
          };
        }
      }

      // Ботов в чате нет, но дата была ранее установлена. Значит, боты были кикнуты. 
      // Выводим сообщение о том, что теперь всё хорошо, а также удаляем установленную дату
      if (messageObj.botsInChat === null && this._conversations[messageObj.chatId].botsCheckingTime !== undefined) {
        delete this._conversations[messageObj.chatId].botsCheckingTime;

        return {
          apply: false, 
          message: 'Отлично! Теперь я буду отвечать на ваши сообщения.', 
          forward: false
        };
      }

      // Всё ок, ничего проверять не пришлось, возвращаем исходный объект сообщения
      return messageObj;
    });
}

/**
 * "Собирает" объект сообщения для отправки во ВКонтакте.
 * @param  {Object} beforeProcessing   Объект сообщения до обработки
 * @param  {Object} afterProcessing    Объект сообщения после обработки
 * @return {Object}                    Объект сообщения, готовый к отправке в ВКонтакте
 * @private
 */
function makeMessageObject (beforeProcessing, afterProcessing) {
  if (!afterProcessing) 
    return null;

  // Передана строка, считаем, что это сообщение
  if (typeof afterProcessing === 'string') {
    afterProcessing = {
      message: afterProcessing
    }
  }

  // ЛС или беседа?
  let _to = beforeProcessing.isMultichat ? 'chat_id' : 'user_id';

  // ID диалога
  let _toId = beforeProcessing.chatId;

  // Сообщение
  let _message = afterProcessing.message || '';

  // Прикрепления
  let _attachments = afterProcessing.attachments || '';

  if (_attachments && Array.isArray(_attachments)) 
    _attachments = _attachments.join(',');

  // Пересылаемые сообщения
  // Если указан параметер "forward_messages", то "forward" учитываться не будет, 
  // соответственно, исходное сообщение также не будет переслано.
  let _forwards = afterProcessing.forward_messages;

  if (_forwards && Array.isArray(_forwards)) 
    _forwards = _forwards.join(',');

  if (!_forwards) 
    _forwards = afterProcessing.forward ? beforeProcessing.messageId : '';

  // Ни сообщения, ни прикреплений, ни пересылаемых сообщений нет. 
  // Значит, ничего отправлять не будем
  if (!(_message || _attachments || _forwards)) 
    return null;

  // Возвращаем собранный объект. 
  // Не забываем удалить ссылки из сообщения (repalceUrls)
  return {
    [_to]: _toId,
    message: afterProcessing.replaceUrls === true ? replaceUrls(_message) : _message, 
    attachment: _attachments, 
    forward_messages: _forwards
  };
}

module.exports = processUpdates;