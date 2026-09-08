// Локальный сервер витрины Курсов.
//
// Порт 4179, а не 4178: на 4178 сидит сервер пакета career/. Два пакета на
// одном порту дают EADDRINUSE при reuseExistingServer: false и, хуже,
// один URL витрины на два разных набора файлов — кто поднялся первым, тот и
// отдаёт. Поэтому у каждого пакета свой порт, а при старте печатается корень.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 4179;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Витрина — то, ради чего сервер поднимают, поэтому корень ведёт на неё.
// Прежде `/` разрешался в папку пакета, fs.readFile отдавал EISDIR, и
// открытый в браузере адрес сервера отвечал пустым 404 — при работающем
// сервере это читается как «сервер сломан».
const ENTRY = '/showcase/components.html';

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  // Витрина и инструменты читают реестр и перепись селекторов прямо с диска.
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};
const textTypes = new Set(['.html', '.css', '.js', '.json', '.md', '.svg']);

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }

  if (pathname === '/' || pathname === '') {
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
  console.log(`витрина: http://127.0.0.1:${PORT}${ENTRY}`);
});
