Каждая команда должна возвращать объект вида:

{
  // Статус команды (активна или нет)
  enabled: Boolean, 

  // Уникальность команды
  // false   - доступна как в ЛС, так и в мультичатах
  // 'pm'    - доступна только в ЛС
  // 'mchat' - доступна только в мультичатах
  unique:  Boolean / String, 

  // ./middlewares/permissions.js
  mask: Number,

  // Алиасы команды (без "/" или "@")
  aliases: Array, 

  // Описание команды
  description: String, 

  // Пример вызова команды
  use: String, 

  // Функция команды
  run: Function (arg, callback)
}