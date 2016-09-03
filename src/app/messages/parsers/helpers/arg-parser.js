'use strict';

/**
 * Парсит текст сообщения после команды
 * @param  {Object} messageObject Исходный объект сообщения
 * @return {String}               Сообщение
 * @private
 */
function parseMessage (messageObject) {
  let message    = messageObject.message;
  let fwdMessage = messageObject.fwdMessage;
  let spaceIndex = message.indexOf(' ');
  let output     = '';

  // После команды есть как минимум одно слово. Обрезаем сообщение
  if (spaceIndex !== -1) 
    output = message.substr(spaceIndex).trim() || '';

  // Если текст сообщения после команды оказался пустым, то 
  // попытаемся получить его из пересланного сообщения (только для личных сообщений)
  if (output === '' && fwdMessage !== null) 
    output = fwdMessage;

  return output;
}

/**
 * Класс для работы с аргументами команды
 */
class Arguments {
  /**
   * Конструктор класса
   * @param  {Object} messageObject Исходный объект сообщения
   */
  constructor (messageObject) {
    /**
     * Исходный объект сообщения
     * @type {Object}
     * @private
     */
    this._messageObject = messageObject;

    /**
     * Спаршенный текст сообщения (без команды)
     * @type {String}
     * @private
     */
    this._message = parseMessage(messageObject);
  }

  /**
   * Вернёт true, если команде не было передано 
   * ни одного аргумента (ни текста, ни прикрепления)
   * @return {Boolean}
   * @public
   */
  get isNull () {
    return !this.source.attachments.attach1 && !this.fullText;
  }

  /**
   * Возвращает первое слово после команды
   * @return {String}
   * @public
   */
  get firstWord () {
    let word = this._message.split(' ')[0] || null;

    return word;
  }

  /**
   * Возвращает весь текст сообщения после команды
   * @return {String}
   * @public
   */
  get fullText () {
    let text = this._message || null;

    return text;
  }

  /**
   * Возвращает последнее слово из текста после команды
   * @return {String}
   * @public
   */
  get lastWord () {
    let words = this._message.split(' ');
    let word  = words[words.length - 1] || null;

    return word;
  }

  /**
   * Возвращает ссылку на оригинальный объект сообщения (messages/processing.js)
   * @return {Object}
   * @public
   */
  get source () {
    return this._messageObject;
  }

  /**
   * Возвращает текст сообщения после команды, 
   * разбив его на две части: запрос и количество
   * @return {Array} [query, count]
   * @public
   */
  get queryCount () {
    let argText  = this.fullText;
    let lastWord = this.lastWord;

    // Нет запроса, нет количества
    if (argText === null) 
      return [null, null];

    // Последнее слово - число
    if (/^\d+$/.test(lastWord)) {
      if (argText.length === lastWord.length) {
        // Это слово является и всем текстом запроса. 
        // Тогда считаем это число самим запросом
        return [lastWord, null];
      } else {
        // Иначе, это число - количество, а всё, что 
        // находится перед ним - запрос
        let query = argText.slice(0, argText.length - lastWord.length).trim() || null;
        let count = parseInt(lastWord);

        return [query, count];
      }
    } else {
      // Последнее слово - не число. 
      // Просто возвращаем запрос
      return [argText, null];
    }
  }

  /**
   * Изменяет оригинальный текст сообщения
   * @param  {String} message Новый текст сообщения
   * @public
   */
  set message (message) {
    this._message = message;
  }

  /**
   * Возвращает ID первого прикрепления
   * @param  {String} type Тип прикрепления (photo, video, audio, doc, wall, sticker, link)
   * @return {String}      ID прикрепления в формате 'owner-id_item-id'
   * @public
   */
  attachment (type) {
    if (this.source.attachments.attach1_type === type) 
      return this.source.attachments.attach1;
    else
      return null;
  }
}

module.exports = Arguments;