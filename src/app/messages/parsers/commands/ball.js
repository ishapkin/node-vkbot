'use strict';

/**
 * Module dependencies
 * @private
 */
const randomElem = require('./helpers/random-elem');

/**
 * Local constants
 * @private
 */
const VARIANTS = [
  'Бесспорно', 
  'Предрешено', 
  'Никаких сомнений', 
  'Определённо да', 
  'Можешь быть уверен в этом', 

  'Мне кажется — «да»', 
  'Вероятнее всего', 
  'Хорошие перспективы', 
  'Знаки говорят — «да»', 
  'Да', 

  'Пока не ясно, попробуй снова', 
  'Спроси позже', 
  'Лучше не рассказывать', 
  'Сейчас нельзя предсказать', 
  'Сконцентрируйся и спроси опять', 

  'Даже не думай', 
  'Мой ответ — «нет»', 
  'По моим данным — «нет»', 
  'Перспективы не очень хорошие', 
  'Весьма сомнительно'
];

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  // Не указано никакого текста, поэтому и отвечать не на что
  if (arg.fullText === null) 
    return callback(null);

  // Возвращаем случайную фразу из списка вариантов
  return callback(null, randomElem(VARIANTS));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['шар', 'предскажи'], 
  description: 'Магический шар предсказаний (Magic 8 Ball). Просто задайте ему интересующий вас вопрос.', 
  use:         '/ball <вопрос>', 

  run
}