// 1. Удаление исходящих заявок
// 2. Подтверждение входящих заявок
// 3. Поддержка онлайна
// 4. Установка статуса (Онлайн / Оффлайн)

// String: "on" || "off"
var status        = Args.status;
var requestsCount = 11;

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

// Принимаем заявки в друзья
while (requests.length > 0) {
  API.friends.add({ user_id: requests.shift() });
}

return true;