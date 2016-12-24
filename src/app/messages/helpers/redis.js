'use strict';

/**
 * Module dependencies.
 * @private
 */
const redis     = require('redis');
const bluebird  = require('bluebird');
const config  = require('../../../config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @return RedisClient
 */
function getRedis() {
  let hRedisClient = null; // Initialize singleton
  //if (hRedisClient === null) {
    hRedisClient = redis.createClient(config.redis);
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
