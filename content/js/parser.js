const xss = require('xss');

const strongRegex = /\*([\s\S]+?)\*(?!\*)/g;
const italicRegex = /_([\s\S]+?)_(?!_)/g;
const urlRegex = /\[([\s\S]+?)\](?!\])\(([\s\S]+?)\)(?!\))/g;
const inlinecodeRegex = /(`)\s*([\s\S]*?[^`])\s*\1(?!`)/g;
const blockcodeRegex = /(```)\s*([\s\S]*?[^`])\s*\1(?!```)\n?/g;
const linkRegex = /\((.*)\)/g;
const titleRegex = /\[(.*)\]/g;

function parser(params={mode: 'markdown', data: ''}) {
  let mode = params.mode;
  let data = params.data;

  if (mode === 'markdown') {
    data = $('<i>').text(data).html()
    data = data
      .replace(blockcodeRegex, (sub) => {
        let code = sub.substring(3, sub.length - 4);
      
        return `<pre class="preview-code">${code}</pre>`;
      })
      .replace(inlinecodeRegex, (sub) => {
        let code = sub.substring(1, sub.length - 1);

        return `<pre class="preview-code-inline">${code}</pre>`;
      })
      .replace(urlRegex, (sub) => {
        let link = sub.match(linkRegex)[0];
        link = link.substring(1, link.length - 1);

        let title = sub.match(titleRegex)[0];
        title = title.substring(1, title.length - 1);

        return `<a href="${link}">${title}</a>`;
      })
      .replace(italicRegex, (sub) => {
        let text = sub.substring(1, sub.length - 1);

        return `<i>${text}</i>`;
      })
      .replace(strongRegex, (sub) => {
        let text = sub.substring(1, sub.length - 1);

        return `<b>${text}</b>`;
      });

      return data;
  } else if (mode === "HTML") {
    return xss(data, {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'code', 'pre' ],
      whiteList: {
        b: [],
        i: [],
        em: [],
        strong: [],
        code: [],
        pre: [],
        a: ['href']
      }
    })
  }
}

module.exports = parser;