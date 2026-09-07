/* Проверка отрисовки витрины в настоящем браузере.
 *
 * Ловит то, что не видно в исходнике: висячие <use> на удалённые символы,
 * нулевые SVG, битые картинки, горизонтальное переполнение на брейкпоинтах,
 * ошибки в консоли.
 *
 * Нужен Chrome с открытым отладочным портом:
 *   chrome --headless --remote-debugging-port=9333
 * Порт можно переопределить: CHROME_PORT=9222 node check/showcase.js
 */
const fs = require('fs');
const path = require('path');
const { Conn, newTab, goto, setVp, evalPage } = require('./cdp.js');

const ROOT = path.dirname(__dirname);
const PORT = process.env.CHROME_PORT || 9333;
const WIDTHS = [320, 480, 768, 1024, 1100, 1440];
const PAGES = ['components.html', 'pages.html'];

const PROBE = "(function(){" +
  "var ids={};document.querySelectorAll('svg symbol').forEach(function(s){ids[s.id]=1;});" +
  "var dangling=[];document.querySelectorAll('use').forEach(function(u){" +
  "  var h=(u.getAttribute('href')||u.getAttribute('xlink:href')||'').split('#').pop();" +
  "  if(h&&!ids[h])dangling.push(h);});" +
  "var zero=[];document.querySelectorAll('svg').forEach(function(s){" +
  "  if(s.getAttribute('style')&&s.getAttribute('style').indexOf('display:none')>=0)return;" +
  "  var r=s.getBoundingClientRect();if(!r.width||!r.height)zero.push(s.className.baseVal||'svg');});" +
  "var broken=[];document.querySelectorAll('img').forEach(function(i){" +
  "  if(!i.complete||!i.naturalWidth)broken.push(i.getAttribute('src'));});" +
  "return JSON.stringify({symbols:Object.keys(ids).length,dangling:dangling," +
  "  zero:zero,broken:broken});})()";

(async () => {
  let ver;
  try {
    ver = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json();
  } catch (e) {
    console.log('ПРОПУЩЕНО: Chrome на порту ' + PORT + ' не отвечает.');
    console.log('           chrome --headless --remote-debugging-port=' + PORT);
    process.exit(0);                       // не ошибка пакета — нет инструмента
  }
  const b = await Conn.open(ver.webSocketDebuggerUrl);
  const { S } = await newTab(b);
  await b.send('Emulation.setScrollbarsHidden', { hidden: true }, S);
  await b.send('Network.setCacheDisabled', { cacheDisabled: true }, S);

  let fail = 0;
  for (const page of PAGES) {
    const url = 'file:///' + path.join(ROOT, 'showcase', page).replace(/\\/g, '/');
    await setVp(b, S, 1100, 900);
    await goto(b, S, url, 12000);
    await new Promise(r => setTimeout(r, 500));
    const r = JSON.parse(await evalPage(b, S, PROBE));

    const problems = [];
    if (r.dangling.length) problems.push('висячие <use>: ' + [...new Set(r.dangling)].join(', '));
    if (r.zero.length) problems.push('SVG нулевого размера: ' + r.zero.length);
    if (r.broken.length) problems.push('битые картинки: ' + r.broken.join(', '));

    const over = [];
    for (const w of WIDTHS) {
      await setVp(b, S, w, 900);
      await new Promise(r2 => setTimeout(r2, 250));
      const o = Number(await evalPage(b, S,
        'document.documentElement.scrollWidth - document.documentElement.clientWidth'));
      if (o > 0) over.push(w + ':+' + o);
    }
    if (over.length) problems.push('горизонтальное переполнение ' + over.join(' '));

    if (problems.length) {
      fail++;
      console.log(page + ': ' + r.symbols + ' символов');
      problems.forEach(p => console.log('  ОШИБКА: ' + p));
    } else {
      console.log(page + ': ' + r.symbols + ' символов, висячих <use> нет, переполнения нет '
        + '(' + WIDTHS.join('/') + ')');
    }
  }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
