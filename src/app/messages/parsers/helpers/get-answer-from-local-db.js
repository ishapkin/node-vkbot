'use strict';

/**
 * Получает ответ для appeal.js из локальной базы данных ответов
 */

/**
 * Module dependencies
 * @private
 */
const readline = require('readline');
const fs = require('fs');
const randomElem = require('../commands/helpers/random-elem');
const localDBPath = './data/answers.bin';
const redisDb     = require('../../helpers/redis');

/**
 * Удаляет дубликаты из переданного массива
 * @param  {Array} arrayOfItems  Массив элементов
 * @return {Array}               Массив без дубликатов
 */
function removeDublicates (arrayOfItems) {
  if (!Array.isArray(arrayOfItems))
    return arrayOfItems;

  let setOfItems = new Set(arrayOfItems);

  return Array.from(setOfItems);
}

function prepareWords (message) {
  let symbolsCutted = message.replace(/[!@#\$%\^&\*\(\)_\+~\?><\/\.,:;"'\}\{\]\[\|\\`]/g, '');
  let words = symbolsCutted.split(' ');

  for (let i = 0, len = words.length; i < len; i++) {
    words[i] = words[i].toLowerCase();
  }

  return removeDublicates(words);
}

module.exports = (message, callback) => {
  let messageWords = prepareWords(message);
  let answer = [0, null];
  let answers = [];

  //redisDb.lookupAndAnswer(messageWords, callback);

  // If can't find in redis, search in local db
  let localDBLines = readline.createInterface({
    input: fs.createReadStream(localDBPath)
  });

  localDBLines.on('line', data => {
    let pattern = data.split('\\');
    let patternWords = prepareWords(pattern[0]);

    let currentCompat = 0;

    for (let i = 0, len = messageWords.length; i < len; i++) {
      let currentWord = messageWords[i];

      if (~patternWords.indexOf(currentWord))
        currentCompat++;
    }

    currentCompat = currentCompat / messageWords.length + currentCompat / patternWords.length;

    if (currentCompat > answer[0]) {
      answer[0] = currentCompat;
      answer[1] = pattern[1];
    }

    if (currentCompat === 2)
      answers.push(pattern[1]);
  });

  localDBLines.on('close', () => {
    let ans = null;

    if (answers.length > 1)
      ans = (randomElem(answers) || '').trim();
    else
      ans = (answer[1] || '').trim();

    if (ans.length < 1)
      ans = randomElem([
        'Ты дура?',
        'Что ты несёшь?',
        'Ты дебил?',
        'Ты о чём?',
        'И зачем ты мне это сказал?',
        'Странный ты.',
        'Как же ты заебааал...',
        'Опять за своё?',
        'Опять хуйню нести начал?',
        'Пиши на понятном языке.',
        'А поподробней можно?',
        'Чё-то я устал, пойду посплю.'
      ]);

    return callback(ans);
  });
}
