// Кикает пользователей [userIds] из беседы chatId

// String: ID пользователей через запятую
var userIds = Args.user_ids.split(",");

// Number: ID беседы
var chatId  = Args.chat_id;

// Array: Пользователи, которые не были кикнуты
var notKicked;

// Кикнуть можно не более 25 пользователей за раз
if (userIds.length > 25) {
  notKicked = userIds.splice(25, userIds.length);
}

// Кикаем пользователей
while (userIds.length > 0) {
  API.messages.removeChatUser({ chat_id: chatId, user_id: userIds.pop() });
}

// Возвращаем true либо список пользователей, которые не были кикнуты
return !notKicked || notKicked;