const xss = require('xss');

const strongRegex = /\*([\s\S]+?)\*(?!\*)/g;
const italicRegex = /_([\s\S]+?)_(?!_)/g;
const underlineRegex = /__([\s\S]+?)__(?!__)/g;
const strikethroughRegex = /~([\s\S]+?)~(?!~)/g;
const urlRegex = /\[([\s\S]+?)\](?!\])\(([\s\S]+?)\)(?!\))/g;
const inlinecodeRegex = /(`)\s*([\s\S]*?[^`])\s*\1(?!`)/g;
const blockcodeRegex = /(```)\s*([\s\S]*?[^`])\s*\1(?!```)\n?/g;
const linkRegex = /\((.*)\)/g;
const titleRegex = /\[(.*)\]/g;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function parser(params = { mode: 'markdown', data: '' }) {
  const mode = params.mode;
  let data = params.data;

  if (mode === 'markdown') {
    data = escapeHtml(data);
    data = data
      .replace(blockcodeRegex, (sub) => {
        const code = sub.substring(3, sub.length - 4);

        return `<pre class="preview-code">${code}</pre>`;
      })
      .replace(inlinecodeRegex, (sub) => {
        const code = sub.substring(1, sub.length - 1);

        return `<pre class="preview-code-inline">${code}</pre>`;
      })
      .replace(urlRegex, (sub) => {
        let link = sub.match(linkRegex)[0];
        link = link.substring(1, link.length - 1);

        let title = sub.match(titleRegex)[0];
        title = title.substring(1, title.length - 1);

        return `<a href="${link}">${title}</a>`;
      })
      .replace(underlineRegex, (sub) => {
        const text = sub.substring(2, sub.length - 2);

        return `<u>${text}</u>`;
      })
      .replace(italicRegex, (sub) => {
        const text = sub.substring(1, sub.length - 1);

        return `<i>${text}</i>`;
      })
      .replace(strongRegex, (sub) => {
        const text = sub.substring(1, sub.length - 1);

        return `<b>${text}</b>`;
      })
      .replace(strikethroughRegex, (sub) => {
        const text = sub.substring(1, sub.length - 1);

        return `<strike>${text}</strike>`;
      });

    return data;
  } else if (mode === 'HTML') {
    return xss(data, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre', 's', 'u'],
      whiteList: {
        b: [],
        i: [],
        em: [],
        strong: [],
        code: [],
        pre: [],
        s: [],
        u: [],
        a: ['href'],
      },
    });
  }

  return escapeHtml(data);
}

module.exports = parser;
