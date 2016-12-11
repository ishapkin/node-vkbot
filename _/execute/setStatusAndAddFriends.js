// 1. Удаление исходящих заявок
// 2. Подтверждение входящих заявок
// 3. Поддержка онлайна
// 4. Установка статуса (Онлайн / Оффлайн)

// String: "on" || "off"
var status        = Args.status;
var requestsCount = 10;

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

// Узнаем, сколько друзей у бота
var friendsCount = API.friends.get({ count: 1 }).count;

// Получаем список юзеров, на которых бот подписан
var requestsOut = API.friends.getRequests({ count: 10, out: 1 }).items;

// Если исходящих заявок менее 10, то можно добавить больше друзей
if (requestsOut.length < 10) {
  requestsCount = requestsCount + (10 - requestsOut.length);
}

// Получаем список заявок в друзья
var requestsIn = API.friends.getRequests({ count: requestsCount, sort: 0 }).items;

// Рассчитаем, сколько друзей бот сможет принять
var acceptCount = 10000 + requestsOut.length - friendsCount;

// Отменяем исходящие заявки
while (requestsOut.length > 0) {
  API.friends.delete({ user_id: requestsOut.shift() });
}

// Принимаем заявки в друзья
while (acceptCount > 0 && requestsIn.length > 0) {
  API.friends.add({ user_id: requestsIn.shift() });
  acceptCount = acceptCount - 1;
}

return "ok";