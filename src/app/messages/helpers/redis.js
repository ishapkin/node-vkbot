'use strict';

/**
 * Module dependencies.
 * @private
 */
const Redis     = require('ioredis');
const config  = require('../../../config');

/**
 * @return Redis
 */
function getRedis() {
  let hRedisClient = null; // Initialize singleton
  //if (hRedisClient === null) {
    hRedisClient = new Redis(config.redis);
    hRedisClient.on("error", function (err) {
      console.log("Error " + err);
      exit(1);
    });
  //}

  return hRedisClient;
}

module.exports = {
  getRedis
};
