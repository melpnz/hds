// Элементы страницы внутри области — с размерами, стилями и селектором. Для сверки блока с макетом.
// node region.mjs <page.json> <x> <y> <w> <h> [--text] [--max 60]
//   --text  только элементы с собственным текстом и интерактивные (a, button, input, img)
// Пример: node region.mjs page-1024.json 25 700 660 900 --text
import fs from 'node:fs';

const argv = process.argv.slice(2);
const [file, ...rest] = argv.filter(a => !a.startsWith('--'));
const [x, y, w, h] = rest.map(Number);
if (!file || [x, y, w, h].some(n => !Number.isFinite(n))) { console.error('usage: region.mjs <page.json> <x> <y> <w> <h> [--text] [--max 60]'); process.exit(1); }
const onlyText = argv.includes('--text');
const max = Number(argv[argv.indexOf('--max') + 1]) || 60;
const { elements } = JSON.parse(fs.readFileSync(file, 'utf8'));
const inside = e => e.box.x >= x - 1 && e.box.y >= y - 1 && e.box.x + e.box.width <= x + w + 1 && e.box.y + e.box.height <= y + h + 1;
const px = v => String(parseFloat(v) || 0);
const st = s => [
  s['font-family']?.split(',')[0].replace(/"/g, ''), `${s['font-size']}/${s['line-height']}`, 'w' + s['font-weight'],
  s['letter-spacing'] !== 'normal' ? 'ls' + s['letter-spacing'] : '', s.color,
  s['background-color'] !== 'rgba(0, 0, 0, 0)' ? 'bg ' + s['background-color'] : '',
  s['border-top-width'] !== '0px' ? `b ${s['border-top-width']} ${s['border-top-color']}` : '',
  s['border-radius'] !== '0px' ? 'r ' + s['border-radius'] : '',
  ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'].some(k => s[k] !== '0px') ? 'p ' + ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'].map(k => px(s[k])).join('/') : '',
  ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].some(k => s[k] && s[k] !== '0px') ? 'm ' + ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].map(k => px(s[k])).join('/') : '',
  s.gap && s.gap !== 'normal' ? 'gap ' + s.gap : '', s['text-transform'] !== 'none' ? s['text-transform'] : '',
].filter(Boolean).join(' ');
let n = 0;
for (const e of elements.filter(inside)) {
  if (onlyText && !e.text && !['a', 'button', 'input', 'img'].includes(e.tag)) continue;
  const b = e.box;
  console.log(`${e.tag.padEnd(7)} [${b.x},${b.y},${b.width},${b.height}]`.padEnd(32) + ` ${e.text ? '"' + e.text.slice(0, 30) + '"' : ''}`.padEnd(34) + ' ' + st(e.style) + `\n${' '.repeat(9)}sel: ${e.sel || e.path}${e.selN > 1 ? ' ×' + e.selN : ''}`);
  if (++n >= max) { console.log(`… ещё элементы — сузьте область или увеличьте --max`); break; }
}
if (!n) console.log('В области нет элементов.');
