'use strict';

/**
 * Файл настроек приложения
 */

module.exports = {
  api: {
    // Сервис для распознавания капчи
    captcha: {
      service: '<service>', // rucaptcha, antigate, etc.
      key:     '<api_key>'
    }, 

    // Данные аккаунта cleverbot
    cleverbot: {
      login:    '<login>', 
      password: '<password>'
    }, 

    // Сервис для определения эмоций на лице
    // https://www.microsoft.com/cognitive-services/en-us/subscriptions
    emotions: '<api_key>', 

    // ivona.com
    ivona: {
      accessKeyId:     '<access_key>',
      secretAccessKey: '<secret_key>'
    }, 

    // openweathermap.com
    weather: '<api_key>'
  }, 

  friends:  {
    // Интервал проверки на новые заявки в друзья (в мс)
    'check-interval': 60 * 1000
  }, 

  messages: {
    // Паттерн, по которому определяется обращение к боту в беседе. 
    // Формат записи:
    //   <bot_id>: regexp
    // 
    // Например:
    //   'bot-patterns': {
    //     412342453: /^бот[\s,]/i
    //   }
    //   
    // 'default'-паттерн будет использован в том случае, если паттерна для текущего бота нет
    'bot-patterns': {
      'default': /^[bб][oо][tт][\s,]/i
    }, 

    // Задержка между отправкой сообщений (ms)
    delay: 3333
  }, 

  // Приложение ВКонтакте, через которое идут запросы к API
  'vk-app': {
    id:     <app_id>,      // Number
    secret: '<app_secret>' // String
  }, 

  // Данные для обработки и отправки сообщений в сообщениях сообщества
  'vk-group': {
    confirm: '<confirm_key>', 
    secret:  '<secret_key>', 
    token:   '<access_token>'
  }
}