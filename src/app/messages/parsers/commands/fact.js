'use strict';

/**
 * Module dependencies
 * @private
 */
const facts      = require('../../../../data/commands/fact');
const randomElem = require('./helpers/random-elem');

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  return callback(null, randomElem(facts));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['факт'], 
  description: 'Присылает интересный факт.', 
  use: '/fact', 

  run
}