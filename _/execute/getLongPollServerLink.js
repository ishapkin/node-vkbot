// Получает данные для подключения к Long Poll серверу
// Возвращает готовый URL

var params = API.messages.getLongPollServer();
var link   = "https://" + params.server + 
             "?act=a_check&wait=25&mode=2" + 
             "&key=" + params.key + 
             "&ts=" + params.ts;

return link;