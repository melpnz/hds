// Быстрый просмотр снятых элементов страницы: поиск по тексту / классу / тегу.
// node scripts/probe.mjs <page.json> <regex по text|cls|placeholder> [maxRows]
import fs from 'node:fs';
const [file, pattern, max = '40'] = process.argv.slice(2);
const { elements } = JSON.parse(fs.readFileSync(file, 'utf8'));
const re = new RegExp(pattern, 'i');
const s = st => [
  st['font-family'].split(',')[0].replace(/"/g, ''), st['font-size'] + '/' + st['line-height'], 'w' + st['font-weight'],
  st['letter-spacing'] !== 'normal' ? 'ls' + st['letter-spacing'] : '', 'c' + st.color,
  st['background-color'] !== 'rgba(0, 0, 0, 0)' ? 'bg' + st['background-color'] : '',
  st['border-top-width'] !== '0px' ? 'b' + st['border-top-width'] + ' ' + st['border-top-color'] : '',
  st['border-radius'] !== '0px' ? 'r' + st['border-radius'] : '',
  [st['padding-top'], st['padding-right'], st['padding-bottom'], st['padding-left']].join(' ') !== '0px 0px 0px 0px' ? 'p' + [st['padding-top'], st['padding-right'], st['padding-bottom'], st['padding-left']].map(v => parseFloat(v)).join('/') : '',
  st['margin-top'] && [st['margin-top'], st['margin-right'], st['margin-bottom'], st['margin-left']].some(v => v && v !== '0px') ? 'm' + [st['margin-top'], st['margin-right'], st['margin-bottom'], st['margin-left']].map(v => parseFloat(v) || 0).join('/') : '',
  st.gap !== 'normal' ? 'gap' + st.gap : '', st['-webkit-line-clamp'] !== 'none' ? 'clamp' + st['-webkit-line-clamp'] : '',
].filter(Boolean).join(' ');
let n = 0;
for (const e of elements) {
  if (!re.test(e.text || '') && !re.test(e.cls || '') && !re.test(e.placeholder || '') && !re.test(e.tag)) continue;
  console.log(`#${e.id} ${e.tag}.${(e.cls || '').split(' ')[0]} [${e.box.x},${e.box.y},${e.box.width},${e.box.height}] "${(e.text || e.placeholder || '').slice(0, 40)}" ${s(e.style)}${e.sel ? `\n     sel: ${e.sel}${e.selN > 1 ? ' ×' + e.selN : ''}` : ''}`);
  if (++n >= +max) break;
}
