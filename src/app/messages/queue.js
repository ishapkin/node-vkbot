'use strict';

/**
 * Класс, реализующий работу очереди сообщений
 */

class Queue {
  /**
   * Очередь сообщений
   * 
   * Формат записи элемента массива:
   *   [
   *     [chatId1, message], 
   *     [chatId2, message], 
   *     [chatIdN, message]
   *   ]
   */
  constructor () {
    this.queue = [];
  }

  /**
   * Помещает сообщение в очередь
   * @param  {Object} message Объект сообщения
   * @param  {Number} chatId  ID чата
   */
  enqueue (message, chatId) {
    /**
     * Если в очереди есть сообщение в диалог chatId, 
     * то добавляем к нему ещё одно и выходим из функции.
     * 
     * Если такого chatId в очереди не оказалось, 
     * то добавляем новое сообщение в очередь (по завершению цикла)
     * 
     * Только для сообщений без прикреплений 
     */
    if (!message.attachment || message.attachment.length === 0) {
      // Пробегаемся по очереди и находим нужный chatId
      for (let i = 0, len = this.queue.length; i < len; i++) {
        // Нашли. То, что надо!
        // Убедимся, что в сообщении нет прикреплений
        if (this.queue[i] && this.queue[i][0] === chatId && this.queue[i][1].attachment.length === 0) {
          // Помещаем сообщение в эту очередь.
          // Но не просто помещаем, а объединяем его с текущим сообщением в очереди
          this.queue[i][1].message          += '\n\n' + message.message;
          this.queue[i][1].forward_messages += ',' + message.forward_messages;

          // И выходим из функции
          return;
        }
      }
    }

    // Если же сообщение содержит прикрепления, либо для данного сообщения не была 
    // найдена подходящая очередь (без прикреплений), то добавляем новый массив в конец очереди.
    this.queue.push([chatId, message]);
  }

  /**
   * Помещает сообщение в очередь на место index
   * @param  {Number} index   Позиция
   * @param  {Object} message Объект сообщения
   * @param  {Number} chatId  ID чата
   */
  enqueueTo (index, message, chatId) {
    /**
     * В случае с указанным местом в очереди, пробегаемся не по 
     * всему массиву, а только с 0 до index места. 
     *
     * При этом, удостоверимся, что index < длины очереди, ибо иначе код внутри блока 
     * не имеет смысла.
     *
     * Случай с прикрплениями аналогичный функции this.enqeque()
     */
    if (!message.attachment || message.attachment.length === 0) {
      let len = index < this.queue.length ? index + 1 : this.queue.length;
      for (let i = 0; i < len; i++) {
        if (this.queue[i] && this.queue[i][0] === chatId && this.queue[i][1].attachment.length === 0) {
          this.queue[i][1].message          += '\n\n' + message.message;
          this.queue[i][1].forward_messages += ',' + message.forward_messages;

          return;
        }
      }
    }

    this.queue.splice(index, 0, [chatId, message]);
  }

  /**
   * Удаляет первый элемент из очереди и возвращает его.
   */
  dequeue () {
    // Возвращаем 1-ый элемент массива, т.е. объект сообщения. 
    // 0-ой элемент - это ID чата.
    return this.queue.shift()[1];
  }

  /**
   * Удаляет сообщения в чат chatId из очереди
   * @param  {Number} chatId ID чата
   */
  clear (chatId) {
    let i   = 0;
    let len = this.queue.length;

    // Пробегаемся по очереди и удаляем из неё сообщения для чата chatId
    while (i < len) {
      if (this.queue[i] && this.queue[i][0] === chatId) {
        this.queue.splice(i, 1);
        continue;
      }

      i++;
    }
  }

  /**
   * Вёрнет true, если очередь пуста.
   * @return {Boolean}
   */
  isEmpty () {
    return (this.queue.length === 0);
  }
}

module.exports = Queue;