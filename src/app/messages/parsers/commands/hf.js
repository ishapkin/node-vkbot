'use strict';

/**
 * Local constants
 * @private
 */
const MAX_TEXT_LENGTH     = 500;
const LETTERS             = ['а', 'е', 'ё', 'и', 'о', 'у', 'э', 'ы', 'ю', 'я'];
const ADDING              = 'ху';
const DEFAULT_PREFIX_END  = 'е';
const CUSTOM_PREFIXES_END = {'а': 'я', 'е': 'е', 'ё': 'ё', 'и': 'и', 'о': 'е', 'у': 'ю', 'ы': 'и', 'ю': 'ю', 'я': 'я'};

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText = arg.fullText;

  // Текст не указан. Ничего не отправляем
  if (argText === null) 
    return callback(null);

  // Обрезаем текст и избавляемся от <br> тегов
  argText = argText.replace(/<br>/g, '\n').slice(0, MAX_TEXT_LENGTH);

  // Разбиваем текст на слова
  let words = argText.split(' ');

  for (let i = 0, len = words.length; i < len; i++) {
    let currentWord = words[i].replace(/[^а-яА-Я]/ig, '');
    let wordParts   = [];
    let prefixKeys  = Object.keys(CUSTOM_PREFIXES_END);
    let prefixEnd   = DEFAULT_PREFIX_END;
    let huifiedWord;
    let sIndex;

    if (!currentWord || currentWord.length <= 3) 
      continue;

    for (let k = 0, wlen = currentWord.length, lk = 0; k < wlen; k++) {
      let currentLetter = currentWord[k].toLowerCase();

      if (~LETTERS.indexOf(currentLetter)) {
        wordParts.push(currentWord.slice(lk, k + 1));

        lk = k + 1;
      }

      if (k + 1 === wlen) {
        let lastString = currentWord.slice(lk);

        if (lastString)
          wordParts.push(lastString);
      }
    }

    sIndex = wordParts.length <= 3 ? 0 : 1;

    for (let k = 0, wlen = wordParts[sIndex].length; k < wlen; k++) {
      let currentLetter = wordParts[sIndex][k].toLowerCase();

      if (~prefixKeys.indexOf(currentLetter)) 
        prefixEnd = CUSTOM_PREFIXES_END[currentLetter];
    }

    huifiedWord = ADDING + prefixEnd + wordParts.slice(sIndex + 1).join('');

    if (currentWord === currentWord.toUpperCase()) 
      huifiedWord = huifiedWord.toUpperCase();

    if (huifiedWord.length === 3) 
      continue;

    words[i] = words[i].replace(currentWord, currentWord + '-' + huifiedWord);
  }

  // Собираем слова обратно в текст
  words = words.join(' ');

  // Ни одно слово не хуифицировалось, ничего не отправляем
  if (argText === words) 
    return callback(null);

  return callback(null, words);
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['хуификатор'], 
  description: 'Хуификатор текста.', 
  use: '/hf <текст>', 

  run
}