const plugin = require('./modules/yandex_speech_recognition');


plugin.settings.api_key = require('../build/config').api.yandex.speech_cloud;
plugin.recognize_test().then((response) => {
  let a = 1;
});
