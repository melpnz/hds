// Вырезает участок скриншота, чтобы рассмотреть его (длинные страницы целиком не читаются).
// node crop.mjs <in.png> <out.png> <x> <y> <w> <h> [scale]
// Пример: node crop.mjs page-1024.png _top.png 0 0 1024 1400
import fs from 'node:fs';
import { PNG } from 'pngjs';

const [inp, out, ...nums] = process.argv.slice(2);
if (!inp || !out || nums.length < 4) { console.error('usage: crop.mjs <in.png> <out.png> <x> <y> <w> <h> [scale]'); process.exit(1); }
const [x, y, w, h, scale = 1] = nums.map(Number);
const src = PNG.sync.read(fs.readFileSync(inp));
const W = Math.max(1, Math.min(w, src.width - x)), H = Math.max(1, Math.min(h, src.height - y));
const s = Math.max(1, Math.round(scale));
const dst = new PNG({ width: W * s, height: H * s });
for (let j = 0; j < H * s; j++) for (let i = 0; i < W * s; i++) {
  const si = ((y + Math.floor(j / s)) * src.width + (x + Math.floor(i / s))) * 4, di = (j * W * s + i) * 4;
  dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1]; dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = src.data[si + 3];
}
fs.writeFileSync(out, PNG.sync.write(dst));
console.log(`${out}: ${W * s}×${H * s} из ${src.width}×${src.height}`);
