// R0-00 — извлечение фактов стиля из дампа get_design_context.
// Дамп MCP figma сохраняется как JSON [{type,text}]; скрипт сводит из него
// гарнитуры, кегли, интерлиньяж, трекинг, цвета, радиусы, тени и градиенты.
// Использование: node extract-style-facts.mjs <путь к дампу> [--raw <файл>]
import fs from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('usage: node extract-style-facts.mjs <dump.json|dump.txt>'); process.exit(2); }

let text = fs.readFileSync(src, 'utf8');
try { const j = JSON.parse(text); if (Array.isArray(j)) text = j.map(x => x.text).join('\n'); } catch {}

const rawOut = process.argv.indexOf('--raw');
if (rawOut > -1 && process.argv[rawOut + 1]) fs.writeFileSync(process.argv[rawOut + 1], text);

const uniq = a => [...new Set(a)].sort();
const all = (re) => uniq(text.match(re) || []);

// текстовые роли: собираем по каждому <p>/<div> с шрифтом
const roles = [];
const lineRe = /data-node-id="([^"]+)"/;
for (const line of text.split('\n')) {
  if (!/font-\['/.test(line)) continue;
  const id = (line.match(lineRe) || [])[1] || '';
  const font = (line.match(/font-\['([^']+)'\]/) || [])[1] || '';
  const size = (line.match(/text-\[(\d+(?:\.\d+)?)px\]/) || [])[1] || '';
  const lead = (line.match(/leading-(?:\[([^\]]+)\]|(none))/) || []).slice(1).find(Boolean) || '';
  const track = (line.match(/tracking-\[([^\]]+)\]/) || [])[1] || '';
  const color = (line.match(/text-\[(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\]/) || [])[1]
    || (/text-white/.test(line) ? '#ffffff' : (/text-black/.test(line) ? '#000000' : ''));
  const upper = /uppercase/.test(line) ? 'uppercase' : '';
  if (font || size) roles.push([id, font, size, lead, track, color, upper].join(' | '));
}

const out = (label, arr) => console.log(`\n## ${label} (${arr.length})\n` + (arr.length ? arr.join('\n') : '—'));

out('ТЕКСТОВЫЕ РОЛИ  node | font | size | leading | tracking | color | case', uniq(roles));
out('ГАРНИТУРЫ', all(/font-\['[^']+'\]/g));
out('КЕГЛИ', all(/text-\[\d+(?:\.\d+)?px\]/g));
out('ИНТЕРЛИНЬЯЖ', all(/leading-\[[^\]]+\]/g));
out('ТРЕКИНГ', all(/tracking-\[[^\]]+\]/g));
out('ЦВЕТА', all(/#[0-9a-fA-F]{6,8}\b/g));
out('RGBA', all(/rgba?\([^)]*\)/g).filter(s => !/gradient/.test(s)));
out('РАДИУСЫ', all(/rounded-(?:\[[^\]]+\]|full|none)/g));
out('ТЕНИ', all(/shadow-\[[^\]]+\]/g).concat(all(/drop-shadow-\[[^\]]+\]/g)));
out('РАЗМЫТИЕ', all(/backdrop-blur-\[[^\]]+\]|blur-\[[^\]]+\]/g));
out('ФОНЫ', all(/bg-\[[^\]]+\]/g));
out('ГРАДИЕНТЫ', all(/linear-gradient\([^"']*\)/g));
out('ГРАДИЕНТЫ (tailwind)', all(/bg-gradient-to-\w+[^"]*?(?=")/g));
out('ГРАНИЦЫ', all(/border-(?:\d+ )?border-\[[^\]]+\]/g).concat(all(/border-\[[^\]]+\]/g)));
