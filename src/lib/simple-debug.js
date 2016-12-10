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
  let path = absolutePath.split('/').slice(-2).join('/');

  return {
    err: (...args) => console.error(`[${(new Date()).toLocaleString('ru')}][${path}]`, ...args, '\n'), 
    out: (...args) => DEBUG_ACTIVE ? console.log(`[${(new Date()).toLocaleString('ru')}][${path}]`, ...args, '\n') : null
  }
}

module.exports = logger;