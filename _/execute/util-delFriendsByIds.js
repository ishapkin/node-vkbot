// Удаляет друзей [userIds] текущего пользователя

// String: Список ID друзей через запятую
var userIds = Args.user_ids.split(",");

// Удаляем друзей
while (userIds.length > 0) {
  API.friends.delete({ user_id: userIds.pop() });
}

return true;