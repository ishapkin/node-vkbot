'use strict';

/**
 * Module dependencies
 * @private
 */
const apiKey   = require('../../../../config').api.weather;
const prequest = require('request-promise');

/**
 * Local constants
 * @private
 */
const SERVICE_URL   = 'http://api.openweathermap.org/data/2.5/weather';
const UNKNOWN_ERROR = 'Произошла неизвестная ошибка. Попробуйте получить погодные данные немного позже.';
const WEATHER_EMOJI = {
  'пасмурно':       '😒', 
  'ясно':           '😊', 
  'слегка облачно': '😏', 
  'легкий дождь':   '😑',
  'облачно':        '☁️'
}

/**
 * Преобразует ответ сервера OpenWeatherMap в текстовое сообщение
 * @param {Object} apiResponse
 * @private
 */
function apiResToText (apiResponse) {
  let res = apiResponse;

  // Краткое описание погоды (облачно, ясно, etc.) и смайл к нему
  let desc  = res.weather[0].description;
  let emoji = WEATHER_EMOJI[desc] || '';

  // Город и страна
  let city    = res.name;
  let country = res.sys.country;

  // Температура
  let temp = Math.round(res.main.temp);
      temp = temp > 0 ? `+${temp}` : temp;

  // Влажность и ветер
  let hum  = res.main.humidity;
  let wind = res.wind.speed;

  return `Сейчас ${desc} ${emoji} (${city}, ${country})\n\n` + 
         `🌡 Температура: ${temp} °C\n` + 
         `💧 Влажность: ${hum}%\n` + 
         `🎐 Ветер: ${wind} м/с`;
}

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let city = arg.fullText;

  // Не указан город, не отвечаем ничего
  if (city === null) 
    return callback(null);

  // Обрезаем названия городов до 80 символов
  city = city.slice(0, 80);

  return prequest(SERVICE_URL, {
      // Устанавливаем параметры запроса
      qs: {
        appid: apiKey, 
        q:     city, 
        type:  'accurate', 
        lang:  'ru', 
        units: 'metric'
      }, 

      // Парсим ответ в JSON
      json: true
    })
    // Обрабатываем ответ сервиса
    .then(response => {
      let message = response.message && response.message.toLowerCase() || null;

      // Произошла ошибка при получении погоды для указанного города
      if (message && ~message.indexOf('error')) {
        if (~message.indexOf('not found')) 
          // Город не найден
          return callback(null, 'Погодные данные не были получены. \nСкорее всего, вы ошиблись при написании названия города.');
        else 
          // Другая ошибка, "не известная" нам
          return callback(null, UNKNOWN_ERROR);
      }

      return callback(null, apiResToText(response));
    })
    // Обрабатываем возникающие ошибки
    .catch(error => callback(error, UNKNOWN_ERROR));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['погода'], 
  description: 'Вернёт данные о текущей погоде в указанном городе.', 
  use: '/weather <город>', 

  run
}