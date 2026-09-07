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
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + (['.html', '.css', '.js'].includes(path.extname(file)) ? '; charset=utf-8' : '') });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${PORT} — корень ${root}`);
});
