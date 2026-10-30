// Локальный сервер отчёта: решения дизайнера сохраняются сами, без «Сохранить с решениями» и «Разметки для обучения».
// node scripts/serve-report.mjs <runDir> [--open] [--port N]
//
// Отдаёт файлы прогона только на 127.0.0.1. Страница присылает решения POST-запросом, сервер пишет:
//   decisions.json  — сразу (агент читает решения отсюда);
//   report.html     — решения встраиваются в <script id="decisions"> (с задержкой ~2 с), файл можно открыть и без сервера;
//   feedback-*.json — разметка для обучения, после того как дизайнер открыл «Отчёт» (и дальше обновляется).
// Порт постоянный для прогона (из его пути): у отчёта тот же адрес, и решения в браузере не теряются между запусками.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { resolveReviewRun } from './workspace-lib.mjs';

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : null; };
const requestedDir = path.resolve(args.find((a,i) => !a.startsWith('--') && !(i>0&&args[i-1].startsWith('--'))) || '.');
const runDir = opt('original') ? requestedDir : resolveReviewRun(requestedDir);
const reportPath = path.join(runDir, 'report.html');
if (!fs.existsSync(reportPath)) { console.error(`Нет отчёта: ${reportPath}`); process.exit(1); }
const decPath = path.join(runDir, 'decisions.json');
const TAG = '<script type="application/json" id="decisions">';
const token = crypto.randomBytes(16).toString('hex');
const serverState = path.join(runDir, '.report-server.json');
const savedPort = (()=>{try{return JSON.parse(fs.readFileSync(serverState,'utf8')).port}catch{return null}})();
const basePort = Number(opt('port')) || Number(savedPort) || 47000 + (parseInt(crypto.createHash('sha1').update(runDir.toLowerCase()).digest('hex').slice(0, 6), 16) % 1500);

const readDecisions = () => { try { return JSON.parse(fs.readFileSync(decPath, 'utf8')).decisions || null; } catch { return null; } };
const writeAtomic = (file, text) => { const tmp = file + '.tmp'; fs.writeFileSync(tmp, text); fs.renameSync(tmp, file); };
const embed = (html, dec) => {
  const i = html.indexOf(TAG); if (i < 0) return html;
  const j = html.indexOf('</script>', i);
  return html.slice(0, i + TAG.length) + JSON.stringify(dec).replace(/</g, '\\u003c') + html.slice(j);
};
let pending = null, timer = null;
const flushReport = () => {
  clearTimeout(timer); timer = null; if (!pending) return;
  try { writeAtomic(reportPath, embed(fs.readFileSync(reportPath, 'utf8'), pending)); pending = null; }
  catch (e) { console.error('⚠ не удалось записать report.html:', e.message); }
};
const MIME = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript' };

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const send = (code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); };
  if (u.pathname === '/api/ping') return send(200, JSON.stringify({ ok: true, dir: runDir }));
  if (u.pathname === '/api/save' && req.method === 'POST') {
    if (u.searchParams.get('t') !== token) return send(403, '{"ok":false}');
    let body = ''; req.setEncoding('utf8');
    req.on('data', c => { body += c; if (body.length > 50e6) req.destroy(); });
    req.on('end', () => {
      try {
        const p = JSON.parse(body);
        if (!p.decisions || typeof p.decisions !== 'object') throw new Error('нет решений');
        const savedAt = new Date().toISOString();
        writeAtomic(decPath, JSON.stringify({ savedAt, decisions: p.decisions }, null, 1));
        let feedback = null;
        if (p.feedback?.name && /^feedback-[\w.-]+\.json$/.test(p.feedback.name)) { writeAtomic(path.join(runDir, p.feedback.name), JSON.stringify(p.feedback.data, null, 1)); feedback = p.feedback.name; }
        pending = p.decisions; if (p.final) flushReport(); else if (!timer) timer = setTimeout(flushReport, 2000);
        send(200, JSON.stringify({ ok: true, savedAt, feedback }));
      } catch (e) { send(400, JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }
  // файлы прогона (только внутри папки)
  const rel = decodeURIComponent(u.pathname === '/' ? '/report.html' : u.pathname);
  const file = path.resolve(runDir, '.' + rel);
  if (!file.startsWith(runDir + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(404, 'not found', 'text/plain');
  if (file === reportPath) {
    flushReport();
    let html = fs.readFileSync(file, 'utf8');
    const dec = readDecisions(); if (dec) html = embed(html, dec); // самые свежие решения — из decisions.json
    html = html.replace('<head>', `<head><script>window.DR_SERVER=${JSON.stringify({ token })}</script>`);
    return send(200, html, MIME['.html']);
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const openUrl = url => exec(process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
const tryListen = port => new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', () => ok(port)); });
const ping = port => new Promise(ok => http.get({ host: '127.0.0.1', port, path: '/api/ping', timeout: 800 }, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => { try { ok(JSON.parse(b)); } catch { ok(null); } }); }).on('error', () => ok(null)));

for (let port = basePort; port < basePort + 20; port++) {
  try { await tryListen(port); } catch (e) {
    if (e.code !== 'EADDRINUSE') throw e;
    const other = await ping(port);
    if (other?.dir && path.resolve(other.dir).toLowerCase() === runDir.toLowerCase()) { // этот отчёт уже открыт — просто показать
      const url = `http://127.0.0.1:${port}/`; console.log(`Отчёт уже открыт: ${url}`); if (opt('open')) openUrl(url); process.exit(0);
    }
    continue;
  }
  const url = `http://127.0.0.1:${port}/`;
  writeAtomic(serverState, JSON.stringify({port,pid:process.pid},null,2));
  console.log(`Отчёт: ${url}\nРешения сохраняются сами в ${runDir} (decisions.json, report.html, feedback-*.json).\nНе закрывайте это окно, пока работаете с отчётом.`);
  if (opt('open')) openUrl(url);
  const stop = () => { flushReport(); process.exit(0); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop); process.on('SIGHUP', stop);
  break;
}
if (!server.listening) { console.error('Не нашёл свободный порт'); process.exit(1); }
