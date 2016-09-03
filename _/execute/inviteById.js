// Приглашет пользователя в беседу по его ID

// Number: ID беседы
var chatId = Args.chat_id;

// String: Никнейм пользователя (e.g. "durov", "id1")
var userId = Args.user_id;

// Получаем ID пользователя из его никнейма
var id = API.utils.resolveScreenName({ screen_name: userId });

if (id.type == "user") {
  userId = id.object_id;
} else {
  return "Something went wrong..";
}

return API.messages.addChatUser({ chat_id: chatId, user_id: userId });