/* Минимальный клиент Chrome DevTools Protocol.
 * Ничего специфичного для пакета — только открыть вкладку, сходить по
 * адресу, задать вьюпорт и выполнить выражение на странице.
 * Используется check/showcase.js и check/parity.js.
 */
const fs = require('fs');
const path = require('path');

class Conn {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); }

  static async open(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = () => rej(new Error('не удалось открыть WebSocket ' + url));
    });
    const c = new Conn(ws);
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && c.pending.has(m.id)) {
        const { res, rej } = c.pending.get(m.id);
        c.pending.delete(m.id);
        if (m.error) rej(new Error(JSON.stringify(m.error)));
        else res(m.result);
      }
    };
    return c;
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const p = { id, method, params };
    if (sessionId) p.sessionId = sessionId;
    this.ws.send(JSON.stringify(p));
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          rej(new Error('таймаут ' + method));
        }
      }, 60000);
    });
  }
}

async function newTab(browser) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId: S } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  await browser.send('Page.enable', {}, S);
  await browser.send('Runtime.enable', {}, S);
  await browser.send('Network.enable', {}, S);
  try {
    await browser.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-color-scheme', value: 'light' }]
    }, S);
  } catch (e) { /* старая версия Chrome — не критично */ }
  return { targetId, S };
}

async function goto(browser, S, url, settle = 3000) {
  await browser.send('Page.navigate', { url }, S);
  await new Promise(r => setTimeout(r, settle));
}

async function setVp(browser, S, w, h) {
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: w, height: h, deviceScaleFactor: 1, mobile: false,
    screenWidth: w, screenHeight: h
  }, S);
  await new Promise(r => setTimeout(r, 500));
}

async function evalPage(browser, S, expr) {
  const r = await browser.send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: false
  }, S);
  if (r.exceptionDetails) {
    throw new Error('ошибка выражения на странице: '
      + JSON.stringify(r.exceptionDetails).slice(0, 300));
  }
  return r.result.value;
}

async function shot(browser, S, file, full) {
  const params = { format: 'png' };
  if (full) params.captureBeyondViewport = true;
  const { data } = await browser.send('Page.captureScreenshot', params, S);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
}

module.exports = { Conn, newTab, goto, setVp, evalPage, shot };
