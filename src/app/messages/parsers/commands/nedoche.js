'use strict';
/**
 * Module dependencies
 * @private
 */
 const che = require('./che.js');
 
/**
 * Local constants
 * @private
 */
const PUBLIC_INFO = {
  //id: -123, // id has priority
  domain: '20jqofa'
};

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  che.params.public_info.domain = '20jqofa';
  return che.run(arg, callback);
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['недоче'],
  description: 'Выдает случайный пост с паблика "недоче" https://vk.com/20jqofa. Если не задан второй параметр,' +
  ' по умолчанию ищет среди самых новых записей (новее).',
  use:         '/nche [новее|новое|старое|старейшее]',

  run
}
