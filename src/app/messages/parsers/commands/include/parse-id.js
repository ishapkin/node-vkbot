'use strict';

/**
 * Парсит ID пользователя из строки
 * @param  {String} str Предполагаемый ID
 * @return {String}     ID
 * @public
 */
function parser (str) {
  let output = str;

  // ID не может содержать русских (и прочих) символов
  if (str === null || !/^[a-z0-9_\.]*$/i.test(str)) 
    return null;

  // Если ID состоит только из цифр, то добавляем префикс "id"
  if (/^\d+$/.test(str)) 
    output = 'id' + output;

  // На выходе получаем "screen_name", по которому получим действительный ID
  return output;
}

module.exports = parser;