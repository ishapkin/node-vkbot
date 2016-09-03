'use strict';

/**
 * Информация об аккаунтах
 */

module.exports = {
  // ID бота
  "<bot_id>": {
    // Условие, при котором бот принимает заявки в друзья. 
    // Варианты:
    //   0. false либо отсутствие данного свойства: бот принимает всех;
    //   1. public_followed: бот принимает тех, кто вступил в группу
    "_cond": "<condition>", 

    // Данные для авторизации
    "auth":  {
      "login": "<bot_login>", 
      "pass":  "<bot_password>", 
      "phone": "<bot_phone> (if exists)"
    }
  }
}