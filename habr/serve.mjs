import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.argv[2] || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let target = resolve(root, relative || 'viewer/index.html');
  if (!target.startsWith(resolve(root) + sep) && target !== resolve(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if (statSync(target).isDirectory()) target = resolve(target, 'index.html');
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream' });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Habr viewer: http://127.0.0.1:${port}/viewer/`);
});
