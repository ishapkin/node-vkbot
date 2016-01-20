'use strict';

const config = require('./config');

/**
 * Все описания к командам, которые выводятся по команде /help <название_команды>
 *
 * Формат записи данных:
 * <название_команды>: [<описание>, <аргументы>]
 */
const help = {
  create: [
    'Создает беседу со случайными друзьями бота.\n\nМаксимальное количество = ' + config.create.max, 
    '<количество>'
  ], 

  goaway: [
    'Выгоняет бота из чата. Он больше не вернется.', 
    ''
  ], 

  help: [
    cmds => 'Доступные команды:\n\n' + cmds + '\n\nПри вводе команд, символы "<", ">" вводить не надо.\n\nЧтобы получить помощь по определенной команде, напишите /help "название_команды" (без кавычек).\n\nБот имеет задержку в 7 секунд между отправкой сообщений, будьте терпеливы.', 
    '[<команда>]'
  ], 

  howhot: [
    'Определяет, насколько сексуален человек на фото. \n\nДля использования команды нужно прикрепить одно изображение, на котором есть одно лицо человека.', 
    '<изображение>'
  ], 

  howold: [
    'Определяет возраст человека на фото. \n\nДля использования команды нужно прикрепить одно изображение, на котором есть как минимум одно лицо человека.', 
    '<изображение>'
  ], 

  img: [
    'По введённому запросу находит изображение в Google.', 
    '<запрос>'
  ], 

  info: [
    'Определяет вероятность события, утверждения и т.д.', 
    '<текст>'
  ], 

  invite: [
    'Приглашает в беседу рандомных друзей.', 
    '<количество>'
  ], 

  klass: [
    'По введённому запросу находит изображение на сайте stavklass.ru\n\nИспользуйте <</klass random>>, чтобы получить случайное изображение.', 
    '<запрос>'
  ], 

  music: [
    'По введённому запросу находит музыку в ВКонтакте. \n\nМаксимальное количество песен = ' + config.search.music.max, 
    '<запрос> [<количество>]'
  ], 

  photo: [
    'По введённому запросу находит фотографии в ВКонтакте. \n\nМаксимальное количество фотографий = ' + config.search.photo.max, 
    '<запрос> [<количество>]'
  ], 

  tts: [
    'Озвучивает введённый вами текст.', 
    '<текст>'
  ], 

  video: [
    'По введённому запросу находит видео в ВКонтакте. \n\nМаксимальное количество видео = ' + config.search.video.max, 
    '<запрос> [<количество>]'
  ], 

  who: [
    'Выбирает случайного пользователя из беседы.', 
    '<текст>'
  ]
}

/**
 * Шаблоны для ответов при запросе команды /who
 */
const who = {
  answerWords: [
    'Я думаю, это ', 
    'Определенно, это ', 
    'Несомненно, это ', 
    'Мне кажется, что это '
  ], 

  noUsersAnswers: [
    'Не скажу.', 
    'Не хочу говорить.', 
    'У меня нет настроения тебе отвечать.'
  ]
}

module.exports = {
  help, 
  who
}