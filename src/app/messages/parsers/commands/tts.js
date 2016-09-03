'use strict';

/**
 * Module dependencies
 * @private
 */
const apiKeys  = require('../../../../config').api.ivona;
const aws4     = require('aws4');
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const MIN_LENGTH     = 140;
const MAX_LENGTH     = 320;
const MAX_LENGTH_PRO = 500;
const RU_CHAR_CODES  = [1072, 1103, 1105]; // а, я, ё (lowercase)
const DEFAULTS       = {
  femaleSwitchers: ['-f', '-female', '-ж'], 
  ivona: {
    ru: {
      male: { Name: 'Maxim', Language: 'ru-RU', Gender: 'Male' }, 
      female: { Name: 'Tatyana', Language: 'ru-RU', Gender: 'Female' }
    },
    en: {
      male: { Name: 'Brian', Language: 'en-GB', Gender: 'Male' }, 
      female: { Name: 'Amy', Language: 'en-GB', Gender: 'Female' }
    }
  }
};

/**
 * Определяет, на русском ли языке написан переданный текст. 
 * Считается, что язык текста - русский, если букв алфавита русского языка в тексте >= 50%.
 * [*] При расчёте удаляются все спец. символы, пробелы и цифры из строки.
 * @param  {String}  text
 * @return {Boolean}
 * @private
 */
function detectRULang (text) {
  if (typeof text !== 'string') 
    return false;

  // Удаляем спец. символы, пробелы и цифры.
  text = text.toLowerCase().replace(/[\s!"#\$%&'\(\)\*\+,\-\.\/\d:;<=>\?@\[\\\]\^_`\{\|\}~]/g, '');

  let textLength = text.length;
  let ruSymbCount = 0;

  // В тексте одни лишь спец. символы, пробелы и цифры => считаем его русским.
  if (textLength === 0) 
    return true;

  for (let i = 0; i < textLength; i++) {
    let symCode = text[i].charCodeAt(0);

    if (symCode >= RU_CHAR_CODES[0] && symCode <= RU_CHAR_CODES[1] || symCode === RU_CHAR_CODES[2]) 
      ruSymbCount++;
  }

  return (ruSymbCount / textLength) >= 0.5;
}

/**
 * Возвращает время и дату озвучки
 * @return {String}
 * @private
 */
function getRecordDate () {
  let date = new Date();

  let hours   = date.getHours();
      hours   = hours.length === 1 ? ('0' + hours) : hours;
  let minutes = date.getMinutes();
      minutes = minutes.length === 1 ? ('0' + minutes) : minutes;
  let day     = date.getDate();
  let month   = date.getMonth() + 1;
  let year    = date.getFullYear();

  return `${hours}:${minutes}, ${day}.${month}.${year}`;
}

/**
 * Озвучивает текст
 * @param  {String} text
 * @return {Readable Stream}
 * @private
 */
function createSpeech (text, voice) {
  let body = JSON.stringify({
    // Входные данные
    Input: {
        // Текст для озвучки
        Data: text
    },

    // Настройки озвучки
    Voice: voice
  });

  let signed = aws4.sign({
    path:     '/CreateSpeech', 
    hostname: 'tts.eu-west-1.ivonacloud.com', 
    service:  'tts', 
    method:   'POST', 
    region:   'eu-west-1', 
    headers:  {
      'Content-Type': 'application/json'
    }, 
    body
  }, apiKeys);

  // Озвучиваем текст
  return prequest.post({
    uri: 'https://tts.eu-west-1.ivonacloud.com/CreateSpeech', 
    headers: signed.headers, 

    // Кодировка null обязательна, т.к. работаем с бинарным контентом
    encoding: null, 
    body
  });
}

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText   = arg.fullText;
  let firstWord = arg.firstWord;
  let argObj    = arg.source;
  let VK        = argObj._vkapi;

  let gender = 'male';
  let lang   = 'ru';
  let title  = 'Recorded at ' + getRecordDate();
  let limit  = argObj.permissionsMask >= 3 ? MAX_LENGTH_PRO : MAX_LENGTH;

  // Текст для озвучки не задан, либо длина текста маленькая
  if (argText === null || argText && argText.length < MIN_LENGTH) 
    return callback(null);

  // Озвучка женским голосом
  if (~DEFAULTS.femaleSwitchers.indexOf(firstWord)) {
    gender = 'female';
    argText = argText.slice(firstWord.length + 1);
  }

  // Убираем озвучку перевода на новую строку и обрезаем текст
  argText = argText.replace(/<br>/g, ' ').slice(0, limit);

  // В тексте русских символов меньше 50%? Озвучиваем английским голосом
  if (!detectRULang(argText)) 
    lang = 'en';

  // Озвучиваем текст
  return createSpeech(argText, DEFAULTS.ivona[lang][gender])
    // Получаем в ответ readable steam
    .then(audioBuffer => {
      // Загружаем аудиозапись в ВКонтакте
      return VK.upload('audio', {
        // Данные для загрузки
        data: {
          value: audioBuffer, 
          options: {
            filename: `file_${Date.now()}.mp3`, 
            contentType: 'audio/mpeg'
          }
        }, 

        // После загрузки меняем название аудиозаписи
        afterUpload: {
          artist: 'Text-to-Speech', 
          title
        }
      });
    })
    // Обрабатываем ответ
    .then(response => {
      return callback(null, {
        attachments: 'audio' + response.owner_id + '_' + response.id
      });
    })
    // Обрабатываем возникающие ошибки
    .catch(error => {
      // "Copyright errors"
      if (error.name === 'VKApiError' && error.code === 270) 
        return callback(null, 'Не удалось загрузить аудиозапись, т.к. она <<нарушет авторские права>>. Попробуйте сделать другой запрос.');

      return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
    });
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['скажи'], 
  description: `Озвучивает указанный текст.\nДлина текста: от ${MIN_LENGTH} до ${MAX_LENGTH} символов.`, 
  use: `/tts [${DEFAULTS.femaleSwitchers.join(' | ')}] <текст>`, 

  run
}