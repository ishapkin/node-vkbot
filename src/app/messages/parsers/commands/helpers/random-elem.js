'use strict';

/**
 * Выбирает случайный элемент из массива
 *
 * @param {Array} elemsArray
 * @return {Array element}
 */

module.exports = elemsArray => elemsArray[Math.floor(Math.random() * elemsArray.length)];