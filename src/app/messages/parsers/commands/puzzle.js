'use strict';

/**
 * Module dependencies
 * @private
 */
const puzzles    = require('../../../../data/commands/puzzle');
const randomElem = require('./helpers/random-elem');

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  return callback(null, randomElem(puzzles));
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['загадка'], 
  description: 'Присылает рандомную загадку с ответом.', 
  use: '/puzzle', 

  run
}