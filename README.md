
> Chat-bots on vk.com →
> [Чат-боты](https://vk.com/botsforchats) &nbsp;&middot;&nbsp;
> [Список команд](https://vk.com/page-110327182_51316051) &nbsp;&middot;&nbsp;
> [FAQ](https://vk.com/page-110327182_51827803)


## Установка

Установить сначала nodejs 6.0 или выше https://nodejs.org/en/download/package-manager/
Проверить версию nodejs можно 
   
    $ node -v
    
или
   
    $ nodejs -v
    
Далее клонируем и устанавливаем зависимости через npm
   
    $ git clone https://github.com/olnaz/node-vkbot.git
    $ cd node-vkbot
    $ npm i
      
Копируем файлы настроек
    
    $ cp src/accounts.default.js _/build/accounts.js
    $ cp src/config.default.js _/build/config.js
    
И редактируем их, как написано в самих файлах.
    
Далее билдим версию для запуска
    
    $ bash ./build.sh
    
И пытаемся запустить (назодясь в корневой папке проекта)
    
    $ npm run start
    
и проверяем, все ли хорошо
    
    $ pm2 status
