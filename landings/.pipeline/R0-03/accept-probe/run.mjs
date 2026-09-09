// Приёмка R0-03 — собственный CDP-прогон приёмщика.
// Поднимает headless-браузер, ходит на страницу приёмщика и на витрины,
// снимает вычисленные значения и переполнение на четырёх ширинах.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE || 'http://127.0.0.1:4180';
const WIDTHS = [320, 375, 768, 1024, 1400];
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const bin = BROWSERS.find((p) => fs.existsSync(p));
if (!bin) throw new Error('браузер не найден');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'accept-r003-'));
const proc = spawn(bin, [
  '--headless=new', '--remote-debugging-port=9339', '--disable-gpu',
  '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: 'ignore' });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch('http://127.0.0.1:9339/json/version');
      return (await res.json()).webSocketDebuggerUrl;
    } catch { await wait(250); }
  }
  throw new Error('CDP не поднялся');
}

const wsUrl = await endpoint();
const { WebSocket } = await import('node:worker_threads').then(() => ({ WebSocket: globalThis.WebSocket }));
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });

let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
const send = (method, params = {}, sessionId) => new Promise((resolve) => {
  const id = ++seq;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const { result: target } = await send('Target.createTarget', { url: 'about:blank' });
const { result: attached } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
const sid = attached.sessionId;
await send('Page.enable', {}, sid);
await send('Runtime.enable', {}, sid);

async function goto(url, width) {
  await send('Emulation.setDeviceMetricsOverride',
    { width, height: 900, deviceScaleFactor: 1, mobile: false }, sid);
  await send('Page.navigate', { url }, sid);
  await wait(700);
}

async function evaluate(expr) {
  const { result } = await send('Runtime.evaluate',
    { expression: expr, returnByValue: true, awaitPromise: true }, sid);
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

const PROBE = `${BASE}/.pipeline/R0-03/accept-probe/scale.html`;
const out = { probe: {}, showcase: {}, play: null };

const SNAP = `(() => {
  const cs = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    const s = getComputedStyle(el);
    return { fs: s.fontSize, lh: s.lineHeight, ls: s.letterSpacing, w: s.fontWeight, ff: s.fontFamily }; };
  const root = getComputedStyle(document.documentElement);
  const tok = (n) => root.getPropertyValue(n).trim();
  const over = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.right > document.documentElement.clientWidth + 0.5) {
      let node = el, clipped = false;
      while (node) { const s = getComputedStyle(node);
        if (/auto|scroll|clip|hidden/.test(s.overflowX)) { clipped = true; break; }
        node = node.parentElement; }
      if (!clipped) over.push(el.tagName + '.' + el.className + ' right=' + r.right.toFixed(1));
    }
  }
  const hauss = [...document.querySelectorAll('*')]
    .filter((el) => /hauss/i.test(getComputedStyle(el).fontFamily)).length;
  return {
    sheets: document.styleSheets.length,
    ownStyleTags: document.querySelectorAll('style').length,
    links: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.getAttribute('href')),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflow: over,
    haussElements: hauss,
    tokens: Object.fromEntries(['display','h1','h2','h3','lead','body','small','caption']
      .flatMap((r) => [['--core-'+r, tok('--core-'+r)], ['--core-'+r+'-lh', tok('--core-'+r+'-lh')], ['--core-'+r+'-ls', tok('--core-'+r+'-ls')]])),
    ghosts: Object.fromEntries(['--core-h4','--core-h5','--core-h6','--core-xl','--core-title','--core-sub','--core-font-wordmark'].map((n) => [n, tok(n)])),
    tags: { h1: cs('h1'), h2: cs('h2'), h3: cs('h3'), h4: cs('h4'), h5: cs('h5'), h6: cs('h6'), p: cs('p') },
    literals: {
      '.site-header-link': cs('.site-header-link'),
      '.site-header-toggle': cs('.site-header-toggle'),
      '.program-date': cs('.program-date'),
      '.glass-chip-text': cs('.glass-chip-text'),
      '.glass-chip-text-l': cs('.glass-chip-text-l'),
      '.marquee-item': cs('.marquee-item'),
    },
    roles: { '.program-item-title': cs('.program-item-title'), '.program-title': cs('.program-title') },
    fonts: [...document.fonts].map((f) => f.family + ' ' + f.weight),
  };
})()`;

for (const w of WIDTHS) {
  await goto(PROBE, w);
  out.probe[w] = await evaluate(SNAP);
}

// Ось игривости — переключение data-play на живой странице.
await goto(PROBE, 1400);
out.play = await evaluate(`(() => {
  const res = {};
  for (const step of ['1','2','3','4']) {
    document.documentElement.setAttribute('data-play', step);
    const h1 = getComputedStyle(document.querySelector('h1'));
    const p = getComputedStyle(document.querySelector('p'));
    res[step] = { h1w: h1.fontWeight, h1ff: h1.fontFamily.split(',')[0], pff: p.fontFamily.split(',')[0] };
  }
  document.documentElement.removeAttribute('data-play');
  return res;
})()`);

for (const page of ['index', 'core', 'primitives', 'blocks']) {
  out.showcase[page] = {};
  for (const w of [320, 768, 1024, 1400]) {
    await goto(`${BASE}/showcase/${page}.html`, w);
    out.showcase[page][w] = await evaluate(`({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      headerLink: (() => { const el = document.querySelector('.site-header-link, .ml-nav-links a');
        return el ? getComputedStyle(el).fontSize : null; })(),
      hauss: [...document.querySelectorAll('*')].filter((el) => /hauss/i.test(getComputedStyle(el).fontFamily)).length,
    })`);
  }
}

fs.writeFileSync(process.argv[2] || 'accept-probe.json', JSON.stringify(out, null, 2), 'utf8');
console.log('written');
proc.kill();
process.exit(0);
