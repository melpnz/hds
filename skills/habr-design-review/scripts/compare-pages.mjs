// Сравнение двух съёмок одной страницы (стенд ↔ прод, до ↔ после) → findings.json для build-report.mjs.
// node compare-pages.mjs --a <dirA> --b <dirB> --out <runDir> [--labels "Прод,Стенд"] [--title "..."]
//                        [--urlA ...] [--urlB ...] [--prefix page]
// В dirA/dirB — результат capture.mjs (одинаковые ширины и состояния). A — эталон, B — проверяемая версия.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
if (!args.a || !args.b || !args.out) { console.error('usage: compare-pages.mjs --a <dirA> --b <dirB> --out <runDir> [--labels "Прод,Стенд"]'); process.exit(1); }
const [labelA, labelB] = String(args.labels || 'Прод,Стенд').split(',');
const prefix = args.prefix || 'page';
const out = args.out;
for (const d of ['a', 'b', 'diff']) fs.mkdirSync(path.join(out, d), { recursive: true });

const TOL = { size: 2, spacing: 1, shift: 2 };
const STYLE_PROPS = {
  'font-family': 'typography', 'font-size': 'typography', 'font-weight': 'typography', 'line-height': 'typography', 'letter-spacing': 'typography',
  'text-transform': 'typography', 'color': 'color', 'background-color': 'color', 'border-top-color': 'color', 'border-top-width': 'size',
  'border-radius': 'radius', 'box-shadow': 'color', 'opacity': 'color',
  'padding-top': 'spacing', 'padding-right': 'spacing', 'padding-bottom': 'spacing', 'padding-left': 'spacing',
  'margin-top': 'spacing', 'margin-bottom': 'spacing', 'gap': 'spacing', 'display': 'structure',
};
// Допуски по свойствам: размер и начертание шрифта — точно (любое отличие видно), остальное — ±1 px.
const PROP_TOL = { 'font-size': 0, 'font-weight': 0, 'line-height': 0.5, 'letter-spacing': 0.05 };
const PROP_RU = {
  'font-family': 'шрифт', 'font-size': 'размер шрифта', 'font-weight': 'начертание', 'line-height': 'межстрочный', 'letter-spacing': 'трекинг',
  'text-transform': 'регистр', 'color': 'цвет текста', 'background-color': 'фон', 'border-top-color': 'цвет рамки', 'border-top-width': 'толщина рамки',
  'border-radius': 'скругление', 'box-shadow': 'тень', 'opacity': 'прозрачность', 'padding-top': 'отступ сверху', 'padding-right': 'отступ справа',
  'padding-bottom': 'отступ снизу', 'padding-left': 'отступ слева', 'margin-top': 'внешний отступ сверху', 'margin-bottom': 'внешний отступ снизу', 'gap': 'gap', 'display': 'display', width: 'ширина', height: 'высота',
};
const num = v => { const m = /^-?[\d.]+/.exec(String(v)); return m ? parseFloat(m[0]) : NaN; };
const rgbToHex = v => String(v).replace(/rgba?\(([^)]+)\)/g, (_, c) => {
  const p = c.split(',').map(s => s.trim()); const h = n => Math.round(+n).toString(16).padStart(2, '0');
  return ('#' + h(p[0]) + h(p[1]) + h(p[2]) + (p[3] !== undefined && +p[3] < 1 ? h(+p[3] * 255) : '')).toUpperCase();
});
const fmt = (prop, v) => STYLE_PROPS[prop] === 'color' ? rgbToHex(v) : String(v).replace(/"/g, '');
const label = e => (e.text || e.placeholder || e.alt || e.aria || '').slice(0, 40) || `<${e.tag}${e.cls ? '.' + e.cls.split(' ')[0] : ''}>`;
const box = e => [e.box.x, e.box.y, e.box.width, e.box.height];
// Для разработчика: где искать элемент в вёрстке.
const dev = e => ({ sel: e.sel, selN: e.selN, cls: e.cls, tag: e.tag, text: label(e) });
// Общий селектор группы: тег + классы, которые есть у всех элементов группы (хэш-классы отброшены);
// если общих классов нет — селектор первого элемента без :nth-of-type (тот же «шаблон» в вёрстке).
// Те же правила, что в capture.mjs: BEM — нормальные классы, хэш-суффикс — с цифрой или заглавной буквой.
const HASHED = c => /^(css|sc|jsx|emotion|styled)-[a-z0-9]+$|^_[a-zA-Z0-9]{4,}$|[_-]{1,2}(?=[A-Za-z0-9]*[0-9A-Z])[A-Za-z0-9]{4,8}$|^(?=[a-z]*[0-9])[a-z0-9]{6,}$|[:[\]/]/.test(c);
function groupSelector(items) {
  const els = items.map(([, eb]) => eb), tags = [...new Set(els.map(e => e.tag))];
  const sets = els.map(e => new Set(String(e.cls).split(/\s+/).filter(c => c && !HASHED(c))));
  const common = [...sets[0]].filter(c => sets.every(s => s.has(c))).slice(0, 3);
  if (common.length) return (tags.length === 1 ? tags[0] : '') + common.map(c => '.' + c).join('');
  const anchors = [...new Set(els.map(e => e.anchor).filter(Boolean))];
  if (anchors.length === 1 && tags.length === 1) return `${anchors[0]} ${tags[0]}`;
  if (anchors.length > 1 && anchors.length <= 3 && tags.length === 1) return anchors.map(a => `${a} ${tags[0]}`).join(', ');
  const s = els[0].sel || ''; return s.replace(/:nth-of-type\(\d+\)$/, '') || null;
}
// Подсветка как в DevTools: зона margin (оранжевая), padding (зелёная), рамка элемента. Нулевой отступ — тонкая линия на его месте.
function marks(e, props) {
  const [x, y, w, h] = box(e), v = p => num(e.style?.[p]) || 0, out = [];
  const add = (kind, b, label) => out.push({ kind, box: b.map(Math.round), label });
  for (const p of props) {
    const val = v(p), line = Math.max(val, 0) || 0;
    if (p === 'margin-top') add('margin', [x, y - line, w, line || 1], `margin-top ${val}px`);
    if (p === 'margin-bottom') add('margin', [x, y + h, w, line || 1], `margin-bottom ${val}px`);
    if (p === 'margin-left') add('margin', [x - line, y, line || 1, h], `margin-left ${val}px`);
    if (p === 'margin-right') add('margin', [x + w, y, line || 1, h], `margin-right ${val}px`);
    if (p === 'padding-top') add('padding', [x, y, w, line || 1], `padding-top ${val}px`);
    if (p === 'padding-bottom') add('padding', [x, y + h - line, w, line || 1], `padding-bottom ${val}px`);
    if (p === 'padding-left') add('padding', [x, y, line || 1, h], `padding-left ${val}px`);
    if (p === 'padding-right') add('padding', [x + w - line, y, line || 1, h], `padding-right ${val}px`);
  }
  out.push({ kind: 'el', box: [x, y, w, h], label: e.tag });
  return out;
}

// --- какие снимки есть в обеих папках
const shotsOf = dir => fs.readdirSync(dir).filter(f => f.startsWith(prefix + '-') && f.endsWith('.json')).map(f => f.slice(prefix.length + 1, -5));
const common = shotsOf(args.a).filter(s => shotsOf(args.b).includes(s)).sort((x, y) => num(y) - num(x) || x.localeCompare(y));
if (!common.length) { console.error('Нет общих снимков в', args.a, 'и', args.b); process.exit(1); }

const findings = [], widths = [], coverage = [], matchesSummary = [];
let seq = 0;
const nextId = () => 'DR-' + String(++seq).padStart(2, '0');

for (const shot of common) {
  const A = JSON.parse(fs.readFileSync(path.join(args.a, `${prefix}-${shot}.json`), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(args.b, `${prefix}-${shot}.json`), 'utf8'));
  const w = A.width, state = A.state || 'default';
  const sid = shot;
  if (A.stepErrors?.length || B.stepErrors?.length) {
    console.warn(`⚠ ${shot}: состояние не достигнуто при съёмке — пропускаю`);
    coverage.push({ area: `${w} px · ${state}`, widths: [], status: 'not-checked', note: 'сценарий не выполнился: ' + [...(A.stepErrors || []), ...(B.stepErrors || [])][0] });
    continue;
  }
  fs.copyFileSync(path.join(args.a, `${prefix}-${shot}.png`), path.join(out, 'a', `${shot}.png`));
  fs.copyFileSync(path.join(args.b, `${prefix}-${shot}.png`), path.join(out, 'b', `${shot}.png`));

  // --- пиксели: сравниваем общую область, отличия собираем в прямоугольники по сетке 24 px
  const ia = PNG.sync.read(fs.readFileSync(path.join(out, 'a', `${shot}.png`)));
  const ib = PNG.sync.read(fs.readFileSync(path.join(out, 'b', `${shot}.png`)));
  const W = Math.min(ia.width, ib.width), H = Math.min(ia.height, ib.height);
  const crop = (img) => { const o = new PNG({ width: W, height: H }); PNG.bitblt(img, o, 0, 0, W, H, 0, 0); return o; };
  const ca = crop(ia), cb = crop(ib), diff = new PNG({ width: W, height: H });
  const bad = pixelmatch(ca.data, cb.data, diff.data, W, H, { threshold: 0.12, includeAA: false, alpha: 0.25 });
  fs.writeFileSync(path.join(out, 'diff', `${shot}.png`), PNG.sync.write(diff));
  const pct = bad / (W * H) * 100;
  const G = 24, gw = Math.ceil(W / G), gh = Math.ceil(H / G), grid = new Uint8Array(gw * gh);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (diff.data[i] > 200 && diff.data[i + 1] < 80) grid[Math.floor(y / G) * gw + Math.floor(x / G)]++;
  }
  const seen = new Uint8Array(gw * gh), regions = [];
  for (let c = 0; c < gw * gh; c++) {
    if (seen[c] || grid[c] < 6) continue;
    let minx = 1e9, miny = 1e9, maxx = 0, maxy = 0, area = 0; const st = [c]; seen[c] = 1;
    while (st.length) {
      const k = st.pop(), x = k % gw, y = Math.floor(k / gw); area += grid[k];
      minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = x + dx, ny = y + dy, n = ny * gw + nx;
        if (nx >= 0 && ny >= 0 && nx < gw && ny < gh && !seen[n] && grid[n] >= 6) { seen[n] = 1; st.push(n); }
      }
    }
    regions.push({ box: [minx * G, miny * G, (maxx - minx + 1) * G, (maxy - miny + 1) * G], area });
  }
  regions.sort((p, q) => q.area - p.area);

  widths.push({ id: sid, w, state, aImg: `a/${shot}.png`, bImg: `b/${shot}.png`, diffImg: `diff/${shot}.png`, diffPct: +pct.toFixed(2) });

  // --- сопоставление элементов: DOM-путь + текст, затем текст + порядок, затем DOM-путь
  const key1 = e => e.path + '|' + e.text, key2 = e => e.tag + '|' + e.text;
  const used = new Set(), pairs = [];
  const idx = (list, f) => { const m = new Map(); for (const e of list) { const k = f(e); if (!m.has(k)) m.set(k, []); m.get(k).push(e); } return m; };
  // По тексту без DOM-пути сопоставляем только уникальные тексты: одинаковые бейджи из разных карточек легко перепутать.
  const textCount = list => { const m = new Map(); for (const e of list) if (e.text) m.set(key2(e), (m.get(key2(e)) || 0) + 1); return m; };
  const tcA = textCount(A.elements), tcB = textCount(B.elements);
  const unique = e => e.text && tcA.get(key2(e)) === 1 && tcB.get(key2(e)) === 1;
  const passes = [
    // путь + текст; неуникальные и пустые тексты — только внутри той же карточки (ctx)
    e => unique(e) ? key1(e) : e.ctx !== undefined ? key1(e) + '|' + e.ctx : null,
    e => unique(e) ? key2(e) : null,
    // элементы без текста и неуникальные — по тегу+тексту/классу внутри той же карточки
    e => e.ctx !== undefined ? e.tag + '|' + (e.text || e.cls) + '|' + e.ctx : null,
  ];
  const matchedA = new Set();
  for (const [pi, f] of passes.entries()) {
    const mb = idx(B.elements.filter(e => !used.has(e.id)), e => f(e));
    for (const ea of A.elements) {
      if (matchedA.has(ea.id)) continue; const k = f(ea); if (k === null) continue;
      const cand = (mb.get(k) || []).filter(e => !used.has(e.id) && (pi < 2 || Math.abs(e.box.y - ea.box.y) <= 200)); if (!cand.length) continue;
      const eb = cand.sort((p, q) => Math.abs(p.box.y - ea.box.y) - Math.abs(q.box.y - ea.box.y))[0];
      used.add(eb.id); matchedA.add(ea.id); pairs.push([ea, eb]);
    }
  }
  const onlyA = A.elements.filter(e => !matchedA.has(e.id) && e.text);
  const onlyB = B.elements.filter(e => !used.has(e.id) && e.text);

  // --- стили и размеры: группируем одинаковые изменения
  const groups = new Map();
  let equalProps = 0;
  // Одинаковое ли содержимое: другие данные (текст, картинки) меняют размеры законно — это не баг вёрстки.
  const sameContent = (ea, eb) => (ea.textHash !== undefined && eb.textHash !== undefined ? ea.textHash === eb.textHash : ea.fullText === eb.fullText) && (ea.imgs ?? 0) === (eb.imgs ?? 0);
  const sizeChanged = [], perElement = [];
  for (const [ea, eb] of pairs) {
    const changes = [];
    for (const p of Object.keys(STYLE_PROPS)) {
      const va = ea.style[p], vb = eb.style[p]; if (va === vb) { equalProps++; continue; }
      if (STYLE_PROPS[p] === 'spacing' || p in PROP_TOL || p === 'border-top-width')
        if (Number.isFinite(num(va)) && Number.isFinite(num(vb)) && Math.abs(num(va) - num(vb)) <= (PROP_TOL[p] ?? TOL.spacing)) { equalProps++; continue; }
      if (p === 'border-top-color' && num(ea.style['border-top-width']) === 0 && num(eb.style['border-top-width']) === 0) continue;
      changes.push({ p, a: fmt(p, va), b: fmt(p, vb), d: Number.isFinite(num(va)) && Number.isFinite(num(vb)) && !/color|shadow/.test(p) ? +(num(vb) - num(va)).toFixed(1) : null });
    }
    const same = sameContent(ea, eb);
    for (const [p, ka] of [['width', 'width'], ['height', 'height']]) {
      const d = eb.box[ka] - ea.box[ka];
      if (Math.abs(d) > TOL.size) { if (same) changes.push({ p, a: ea.box[ka] + ' px', b: eb.box[ka] + ' px', d, size: true }); else sizeChanged.push({ ea, eb, d, prop: p, same }); }
    }
    if (!changes.length) continue;
    const sizeCh = changes.filter(c => c.size);
    if (sizeCh.length) sizeChanged.push(...sizeCh.map(c => ({ ea, eb, d: c.d, prop: c.p, same: true })));
    perElement.push({ ea, eb, changes });
  }

  // Отсекаем следствия, чтобы осталась причина:
  //  1) унаследованные свойства (цвет, шрифт), если у предка то же изменение — у иконок внутри ссылки, у span внутри кнопки;
  //  2) размеры элемента, у которого или внутри которого поменялись типографика/отступы/рамка (текст стал крупнее → блок выше);
  //  3) размеры родителей, если у вложенного элемента такое же изменение.
  const INHERITED = new Set(['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform']);
  const contains = (o, i) => o !== i && o.box.x <= i.box.x && o.box.y <= i.box.y && o.box.x + o.box.width >= i.box.x + i.box.width && o.box.y + o.box.height >= i.box.y + i.box.height;
  const isAncestor = (p, c) => c.ea.path.startsWith(p.ea.path + '>');
  const causeLike = pe => pe.changes.some(c => !c.size && ['typography', 'spacing', 'size'].includes(STYLE_PROPS[c.p]));
  for (const pe of perElement) {
    pe.changes = pe.changes.filter(c => {
      if (!c.size && INHERITED.has(c.p)) return !perElement.some(o => o !== pe && isAncestor(o, pe) && o.changes.some(x => x.p === c.p && x.a === c.a && x.b === c.b));
      if (c.size) {
        if (causeLike(pe) || perElement.some(o => o !== pe && contains(pe.eb, o.eb) && causeLike(o))) { pe.consequence = true; return false; }
        return !sizeChanged.some(s => s.same && s.eb !== pe.eb && contains(pe.eb, s.eb) && s.prop === c.p && Math.abs(s.d - c.d) <= TOL.size);
      }
      return true;
    });
  }
  // Группируем по каждому изменению отдельно, затем склеиваем группы с одинаковым набором элементов.
  const single = new Map();
  for (const pe of perElement) for (const c of pe.changes) {
    const sig = `${c.p}:${c.a}→${c.b}` + (c.size ? '|' + pe.ea.tag + '.' + (pe.ea.cls.split(' ')[0] || '') : '');
    if (!single.has(sig)) single.set(sig, { change: c, items: [] });
    single.get(sig).items.push([pe.ea, pe.eb]);
  }
  for (const g of single.values()) {
    const k = g.items.map(([ea]) => ea.id).sort((p, q) => p - q).join(',') + (g.change.size ? '|s' : '');
    if (!groups.has(k)) groups.set(k, { changes: [], items: g.items, size: !!g.change.size });
    groups.get(k).changes.push(g.change);
  }
  const consequences = perElement.filter(pe => pe.consequence).length;

  // --- сдвиги: группируем элементы по величине вертикального сдвига; у каждой группы ищем причину выше по странице
  const moving = pairs.filter(([ea, eb]) => ea.box.width > 20 && Math.abs(eb.box.y - ea.box.y) > TOL.shift);
  const clusters = new Map();
  for (const pr of moving) { const dy = pr[1].box.y - pr[0].box.y; const k = Math.round(dy / 2) * 2; if (!clusters.has(k)) clusters.set(k, []); clusters.get(k).push(pr); }
  const shifts = [];
  // Сдвиг, выше которого есть найденное изменение отступов/типографики, — следствие этого изменения, а не отдельный баг.
  const styleCauses = perElement.filter(pe => pe.changes.some(c => !c.size && ['spacing', 'typography', 'structure'].includes(STYLE_PROPS[c.p])));
  let explainedShifts = 0;
  for (const [dy, items] of [...clusters].filter(([, v]) => v.length >= 8).sort((p, q) => q[1].length - p[1].length)) {
    items.sort((p, q) => p[0].box.y - q[0].box.y);
    const start = items[0];
    if (styleCauses.some(pe => pe.ea.box.y <= start[0].box.y)) { explainedShifts++; continue; }
    if (shifts.length >= 4) continue;
    // кандидаты в причину: элементы выше точки начала сдвига, у которых изменилась высота
    const causes = sizeChanged.filter(s => s.prop === 'height' && s.ea.box.y <= start[0].box.y && s.ea.box.y + s.ea.box.height <= start[0].box.y + 4)
      .sort((p, q) => (q.ea.box.y + q.ea.box.height) - (p.ea.box.y + p.ea.box.height) || p.ea.box.height - q.ea.box.height);
    shifts.push({ dy, items, start, cause: causes[0] || null });
  }

  const wl = `${w} px${state !== 'default' ? ' · ' + state : ''}`;
  const sevOf = (cat, changes) => {
    const maxD = Math.max(0, ...changes.map(c => Math.abs(c.d ?? 0)));
    if (cat === 'typography' && changes.some(c => /font-size|font-family|font-weight/.test(c.p))) return 'major';
    if (cat === 'color') return 'major';
    if (cat === 'structure') return 'major';
    return maxD >= 8 ? 'major' : 'minor';
  };
  for (const g of [...groups.values()].sort((p, q) => q.items.length - p.items.length)) {
    const [ea0, eb0] = g.items[0];
    const cats = [...new Set(g.changes.map(c => c.size ? 'size' : STYLE_PROPS[c.p]))];
    const cat = cats.includes('typography') ? 'typography' : cats.includes('color') ? 'color' : cats[0];
    const isSize = g.changes.every(c => c.size);
    const n = g.items.length;
    const names = [...new Set(g.items.map(([e]) => label(e)))];
    const tags = [...new Set(g.items.map(([e]) => e.tag))];
    const cap = s => s[0].toUpperCase() + s.slice(1);
    const main = g.changes[0], what = `${cap(PROP_RU[main.p] || main.p)} ${main.a} → ${main.b}${g.changes.length > 1 ? ` и ещё ${g.changes.length - 1}` : ''}`;
    const where = n === 1 ? `у «${label(ea0)}»` : `· ${n} эл. ${tags.length <= 2 ? '‹' + tags.join('›, ‹') + '›' : ''}`;
    findings.push({
      id: nextId(), kind: 'bug', severity: isSize && Math.max(...g.changes.map(c => Math.abs(c.d))) < 8 ? 'minor' : sevOf(cat, g.changes), category: cat, auto: true,
      title: `${what} ${where}`.trim(),
      why: `${n === 1 ? 'Элемент' : n + ' элементов'} с одинаковым изменением на ${labelB.toLowerCase()} по сравнению с ${labelA === 'Прод' ? 'продом' : labelA.toLowerCase()}: ${names.slice(0, 6).map(t => `«${t}»`).join(', ')}${names.length > 6 ? ` и ещё ${names.length - 6}` : ''}.`,
      fix: isSize ? 'Проверить, изменение размера — следствие правок внутри блока или самостоятельное.' : 'Проверить, намеренное ли это изменение; если нет — вернуть значения эталона.',
      widths: [w], state,
      props: g.changes.map(c => ({ name: PROP_RU[c.p] || c.p, a: c.a, b: c.b, delta: c.d ? (c.d > 0 ? '+' : '') + c.d + (c.size || /padding|margin|gap|size|height|spacing|width/.test(c.p) ? ' px' : '') : '' })),
      css: g.changes.map(c => ({ prop: c.p, a: c.size ? c.a.replace(' ', '') : c.a, b: c.size ? c.b.replace(' ', '') : c.b })),
      selector: n > 1 ? groupSelector(g.items) : null,
      evidence: g.items.slice(0, 3).map(([ea, eb]) => {
        const ps = g.changes.map(c => c.p);
        return { shot: sid, w, a: box(ea), b: box(eb), aMarks: marks(ea, ps), bMarks: marks(eb, ps), dev: { a: dev(ea), b: dev(eb) } };
      }),
      occurrences: n,
    });
  }
  for (const s of shifts) {
    const [ea, eb] = s.start, d = eb.box.y - ea.box.y, c = s.cause;
    const byData = c && !c.same;
    const causeText = !c ? 'Блок с изменившейся высотой выше не найден — вероятно, изменился margin.'
      : byData ? `Выше по странице у «${label(c.ea)}» другое содержимое (данные окружений различаются) — высота ${c.ea.box.height} → ${c.eb.box.height} px. Скорее всего, это не баг вёрстки.`
      : `Вероятная причина — «${label(c.ea)}» (${c.ea.tag}${c.ea.cls ? '.' + c.ea.cls.split(' ')[0] : ''}): высота ${c.ea.box.height} → ${c.eb.box.height} px при том же содержимом.`;
    findings.push({
      id: nextId(), kind: 'bug', severity: byData ? 'discuss' : Math.abs(d) >= 8 ? 'major' : 'minor', category: 'spacing', auto: true,
      title: `${s.items.length} элементов сдвинуты на ${d > 0 ? '+' : ''}${d} px, начиная с «${label(ea)}»`,
      why: `На ${labelB.toLowerCase()} эти элементы стоят ${d > 0 ? 'ниже' : 'выше'} на ${Math.abs(d)} px. ${causeText}`,
      fix: byData ? 'Сравнить на одинаковых данных или пропустить.' : 'Проверить блок-причину: отступы и высоту.',
      widths: [w], state, occurrences: s.items.length,
      props: [{ name: 'вертикальная позиция', a: ea.box.y + ' px', b: eb.box.y + ' px', delta: (d > 0 ? '+' : '') + d + ' px' },
        ...(c ? [{ name: 'высота причины', a: c.ea.box.height + ' px', b: c.eb.box.height + ' px', delta: (c.eb.box.height - c.ea.box.height > 0 ? '+' : '') + (c.eb.box.height - c.ea.box.height) + ' px' }] : [])],
      evidence: [{ shot: sid, w, a: c ? box(c.ea) : box(ea), b: c ? box(c.eb) : box(eb),
        aMarks: [...(c ? marks(c.ea, []) : []), { kind: 'shift', box: box(ea), label: 'начало сдвига' }],
        bMarks: [...(c ? marks(c.eb, []) : []), { kind: 'shift', box: box(eb), label: `начало сдвига ${d > 0 ? '+' : ''}${d}px` }],
        dev: { a: dev(c ? c.ea : ea), b: dev(c ? c.eb : eb) } }],
    });
  }
  const contentNoise = t => /^[\d\s.,–—\-+₽$€%:/]+$/.test(t);
  // Ниже первого найденного изменения всё может съехать — пиксели и «пропавшие» на краю экрана тексты там не самостоятельны.
  const firstChangeY = Math.min(Infinity, ...perElement.filter(pe => pe.changes.some(c => !c.size)).map(pe => pe.ea.box.y), ...shifts.map(s => s.start[0].box.y));
  const anyShift = shifts.length > 0 || explainedShifts > 0;
  const edgeNoise = e => !A.fullPage && anyShift && (e.box.y < 120 || e.box.y + e.box.height > (A.viewportHeight || 900) - 120);
  const missA = onlyA.filter(e => !contentNoise(e.text) && !edgeNoise(e)), missB = onlyB.filter(e => !contentNoise(e.text) && !edgeNoise(e));
  if (missA.length) findings.push({
    id: nextId(), kind: 'bug', severity: 'discuss', category: 'absent', auto: true,
    title: `На ${labelB.toLowerCase()} нет ${missA.length} текстовых элементов ${labelA === 'Прод' ? 'прода' : labelA.toLowerCase()}`,
    why: 'Тексты: ' + missA.slice(0, 12).map(e => `«${e.text.slice(0, 40)}»`).join(', ') + (missA.length > 12 ? ' и др.' : '') + '. Могут отличаться данные на окружениях — проверить.',
    fix: 'Если это не разница в данных — вернуть элементы.', widths: [w], state, props: [],
    evidence: missA.slice(0, 3).map(e => ({ shot: sid, w, a: box(e), b: box(e) })),
  });
  if (missB.length) findings.push({
    id: nextId(), kind: 'bug', severity: 'discuss', category: 'structure', auto: true,
    title: `На ${labelB.toLowerCase()} ${missB.length} новых текстовых элементов`,
    why: 'Тексты: ' + missB.slice(0, 12).map(e => `«${e.text.slice(0, 40)}»`).join(', ') + (missB.length > 12 ? ' и др.' : '') + '.',
    fix: 'Проверить, что это ожидаемые изменения релиза.', widths: [w], state, props: [],
    evidence: missB.slice(0, 3).map(e => ({ shot: sid, w, a: box(e), b: box(e) })),
  });
  // Пиксельные области, которые не объяснены найденными изменениями (картинки, иконки, svg)
  const explained = findings.filter(f => f.evidence.some(e => e.shot === sid)).flatMap(f => f.evidence.map(e => e.b));
  const inter = (p, q) => !(p[0] + p[2] < q[0] || q[0] + q[2] < p[0] || p[1] + p[3] < q[1] || q[1] + q[3] < p[1]);
  const unexplained = regions.filter(r => r.box[1] + r.box[3] < firstChangeY && !explained.some(b => inter(r.box, b))).slice(0, 5);
  for (const r of unexplained) findings.push({
    id: nextId(), kind: 'bug', severity: 'minor', category: 'content', auto: true,
    title: `Визуальное отличие без изменения стилей (${r.box[2]}×${r.box[3]} px)`,
    why: 'Пиксели отличаются, а вычисленные стили элементов совпадают — обычно это другая картинка, иконка, SVG или данные.',
    fix: 'Посмотреть в режиме «Разница».', widths: [w], state, props: [],
    evidence: [{ shot: sid, w, a: r.box, b: r.box }],
  });

  coverage.push({ area: `Элементы, ${wl}`, widths: [w], status: 'checked', note: `сопоставлено ${pairs.length} из ${A.elements.length} (${labelA}) / ${B.elements.length} (${labelB}); пикселей отличается ${pct.toFixed(2)}%; изменений размера, объяснённых стилями внутри, — ${consequences}; групп сдвигов, объяснённых изменениями выше, — ${explainedShifts}` });
  matchesSummary.push({ area: wl, items: [`${equalProps} совпавших значений стилей у ${pairs.length} пар элементов`, `пиксельная разница ${pct.toFixed(2)}%`, `высота: ${A.pageHeight} → ${B.pageHeight} px`] });
}

const report = {
  meta: {
    title: args.title || `${labelA} ↔ ${labelB}`,
    labels: { a: labelA, b: labelB },
    testUrl: args.urlB || '', testLabel: labelB, figmaUrl: args.urlA || '', refLabel: labelA,
    createdAt: new Date().toISOString().slice(0, 10),
    state: [...new Set(widths.map(w => w.state))].join(', '),
    widths,
    method: `Обе версии сняты в Chromium на одинаковых ширинах. Элементы сопоставлены по DOM-пути и тексту, сравнены вычисленные стили (допуск ±1 px для отступов и шрифтов, ±2 px для размеров), одинаковые изменения сгруппированы. Сдвиги сведены к точке, где они начинаются. Пиксели сравнены pixelmatch (порог 0.12). Находки сгенерированы автоматически — перед отправкой разработчикам их стоит просмотреть.`,
    coverage,
  },
  findings,
  matches: matchesSummary,
};
fs.writeFileSync(path.join(out, 'findings.json'), JSON.stringify(report, null, 1));
console.log(`${findings.length} находок → ${path.join(out, 'findings.json')}`);
for (const w of widths) console.log(`  ${w.id}: пиксели ${w.diffPct}%`);
