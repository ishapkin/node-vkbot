'use strict';

/**
 * Module dependencies
 * @private
 */
const prequest = require('request-promise');
/**
 * Local constants
 * @private
 */
const PUBLIC_INFO = {
  //id: -123, // id has priority
  domain: '21jqofa'
};

/**
 * Run command
 * @param  {Arguments}  arg
 * @param  {Function}   callback
 * @public
 */
function run (arg, callback) {
  let argText   = arg.fullText;
  let firstWord = arg.firstWord;
  let argObj    = arg.source;
  let VK        = argObj._vkapi;

  // Subsets with multipliers
  let subsets = {
    'newest': 1,
    'new': 2,
    'old': 3,
    'oldest': 4
  };

  // Fallback to newest
  let subset = String(firstWord).length == 0 ? 'newest' : firstWord;

  // Check if subset correctly chosen
  if (!subsets[subset]) {
    // Russian aliases for subsets
    let aliases = {
      'newest': ['новее', 'нове', 'новейшее'],
      'new': ['новое', 'нов', 'нового'],
      'old': ['старое', 'стар'],
      'oldest': ['старше', 'древнее', 'динозавры', 'динозавр', 'старейшее', 'старее']
    };

    for (var name in aliases) {
      // Check if we have array
      if (aliases[name][0] === undefined) {
        continue;
      }

      if (aliases[name].indexOf(subset) !== -1) {
        subset = name;
        break;
      }
    }

    if (!subsets[subset]) {
      subset = 'newest';
    }
  }

  let params = PUBLIC_INFO;
  params.count = 1;
  params.filter = 'owner';
  params.offset = 0;
  VK.call('wall.get', params).then(response => {
    if (!response.count) {
      return new Promise.reject('Error requesting count of public records');
    }

    let count = response.count;

    let items_per_subset = Math.floor(count / 4);

    // We consider that maximum items to get from public is 0.5% of items per subset
    let items_max_count = items_per_subset * 0.005; // @fixme: Move to config

    // Find random min and max value to use
    let offset_min = items_per_subset * (subsets[subset] - 1);
    // For newest items we add count of remaining items if there are some
    let offset_max = items_per_subset * subsets[subset] + ((subsets[subset] == 1) ? count % 4 : 0);

    params.count = items_max_count <= 100 ? items_max_count : 100; // Adjust maximum items to get (VK api limit)
    params.offset = Math.round(Math.random() * (offset_max - offset_min)) + offset_min;
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        return resolve();
      }, 500);
    }).then(() => {
      VK.call('wall.get', params).then(response => {
        let max_id = 0;
        for (var i=max_id+1; i<response.items.length; i++) {
          let likes_count = response.items[i].likes.count || 0;
          let likes_count_maxid = response.items[max_id].likes.count || 0;
          if (likes_count > likes_count_maxid) {
            max_id = i;
          }
        }

        let post = response.items[max_id];
        return callback(null, {
          attachments: 'wall' + post.owner_id + '_' + post.id
        });
      });
    });
  }).catch(error => {
    return callback(error, "Произошла ошибка :(");
  });
}

module.exports = {
  enabled: true,
  unique:  false,
  mask: 0,

  aliases:     ['че'],
  description: 'Выдает случайный пост с паблика "че" https://vk.com/21jqofa. Если не задан второй параметр,' +
  ' по умолчанию ищет среди самых новых записей (новее).',
  use:         '/che [новее|новое|старое|старейшее]',

  run
}
