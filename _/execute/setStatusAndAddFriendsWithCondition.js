// 1. Удаление исходящих заявок
// 2. Подтверждение входящих заявок
// 3. Поддержка онлайна
// 4. Установка статуса (Онлайн / Оффлайн)

// String: "on" || "off"
var status        = Args.status;

// String: Условие добавления в друзья. 
//         Варианты:
//         1. public_followed
var condition     = Args.condition;
var requestsCount = 10;

// String: ID паблика
var publicId      = "botsforchats";

// Обновляем статус и время последней активности
if (status == "off") {
  API.account.setOffline();
  API.status.set({ text: "Offline" });

  // Был установлен статус "Оффлайн". Следовательно, ничего дальше не делаем
  return "off";
} else {
  API.account.setOnline();
  API.status.set({ text: "Online" });
}

// Получаем список юзеров, на которых бот подписан
var requestsOut = API.friends.getRequests({ count: 10, out: 1 }).items;

// Если исходящих заявок нет, то можно добавить больше друзей
if (requestsOut.length < 10) {
  requestsCount = requestsCount + (10 - requestsOut.length);
}

// Получаем список заявок в друзья
var requests = API.friends.getRequests({ count: requestsCount, sort: 0 }).items;

// Отменяем исходящие заявки
while (requestsOut.length > 0) {
  API.friends.delete({ user_id: requestsOut.shift() });
}

// Если есть заявки в друзья..
if (requests.length > 0) {
  // Проверяем условие "подписан на паблик" и добавляем в друзья. 
  // Те, кто условие не выполнил, будут отправлены в подписчики
  if (condition == "public_followed") {
    // Получаем список юзеров, которые подписаны на паблик
    var members = API.groups.isMember({ group_id: publicId, user_ids: requests + "" });

    // Принимаем заявки в друзья, если юзер подписан
    while (members.length > 0) {
      var member = members.shift();
    
      if (member.member == 1) {
          // Принимаем заявку в друзья
          API.friends.add({ user_id: member.user_id });
      } else {
          // Отклоняем заявку в друзья
          API.friends.delete({ user_id: member.user_id });
      }
    }
  }
}

return true;