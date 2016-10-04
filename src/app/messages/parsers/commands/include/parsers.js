'use strict';

/**
 * Module dependencies
 * @private
 */
const cheerio = require('cheerio');
const qs      = require('querystring');

module.exports = {
  parseGoogleImgUrl (rbody) {
    return new Promise((resolve, reject) => {
      let $ = cheerio.load(rbody);

      // По запросу ничего не найдено
      if (/ничего не найдено/i.test($('#topbar').next('div').text())) 
        return resolve(null);

      function getImageUrl () {
        let imageNumber = 0;

        return function () {
          return qs.parse($('#images').find('a.image').eq(imageNumber++).attr('href').split('?')[1]).imgurl;
        }
      }

      let imageUrl = getImageUrl();

      return resolve(imageUrl);
    });
  }, 

  parseGoogleResults (responseBody) {
    return new Promise(resolve => {
      let $ = cheerio.load(responseBody);

      // По запросу ничего не найдено
      if (/ничего не найдено/i.test($('#topbar').next('div').text())) 
        return resolve(null);

      // Результаты парсинга помещаются сюда
      let result       = {
        text: '', 
        link: ''
      };

      let universalHtml = $('#universal').html();
      let onebox_first  = $('.onebox_result');
      let onebox        = $('.onebox_result', '#universal', universalHtml);
      let grouped       = $('.grouped_result', '#universal', universalHtml);
      let resultBlocks  = ['.web_result', '.video_result'];

      // Парсим блок .onebox_result, который находится на первом месте (над #universal). 
      // Пример запроса:
      //   2+2*2 (.onebox_result + #universal)
      //   sin(45) (.onebox_result + #universal)
      if (onebox_first.next().is('#universal')) {
        result.text = onebox_first.eq(0).text();

        return resolve(result);
      }

      // Парсим блок .onebox_result, если он есть.
      // Пример запроса: 
      //   сколько лет владимиру путину (> .onebox_result > .answer_*)
      //   подзалупный творожок (> .grouped_* > .onebox_result)
      if (onebox.length >= 1) {
        let element     = onebox.eq(0);
        let elementText = element.text();
        let answerBlock = element.find('.answer_value');

        // > .onebox_result > .answer_*
        if (answerBlock.length !== 0) {
          let answer      = answerBlock.eq(0).text();
          let description = element.find('.answer_description').eq(0).text();

          result.text = `${answer}\n${description}`;

          return resolve(result);
        }

        // ???
        if ((~elementText.indexOf('результаты по запросу') || ~elementText.indexOf('Введите место:')) && onebox.length >= 2) {
          result.text = 'Данный запрос не может быть сейчас обработан.';
          return resolve(result);
        }

        // Парсим заголовок результата
        let title = element.find('span').eq(0).text();

        // Удаляем лишние элементы: лэйблы, ссылки и пр.
        $('span, div', element).remove();

        // Парсим текст
        let text = element.text();

        result.text = `${title}\n${text}`;

        return resolve(result);
      }

      // IS NOT BEING PARSED CORRECTLY
      // Блоки с .grouped_result
      // Пример запроса: 
      //   кафе в москве
      //   путин (has links > break)
      if (grouped.length >= 1) {
        // Убедимся, что в рез-те нет сторонних ссылок
        if (!/^(?:\/url|http)/i.test(grouped.eq(0).find('a').eq(0).attr('href'))) {
          for (let i = 0, len = grouped.length; i < len; i++) {
            let title = grouped.eq(i).find('a').eq(0).text();
            let info  = grouped.eq(i).find('span').eq(0).text();

            result.text += `${title}\n${info}\n\n`;
          }

          return resolve(result);
        }
      }

      // Пробуем спарсить один из блоков resultBlocks
      // Пример запроса: 
      //   гугл википедия (.web_result)
      //   ларин видеочат youtube (.video_result)
      for (let i = 0, len = resultBlocks.length; i < len; i++) {
        let current = $(resultBlocks[i], '#universal');

        // Такого блока на странице нет
        if (current.length === 0) 
          continue;

        let element    = current.eq(0).find('div').eq(0).find('a').eq(0);
        let resultText = element.text();
        let resultUrl  = element.attr('href');
        let parsedUrl  = qs.parse(resultUrl.slice(5)).q; // slice for "/url?"

        result.text = resultText;

        if (~parsedUrl.indexOf('googleweblight.com')) 
          result.link = qs.parse(parsedUrl.split('?')[1]).lite_url;
        else
          result.link = parsedUrl;

        return resolve(result);
      }

      // Никаких результатов нет
      return resolve(null);
    });
  }, 

  parseStavKlassImgUrl (rbody) {
    return new Promise((resolve, reject) => {
      let $ = cheerio.load(rbody);
      let image = $('a.image');

      if (image.length === 0) 
        return reject(new Error('Не удалось спарсить изображение'));

      let imageUrl = image.eq(0).find('img').attr('src');

      return resolve(imageUrl);
    });
  }
}