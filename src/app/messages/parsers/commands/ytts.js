'use strict';

/**
 * Module dependencies
 * @private
 */
const apiKeys  = require('../../../../config').api.yandex;
const prequest = require('request-promise');
const service_url = 'https://tts.voicetech.yandex.net/generate'; //?format=mp3&lang=ru-RU&speaker=oksana&key=8aaaf977-d6a6-4663-9838-beaf5c7b3fd4&emotion=evil&speed=1';
// const delayed  = require('delayed');

/**
 * Local constants
 * @private
 */
const MIN_LENGTH     = 5;
const MAX_LENGTH     = 1000;
const MAX_LENGTH_PRO = MAX_LENGTH;
const RU_CHAR_CODES  = [1072, 1103, 1105]; // а, я, ё (lowercase)
const DEFAULTS       = {
  femaleSwitchers: ['-f', '-female', '-ж'],
  voices: {
    ru: {
      langcode: 'ru-RU',
      male: ['zahar', 'ermil'],
      female: ['jane', 'oksana', 'alyss', 'omazh']
    },
    en: {
      langcode: 'en-US',
      male: ['zahar', 'ermil'],
      female: ['jane', 'oksana', 'alyss', 'omazh']
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
function createSpeech (text, lang, speaker) {
  // Озвучиваем текст
  return prequest.get({
    uri: service_url,
    // ?format=mp3&lang=ru-RU&speaker=oksana&key=8aaaf977-d6a6-4663-9838-beaf5c7b3fd4&emotion=evil&speed=1';
    qs: {
      text: text,
      format: 'mp3',
      lang: DEFAULTS.voices[lang].langcode,
      speaker: speaker,
      key: apiKeys.speech_cloud,
      emotion: 'neutral', // @todo: Configurable via parameters|switchers
      speed: 0.7 // @todo: Configurable via parameters|switchers
    },

    // Кодировка null обязательна, т.к. работаем с бинарным контентом
    encoding: null
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

  let speaker = DEFAULTS.voices[lang][gender][0]; // @todo: Choose speaker according to switchers
  // Озвучиваем текст
  return createSpeech(argText, lang, speaker)
    // Получаем в ответ readable steam
    .then(audioBuffer => {
      // Загружаем аудиозапись в ВКонтакте
      return VK.upload('document', {
        // Данные для загрузки
        data: {
          value: audioBuffer,
          options: {
            filename: `file_${Date.now()}.mp3`,
            contentType: 'audio/mpeg'
          }
        },

        beforeUpload: {
          type: 'audio_message'
        }
      });
    })
    // Обрабатываем ответ
    .then(response => {
      return callback(null, {
        attachments: 'doc' + response[0].owner_id + '_' + response[0].id
      });
    })
    // Обрабатываем возникающие ошибки
    .catch(error => {
      return callback(error, 'Произошла неизвестная ошибка. Повторите запрос позже.');
    });
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['яскажи', 'япиздани', 'ясмолви'],
  description: `Озвучивает указанный текст, используя Яндекс.SpeechKit.\nДлина текста: от ${MIN_LENGTH} до ${MAX_LENGTH} (до ${MAX_LENGTH_PRO} для VIPов) символов.`,
  use: `/ytts [${DEFAULTS.femaleSwitchers.join(' | ')}] <текст>`,

  run
}
