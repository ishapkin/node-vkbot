'use strict';

/**
 * Modules
 * @private
 */
const crypto = require('crypto');
const prequest = require('request-promise');
const fs = require('fs');
const querystring = require('querystring');
const xml2js = require('xml2js');

/**
 * @protected
 */
const SERVICE_URL = 'https://asr.yandex.net/asr_xml';

const TEST_AUDIO_FILE = __dirname + '/../resources/94e9172df8.ogg';

function recognize(audio_file, chunked = false) {
  const API_KEY = module.exports.settings.api_key;
  let hash = crypto.createHash('md5').update(new Date().toString() + Math.random()).digest('hex');

  let data = {
    uuid: hash.substr(0, 32), //'01ae13cb744628b51fb536d496daa1e7',
    key: API_KEY,
    topic: 'general',
    lang: 'ru-RU'
  };

  let headers = {
    //'Content-Type': 'audio/x-wav'
    'Content-Type': 'audio/ogg;codecs=opus'
  };

  let file = fs.ReadStream(audio_file, { highWaterMark: 16 * 1024 });
  let url = SERVICE_URL + '?' + querystring.stringify(data);

  return new Promise(function(resolve, reject) {
    if (!API_KEY) {
      reject({
        errors: true,
        response: 'No api key found'
      });
    }

    // @fixme: Doesn't work :(
    if (chunked) {
      let prom = new Promise(function (resolve_inner, reject_inner) {
        let crlfBuf = Buffer.from([0x0D, 0x0A]);

        headers['Transfer-Encoding'] = 'chunked';

        file.on('data', (chunk) => {
          prom = prom.then(() => {
            let length = Buffer.from(Number(chunk.length).toString(16)); // Length
            let _body = Buffer.concat([
              length,
              crlfBuf,
              chunk,
              crlfBuf
            ]);

            return new Promise(function(_rv, _rj) {
              console.log('HTTP Request start chunked');
              let _headers = headers;
              _headers['Content-Length'] = _body.length;

              prequest.post({
                uri: url,
                headers: _headers,
                body: _body,
              }).then(r => {
                xml2js.parseString(r, function(err, result) {
                  let a = 1;
                  _rv(r);
                });
              }).catch((error) => {
                _rj(error);
              });
            });
          });
        });

        file.on('end', () => {
          console.log('File reading finished');
          prom.then(() => {
            return prequest.post({
              uri: url,
              headers: headers,
              body: "0\r\n\r\n"
            }).then((response) => {
              console.log('Request zero block success');
              resolve({
                errors: null,
                response
              });
            });
          }).catch((response) => {
            console.log('Request zero block error');
            resolve({
              errors: true,
              response
            });
          });

          resolve_inner();
        });
      });


    }
    else {
      let file_binary = Buffer.alloc(0);
      file.on('data', (chunk) => {
        file_binary = Buffer.concat([file_binary, chunk]);
      });

      file.on('close', (info) => {
        headers['Content-Length'] = file_binary.length;
        prequest.post({
          uri: url,
          headers: headers,
          body: file_binary
        }).then((response) => {
          xml2js.parseString(response, function(err, result) {
            let text = '';
            if (err === null) {
              if (result.recognitionResults.$.success != 1) {
                text = 'Текст не может быть распознан :(';
              }
              else {
                let maxid = 0;
                for (var i=maxid+1; i<result.recognitionResults.variant.length; i++) {
                  let current = result.recognitionResults.variant[i];
                  if (current.$.confidence > result.recognitionResults.variant[maxid].$.confidence) {
                    maxid = i;
                  }
                }

                text = result.recognitionResults.variant[maxid]._;
              }

            }
            else {
              text = 'Не могу распарсить ответ от сервера. Что-то явно не так...';
            }

            resolve({
              errors: null,
              response: text
            });
          });

        }).catch((response) => {
          resolve({
            errors: true,
            response
          });
        });
      });
    }
  });
}

module.exports = {
  settings: {
    api_key: null,
  },
  recognize,
  recognize_test: function() {
    return recognize(TEST_AUDIO_FILE, false).then((response) => {
      let a = 1;
    });
  }
}
