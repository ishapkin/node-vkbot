'use strict';

/**
 * Возвращает экпортируемые функции .js-файлов из заданной папки
 */

/**
 * Module dependencies
 * @private
 */
const fs   = require('fs');
const path = require('path');

/**
 * @param  {String} directory
 * @return {Array}
 */
module.exports = function (directory) {
  let files  = fs.readdirSync(directory);
  let output = [];

  for (let i = 0, len = files.length; i < len; i++) {
    let current = files[i];

    if (!current.endsWith('.js') || current.startsWith('_') || current === 'index.js') 
      continue;

    let filename = current.slice(0, -3);
    let file     = require(path.join(directory, filename));

    if (typeof file === 'function') 
      output.push(file);
  }

  return output;
}