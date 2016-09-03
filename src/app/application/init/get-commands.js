'use strict';

/**
 * Получение списка доступных команд для текущего бота
 */

/**
 * Module dependencies
 * @private
 */
const fs   = require('fs');
const path = require('path');

/**
 * Возвращает объект { <Команда>: { <Объект команды> } }
 * @param  {String} dir Название папки, где находятся команды
 * @private
 */
function getCommandFiles (dir) {
  let cmdPath = path.join(process.cwd(), './app/messages/parsers/', dir);
  let files   = fs.readdirSync(cmdPath);
  let output  = {};

  for (let i = 0, len = files.length; i < len; i++) {
    let current = files[i];

    if (!current.endsWith('.js') || current.startsWith('_')) 
      continue;

    let filename = current.slice(0, -3);
    let file = require(path.join(cmdPath, filename));

    output[filename] = file;
  }

  return output;
}

/**
 * Фильтрует объекты команд: отсеивает выключенные и те, которые не экспортируют функцию в <cmd>.run.
 * @param  {Object} cmdObject Объект полученных команд
 * @return {Array}            Массив отфильтрованных команд
 * @private
 */
function filterCommands (cmdObject) {
  /**
   * Формат записи данных:
   *   {
   *     command: <Название команды>, 
   *     <Объект, возвращаемый из файла команды> (aliases, unique, run, description, use, mask)
   *   }
   */
  let output = [];

  for (let i = 0, keys = Object.keys(cmdObject), len = keys.length; i < len; i++) {
    let current = cmdObject[keys[i]];

    if (current.enabled && typeof current.run === 'function') {
      let objToPush = Object.assign({ command: keys[i] }, current);

      delete objToPush.enabled;

      output.push(objToPush);
    }
  }

  return output;
}

/**
 * Возвращает массив команд для текущего бота
 * @param  {Number} botId ID бота
 * @return {Array}
 * @public
 */
function getCommands (botId) {
  let commands_    = filterCommands(getCommandFiles('commands'));
  // let exclusive_ = filterCommands(getCommandFiles('commands-exclusive/' + botId));
  // commands_ = commands_.concat(exclusive_);

  return commands_;
}

module.exports = getCommands;