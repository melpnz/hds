// Локальный сервер витрины Лендингов.
//
//   node tools/serve.mjs        (или npm run serve)
//
// Порт 4180, а не 4178 и не 4179: на 4178 сидит сервер пакета career/,
// на 4179 — courses/. Два пакета на одном порту дают EADDRINUSE, а хуже
// того — один URL витрины на два разных набора файлов: кто поднялся первым,
// тот и отдаёт, и правки видны не там, где их ищут. Поэтому у каждого
// пакета свой порт, а при старте печатается корень.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 4180;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Витрина — то, ради чего сервер поднимают, поэтому корень ведёт на неё.
// У лендингов витрина одна и называется blocks.html: единица пакета — блок.
const ENTRY = '/showcase/blocks.html';
const ENTRY_STEP = 'R0-06';

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  // Витрина и инструменты читают реестр прямо с диска.
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};
const textTypes = new Set(['.html', '.css', '.js', '.json', '.md', '.svg']);

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }

  if (pathname === '/' || pathname === '') {
    // Витрины ещё нет — R0-06. Редирект на несуществующий файл дал бы
    // пустой 404, а пустой 404 при работающем сервере читается как
    // «сервер сломан». Отвечаем словами: что открыто, чего нет и кто заводит.
    if (!fs.existsSync(path.join(root, ENTRY.slice(1)))) {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(
        `Сервер пакета landings работает. Корень: ${root}\n\n` +
        `Витрины ${ENTRY} ещё нет — её заводит шаг ${ENTRY_STEP}.\n` +
        `Пока открывать нечего: файлы пакета отдаются по своим путям,\n` +
        `например /ui/landings.css.\n`,
      );
      return;
    }
    res.writeHead(302, { Location: ENTRY }).end();
    return;
  }

  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }

  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    const ext = path.extname(file);
    res.writeHead(200, {
      'Content-Type': (types[ext] || 'application/octet-stream') + (textTypes.has(ext) ? '; charset=utf-8' : ''),
      // Витрину правят и тут же перезагружают. Кэш браузера в этой петле
      // показывает предыдущую редакцию CSS и стоит получаса разбирательств.
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${PORT} — корень ${root}`);
  console.log(`витрина: http://127.0.0.1:${PORT}${ENTRY}` + (fs.existsSync(path.join(root, ENTRY.slice(1))) ? '' : ` — ещё нет, заводит ${ENTRY_STEP}`));
});
