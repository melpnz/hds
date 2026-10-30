// Строки из figma-extract.js (через use_figma) → figma-<w>.json в общем формате (см. figma-lib.mjs).
// node figma-rows.mjs <rows.tsv> [ещё части.tsv …] <out.json> [--frame "id|name|w|h"]
import fs from 'node:fs';
import { textEl, boxEl } from './figma-lib.mjs';

const argv = process.argv.slice(2);
const frameArg = argv.includes('--frame') ? argv[argv.indexOf('--frame') + 1] : null;
const files = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--frame');
const out = files.pop();
if (!files.length || !out) { console.error('usage: figma-rows.mjs <rows.tsv> [...] <out.json> [--frame "id|name|w|h"]'); process.exit(1); }
const elements = [], seen = new Set();
for (const f of files) for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
  const c = line.split('\t'); if (c.length < 4 || seen.has(c[1])) continue;
  const [x, y, w, h] = c[2].split(',').map(Number); const box = { x, y, width: w, height: h };
  if (c[0] === 'T') elements.push(textEl({ id: c[1], box, family: c[3], style: c[4], size: c[5], lh: c[6], ls: c[7], color: c[8], tcase: c[9], text: c.slice(10).join('\t') }));
  else if (c[0] === 'B') elements.push(boxEl({ id: c[1], name: c[3], box, layout: c[4], pad: c[5], gap: c[6], radius: c[7], fill: c[8], stroke: c[9], comp: c[10] }));
  else continue;
  seen.add(c[1]);
}
const [fid, fname, fw, fh] = (frameArg || '').split('|');
const res = { source: 'figma', frame: { id: fid || '', name: fname || '', w: Number(fw) || Math.max(...elements.map(e => e.box.x + e.box.width)), h: Number(fh) || Math.max(...elements.map(e => e.box.y + e.box.height)) }, elements };
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(`${out}: ${elements.length} элементов (${elements.filter(e => e.kind === 'text').length} текстов)`);
