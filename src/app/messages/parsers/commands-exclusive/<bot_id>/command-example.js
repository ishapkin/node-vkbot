'use strict';

/**
 * Just command example
 */

function run (arg, callback) {
  return callback(null, 'Result');
}

module.exports = {
  enabled: true, 
  unique:  false, 
  mask: 0, 

  aliases:     ['alias1', 'alias2'], 
  description: 'Description', 
  use:         '/command <argument>', 

  run
}