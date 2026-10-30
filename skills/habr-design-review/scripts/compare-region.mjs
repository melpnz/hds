// Слои макета и элементы сайта внутри одного компонента — рядом, с ключевыми стилями (для ручной проверки агентом).
// node scripts/compare-region.mjs <run> --scope-site "<кусок класса/селектора>[|…]" --scope-figma "<кусок имени слоя>[|…]"
//                                  [--shots 1024,768-вариант-2] [--all]
// Без --scope-* — область по координатам: --box x,y,w,h (одна для макета и сайта).
// Тексты, размеры, отступы, кегль, цвета, рамки по сторонам; сначала макет, потом сайт. --all — и элементы без стилей.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const run = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!run) { console.error('usage: compare-region.mjs <run> --scope-site "…" --scope-figma "…" [--shots 1024,320-вариант-2] [--box x,y,w,h]'); process.exit(1); }
const anyOf = (k, t) => String(k || '').toLowerCase().split('|').map(x => x.trim()).filter(Boolean).some(x => String(t).toLowerCase().includes(x));
const inside = (r, b) => b.x >= r.x - 1 && b.y >= r.y - 1 && b.x + b.width <= r.x + r.width + 1 && b.y + b.height <= r.y + r.height + 1;
const box = opt('box') ? (([x, y, width, height]) => ({ x, y, width, height }))(opt('box').split(',').map(Number)) : null;
function scope(els, key, pred) {
  if (box) return els.filter(e => inside(box, e.box));
  const roots = key ? els.filter(pred).map(e => e.box) : [];
  return roots.length ? els.filter(e => roots.some(r => inside(r, e.box))) : null;
}
const S = (s = {}, keys) => keys.map(([k, n]) => s[k] !== undefined && s[k] !== '0px' && s[k] !== 'none' && s[k] !== 'rgba(0, 0, 0, 0)' && s[k] !== 'normal' ? `${n}:${s[k]}` : '').filter(Boolean).join(' ');
const KEYS = [['font-size', 'fs'], ['font-weight', 'w'], ['line-height', 'lh'], ['color', 'c'], ['background-color', 'bg'], ['border-radius', 'r'],
  ['padding-top', 'pt'], ['padding-right', 'pr'], ['padding-bottom', 'pb'], ['padding-left', 'pl'], ['gap', 'gap'],
  ['border-top-width', 'bt'], ['border-right-width', 'br'], ['border-bottom-width', 'bb'], ['border-left-width', 'bl'], ['box-shadow', 'sh'], ['opacity', 'op']];
const figDir = path.join(run, 'figma'), pageDir = path.join(run, 'page');
const sfx = fs.readdirSync(figDir).filter(f => /^figma-\d+.*\.json$/.test(f)).map(f => f.slice(6, -5)).filter(s => fs.existsSync(path.join(pageDir, `page-${s}.json`)));
const want = opt('shots') ? opt('shots').split(',') : sfx;
for (const s of sfx.filter(x => want.includes(x))) {
  const F = JSON.parse(fs.readFileSync(path.join(figDir, `figma-${s}.json`), 'utf8')), P = JSON.parse(fs.readFileSync(path.join(pageDir, `page-${s}.json`), 'utf8'));
  const fe = scope(F.elements, opt('scope-figma'), e => anyOf(opt('scope-figma'), `${e.name || ''} ${e.path || ''}`));
  const pe = scope(P.elements, opt('scope-site'), e => anyOf(opt('scope-site'), `${e.sel || ''} ${e.cls || ''}`));
  console.log(`\n##### ${s}`);
  console.log(`--- МАКЕТ${fe ? '' : ' (область не найдена — проверьте --scope-figma)'}`);
  for (const e of fe || []) { const st = S(e.style, KEYS); if (!st && !e.text && !argv.includes('--all')) continue;
    console.log(`${e.kind.padEnd(4)} [${e.box.x},${e.box.y},${e.box.width}×${e.box.height}] ${JSON.stringify(e.text || e.name).slice(0, 42)} ${st}${e.drawn ? ` ⚠нарисовано ${e.drawn.weight} при стиле ${e.drawn.styleWeight}` : ''}`); }
  console.log(`--- САЙТ${pe ? '' : ' (область не найдена — проверьте --scope-site)'}`);
  for (const e of pe || []) { const st = S(e.style, KEYS); if (!st && !e.text && !argv.includes('--all')) continue;
    console.log(`${String(e.tag).padEnd(4)} [${e.box.x},${e.box.y},${e.box.width}×${e.box.height}] ${JSON.stringify(e.text || '').slice(0, 42)} ${st}  ${e.sel || ''}`); }
}
