'use strict';

/**
 * Module dependencies
 * @private
 */
const config = require('../config');
const server = require('http').createServer();
const url    = require('url');

server
  .on('request', function (request, response) {
    let data = '';

    if (url.parse(request.url).pathname !== '/vk') 
      return;

    request
      .setEncoding('utf8')
      .on('data', chunk => {
        data += chunk;
      })
      .on('end', () => {
        let dataJson = null;

        try {
          dataJson = JSON.parse(data);
        } catch (e) {
          dataJson = {};
        }

        // Ответим ВКонтакте, что запрос обработан, чтобы он не посылал его снова
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('ok');
        response.end();
      });
  })
  .listen(8080);