/* Сверка с живым habr.com — главное обещание пакета.
 *
 * Для каждого класса из allowlist.json → parity_selectors берёт его
 * СОБСТВЕННОЕ правило на production (CSS.getMatchedStylesForNode, то есть
 * то, что реально выиграло каскад) и сравнивает с нашим объявлением.
 * Сравниваются только свойства, объявленные с обеих сторон.
 *
 * Различия в форме записи (.5rem против 0.5rem, transparent против 0 0,
 * кавычки в font-family) нормализуются — они не меняют вычисленное
 * значение и приходят от минификатора.
 *
 * Нужен Chrome с отладочным портом и доступ в сеть.
 *   chrome --headless --remote-debugging-port=9333
 */
const fs = require('fs');
const path = require('path');
const { Conn, newTab, goto, setVp } = require('./cdp.js');

const ROOT = path.dirname(__dirname);
const PORT = process.env.CHROME_PORT || 9333;
const ALLOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'allowlist.json'), 'utf8'));
const TARGETS = Object.entries(ALLOW.parity_selectors).filter(([k]) => k !== '_');
// Осознанные отступления от production: не ошибка, но всегда на виду.
const INTENDED = ALLOW.intentional_divergence || {};

// свойства-развёртки и служебное, что отдаёт CDP поверх исходных объявлений
const SKIP = /^(background-(position|size|repeat|attachment|origin|clip|image)|border-image|transition-(behavior|duration|timing|delay|property)|-webkit-|unicode-bidi|quotes)/;

function cssFiles(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) cssFiles(p, out);
    else if (f.endsWith('.css')) out.push(p);
  }
  return out;
}

/** Вырезает содержимое @media-блоков: сверяем только базовые правила. */
function stripMedia(txt) {
  let out = '';
  for (let i = 0; i < txt.length; i++) {
    if (txt.startsWith('@media', i)) {
      const j = txt.indexOf('{', i);
      if (j < 0) break;
      let depth = 0;
      let k = j;
      for (; k < txt.length; k++) {
        if (txt[k] === '{') depth++;
        else if (txt[k] === '}' && --depth === 0) break;
      }
      i = k;
      continue;
    }
    out += txt[i];
  }
  return out;
}

/** Наши объявления для точного селектора `.cls` (без вложенности и @media). */
function ourDecls(cls) {
  const esc = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const out = {};
  for (const f of cssFiles(path.join(ROOT, 'ui'))) {
    const txt = stripMedia(fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' '));
    const re = new RegExp('(^|[,}])\\s*' + esc + '\\s*\\{([^}]*)\\}', 'g');
    let m;
    while ((m = re.exec(txt))) {
      for (const d of m[2].split(';')) {
        const i = d.indexOf(':');
        if (i > 0) out[d.slice(0, i).trim()] = d.slice(i + 1).trim();
      }
    }
  }
  return out;
}

const norm = v => v
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase()
  .replace(/(^|\s)\.(\d)/g, '$10.$2')      // .5rem -> 0.5rem
  .replace(/^0px$/, '0')
  .replace(/^(transparent|rgba\(0, ?0, ?0, ?0\))$/, '0 0')
  .replace(/["']/g, '');

(async () => {
  let ver;
  try {
    ver = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json();
  } catch (e) {
    console.log('ПРОПУЩЕНО: Chrome на порту ' + PORT + ' не отвечает.');
    process.exit(0);
  }
  const b = await Conn.open(ver.webSocketDebuggerUrl);
  const { S } = await newTab(b);
  await b.send('DOM.enable', {}, S);
  await b.send('CSS.enable', {}, S);
  await setVp(b, S, 1440, 1000);

  const byUrl = {};
  for (const [sel, url] of TARGETS) (byUrl[url] = byUrl[url] || []).push(sel);

  let same = 0, diff = 0, skip = 0, intended = 0;
  for (const url of Object.keys(byUrl)) {
    try {
      await goto(b, S, url, 14000);
    } catch (e) {
      console.log('ПРОПУЩЕНО: не открылось ' + url);
      skip += byUrl[url].length;
      continue;
    }
    await new Promise(r => setTimeout(r, 1500));
    const { root } = await b.send('DOM.getDocument', { depth: -1 }, S);

    for (const sel of byUrl[url]) {
      let nodeId = 0;
      try { ({ nodeId } = await b.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel }, S)); }
      catch (e) { /* нет узла */ }
      if (!nodeId) { skip++; console.log(sel.padEnd(36) + 'нет на странице — пропущено'); continue; }

      const m = await b.send('CSS.getMatchedStylesForNode', { nodeId }, S);
      const bare = sel.slice(1);
      const prod = {};
      for (const r of m.matchedCSSRules) {
        const hit = r.rule.selectorList.text.split(',').some(
          x => x.trim().replace(/\[data-v-[a-z0-9]+\]/g, '') === '.' + bare);
        if (!hit) continue;
        if (r.rule.media && r.rule.media.length) continue;   // только базовое правило
        for (const p of r.rule.style.cssProperties) {
          if (p.disabled || !p.name || p.value === undefined || SKIP.test(p.name)) continue;
          prod[p.name] = p.value;
        }
      }
      if (!Object.keys(prod).length) { skip++; console.log(sel.padEnd(36) + 'правило прода не выделено'); continue; }

      const ours = ourDecls(sel);
      const bad = [];
      let shared = 0;
      for (const k of new Set([...Object.keys(prod), ...Object.keys(ours)])) {
        if (k.startsWith('--') || !prod[k] || !ours[k]) continue;
        shared++;
        if (norm(prod[k]) !== norm(ours[k])) {
          bad.push('    ' + k + ': прод «' + prod[k] + '» / пакет «' + ours[k] + '»');
        }
      }
      if (bad.length && INTENDED[sel]) {
        intended++;
        console.log(sel.padEnd(36) + 'ОТСТУПЛЕНИЕ, обосновано: ' + bad.length + ' из ' + shared);
        console.log('    причина: ' + INTENDED[sel]);
        bad.forEach(x => console.log(x));
      } else if (bad.length) {
        diff++;
        console.log(sel.padEnd(36) + 'ОШИБКА: расхождений ' + bad.length + ' из ' + shared);
        bad.forEach(x => console.log(x));
      } else {
        same++;
        console.log(sel.padEnd(36) + 'совпало (' + shared + ' общих свойств)');
      }
    }
  }
  console.log('\nсовпало ' + same + ', намеренных отступлений ' + intended
    + ', расходится ' + diff + ', пропущено ' + skip);
  process.exit(diff ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
