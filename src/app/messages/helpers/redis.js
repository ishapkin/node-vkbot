'use strict';

/**
 * Module dependencies.
 * @private
 */
let redis     = require('redis');
const config  = require('../../../config');
let hRedisClient     = null; // Initialize singleton

/**
 * @return RedisClient
 */
function getRedis() {
  if (hRedisClient === null) {
    hRedisClient = redis.createClient(config.redis);
    hRedisClient.on("error", function (err) {
      console.log("Error " + err);
      exit(1);
    });
  }

  return hRedisClient;
}

module.exports = {
  getRedis
};
