'use strict';

/**
 * Module dependencies
 * @private
 */
const words = require('../../../../../data/restricted');

/**
 * Local constants
 * @private
 */
const REGEXP = new RegExp(Object.keys(words).join('|'), 'gmi');

/**
 * Проверяет, есть ли в тексте запрещённые слова
 * @param  {String} text
 * @return {Boolean}
 * @public
 */
function checker (text) {
  let cleanText = text.replace(/[^а-яёa-z\s]/gmi, '');

  return REGEXP.test(cleanText);
}

module.exports = checker;