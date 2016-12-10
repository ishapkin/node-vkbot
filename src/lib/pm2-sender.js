'use strict';

const pm2 = require('pm2');

/**
 * @param  {String}   pname          Process name
 * @param  {Object}   messageObject  Message to send
 * @param  {String}   topic
 * @param  {Function} callback
 *   @arg  {Boolean}  isSent         true - message was sent successfully
 */
function sendMessage (pname, messageObject, topic, callback) {
  if (typeof topic === 'function') {
    callback = topic;
    topic    = 'not specified';
  }

  pm2.connect(error => {
    if (error) 
      return callback(false);

    pm2.list((error, list) => {
      if (error) 
        return callback(false);

      let pid = null;
      for (let i = 0, len = list.length; i < len; i++) {
        if (list[i].name === pname) 
          pid = list[i].pm_id;
      }

      if (pid === null) 
        return callback(false);

      pm2.sendDataToProcessId(pid, {
        type: 'process:msg',
        data: messageObject, 
        topic: topic || 'not specified'
      }, (error, response) => {
        if (error) 
          return callback(false);

        callback(response.success);
        pm2.disconnect();
      });
    });
  });
}

module.exports = sendMessage;