'use strict';

/**
 * Module dependencies
 * @private
 */
const config    = require('../config')['vk-group'];
const processor = require('./processor');
const server    = require('http').createServer();
const url       = require('url');

server
  .on('request', function (request, response) {
    let data     = '';
    let pathname = url.parse(request.url).pathname;

    // Обрабатываем запросы, пришедшие на /vkcallback
    if (pathname !== '/vkcallback') {
      response.writeHead(400);
      response.end();

      return;
    }

    request
      .setEncoding('utf8')
      .on('data', chunk => {
        data += chunk;
      })
      .on('end', () => {
        let dataJson;

        try {
          dataJson = JSON.parse(data);
        } catch (e) {
          dataJson = {};
        }

        // Ответим ВКонтакте, что запрос обработан
        response.writeHead(200, { 'Content-Type': 'text/plain' });

        // Подтвердим адрес сервера, если нужно
        if (dataJson.type === 'confirmation') 
          response.write(config.confirm);
        else
          response.write('ok');

        response.end();

        // Код secret не совпадает
        if (dataJson.secret !== config.secret) 
          return;

        // Обработаем полученные данные
        processor(dataJson);
      });
  })
  .listen(8084);
