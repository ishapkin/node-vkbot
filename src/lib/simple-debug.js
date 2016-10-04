'use strict';

/**
 * Простые логи
 */

const DEBUG_ACTIVE = process.env.DEBUG;

/**
 * Logger function
 * @param  {String} absolutePath Полный путь к файлу, в котором была вызвана функция
 * @return {Object}
 * @public
 */
function logger (absolutePath) {
  // Приводим все пути к формату: directory/filename.js
  let path   = absolutePath.split('/').slice(-2).join('/');
  let date   = (new Date()).toLocaleString('ru');
  let prefix = `[${date}][${path}]`;

  return {
    err: (...args) => console.error(prefix, ...args, '\n'), 
    out: (...args) => DEBUG_ACTIVE ? console.log(prefix, ...args, '\n') : null
  }
}

module.exports = logger;