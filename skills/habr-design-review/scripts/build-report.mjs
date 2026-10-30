// Собирает автономный HTML-отчёт из findings.json и скриншотов прогона.
// node scripts/build-report.mjs <runDir> [out.html]
//
// Попутно (в памяти, findings.json не меняется) дополняет находки, написанные вручную:
//  - ev.dev.b — селектор и классы элемента сайта: ищется в page-*.json по рамке ev.b (лучшее перекрытие);
//  - ev.aMarks / ev.bMarks — зоны margin/padding, если в находке есть css-свойства отступов
//    (значения: a — эталон/макет, b — сайт/стенд).
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { gapMeasurement } from './measurements.mjs';
import { summarizeUsage } from './usage-lib.mjs';
import { completeRevision } from './workspace-lib.mjs';

const [runDir, outArg] = process.argv.slice(2);
if (!runDir) { console.error('usage: build-report.mjs <runDir> [out.html]'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(path.join(runDir, 'findings.json'), 'utf8'));
const usageFile = path.join(runDir, 'token-usage.json');
data.meta.tokenUsage = fs.existsSync(usageFile) ? summarizeUsage(JSON.parse(fs.readFileSync(usageFile, 'utf8'))) : data.meta.pages?.length ? null : data.meta.tokenUsage || null;
const stateFile = path.join(runDir, 'state-plan.json');
if (fs.existsSync(stateFile)) data.meta.statePlan = JSON.parse(fs.readFileSync(stateFile, 'utf8')).states || [];
for (const s of data.meta.statePlan || []) {
  const pendingVisual = s.reviewMode === 'visual-hypothesis' && s.visualReview?.status !== 'checked';
  if (s.required === false || s.status === 'captured' && !pendingVisual) continue;
  data.meta.coverage ||= [];
  const id = 'state-plan:' + s.id;
  if (!data.meta.coverage.some(c => c.id === id)) data.meta.coverage.push({ id, area: `Состояние ${s.id}`, status: 'not-checked', note: s.ownerDecision ? `Ответ владельца: ${s.ownerDecision}` : pendingVisual ? 'Снимок есть, макета нет: визуальную целостность ещё нужно оценить, не пропускать состояние.' : s.question || 'Уточнить у пользователя сценарий, данные или доступ; состояние не проверено.' });
}
const imageAuditFile = path.join(runDir, 'image-audit.json');
if (fs.existsSync(imageAuditFile)) data.meta.imageAudit = JSON.parse(fs.readFileSync(imageAuditFile, 'utf8'));
const images = {};
for (const w of data.meta.widths) {
  for (const key of ['figmaImg', 'pageImg', 'aImg', 'bImg', 'cImg', 'diffImg']) {
    if (!w[key] || images[w[key]]) continue; // cImg — «было» в перепроверке (снимок исходного ревью)
    const file = path.join(runDir, w[key]);
    const buf = fs.readFileSync(file);
    const png = PNG.sync.read(buf);
    images[w[key]] = { src: 'data:image/png;base64,' + buf.toString('base64'), w: png.width, h: png.height };
  }
}

// --- дополнение находок
const num = v => { const m = /^-?[\d.]+/.exec(String(v)); return m ? parseFloat(m[0]) : NaN; };
const pageJson = {};
const loadPage = shot => {
  const s = data.meta.widths.find(x => String(x.id ?? x.w) === String(shot));
  const img = s && (s.bImg || s.pageImg); if (!img) return null;
  const f = path.join(runDir, img.replace(/\.png$/, '.json'));
  if (!(f in pageJson)) pageJson[f] = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).elements : null;
  return pageJson[f];
};
const iou = (p, q) => {
  const x1 = Math.max(p[0], q[0]), y1 = Math.max(p[1], q[1]), x2 = Math.min(p[0] + p[2], q[0] + q[2]), y2 = Math.min(p[1] + p[3], q[1] + q[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1); return inter / (p[2] * p[3] + q[2] * q[3] - inter || 1);
};
const SPACING = /^(margin|padding)-(top|right|bottom|left)$/;
function marksFor(b, css, side) {
  const [x, y, w, h] = b, out = [];
  for (const c of css || []) {
    if (!SPACING.test(c.prop)) continue;
    const v = num(c[side]); if (!Number.isFinite(v)) continue;
    const l = Math.max(v, 0) || 1, [kind, dir] = c.prop.split('-');
    const r = kind === 'margin'
      ? { top: [x, y - l, w, l], bottom: [x, y + h, w, l], left: [x - l, y, l, h], right: [x + w, y, l, h] }[dir]
      : { top: [x, y, w, l], bottom: [x, y + h - l, w, l], left: [x, y, l, h], right: [x + w - l, y, l, h] }[dir];
    out.push({ kind, box: r, label: `${c.prop} ${c[side]}` });
  }
  const spacing = out.length;
  // высота/ширина — размерная линия с выносными линиями (как в чертеже) снизу/справа от элемента, число на линии;
  // рамку элемента в таком кадре не рисуем — она сбивает с толку (видно и без неё, что меряем)
  for (const c of css || []) {
    if (!/^(height|width)$/.test(c.prop)) continue; // min-*: «мин. ширина 0» — не размер элемента, не рисуем
    const v = num(c[side]); if (!Number.isFinite(v)) continue;
    const vert = /height/.test(c.prop);
    out.push({ kind: 'size', axis: vert ? 'y' : 'x', el: b, box: vert ? [x + w, y, 34, h] : [x, y + h, w, 28], value: `${v} px`, label: `${c.prop} ${c[side]}` });
  }
  if (spacing) out.push({ kind: 'el', box: b, label: 'элемент' });
  return out;
}
// макет — тоже нужен (отступ до контейнера, отличающиеся символы)
const figJson = {};
const loadFig = shot => {
  const s = data.meta.widths.find(x => String(x.id ?? x.w) === String(shot));
  const img = s && (s.aImg || s.figmaImg); if (!img) return null;
  const f = path.join(runDir, img.replace(/\.png$/, '.json'));
  if (!(f in figJson)) figJson[f] = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).elements : null;
  return figJson[f];
};
const B = e => [e.box.x, e.box.y, e.box.width, e.box.height];
const contains = (o, i, sl = 1) => o[0] - sl <= i[0] && o[1] - sl <= i[1] && o[0] + o[2] + sl >= i[0] + i[2] && o[1] + o[3] + sl >= i[1] + i[3];
// Отступ от края контейнера до элемента («текст выходит за левый край плашки»): на сайте — от края плашки до текста,
// в макете — от края плашки до контейнера под текст (пунктиром), чтобы было видно, где должен стоять текст.
function insetMarks(el, els, side, isFig, edge) {
  if (!els) return [];
  const styled = e => isFig ? !!(e.style?.['background-color'] || parseFloat(e.style?.['border-top-width'])) : ((e.style?.['background-color'] && e.style['background-color'] !== 'rgba(0, 0, 0, 0)') || parseFloat(e.style?.['border-top-width']));
  const cy = el[1] + el[3] / 2;
  const ref = els.filter(e => styled(e) && e.box.y <= cy && e.box.y + e.box.height >= cy && e.box.width >= el[2] && Math.abs(e.box.x - el[0]) < 120 && !(e.box.x === el[0] && e.box.width === el[2]))
    .sort((p, q) => p.box.width * p.box.height - q.box.width * q.box.height)[0]; if (!ref) return [];
  const r = B(ref);
  // в макете — контейнер под текст (auto-layout-рамка внутри плашки, в которой лежит текст)
  const inner = isFig ? els.filter(e => e.kind === 'box' && contains(B(e), el) && contains(r, B(e)) && e.box.width < r[2] && e.box.width > el[2]).map(B).sort((p, q) => p[2] * p[3] - q[2] * q[3])[0] || el : el;
  const gap = Math.round(edge === 'right' ? (r[0] + r[2]) - (inner[0] + inner[2]) : inner[0] - r[0]);
  return [{ kind: 'inset', axis: 'x', edge, ref: r, inner, outline: inner !== el, el, value: `${gap} px`, label: `отступ ${edge === 'right' ? 'справа' : 'слева'} ${gap}px`,
    box: [Math.min(r[0], inner[0]) - 2, inner[1], Math.abs((edge === 'right' ? r[0] + r[2] : inner[0]) - (edge === 'right' ? inner[0] + inner[2] : r[0])) + 4, inner[3] + 30] }];
}
// Отличающиеся символы («до − 60%» / «до -60%»): общий префикс и суффикс, остальное — разница; шаблон измерит её
// положение в строке (measureText) и обведёт только эти символы.
function charMarks(el, text, other, style) {
  const a = String(text || ''), b = String(other || ''); if (!a || !b || a === b) return [];
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  let j = 0; while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  const from = i, to = Math.max(i + 1, a.length - j); if (to - from > a.length * 0.6) return [];
  const font = `${style?.['font-weight'] || 400} ${parseFloat(style?.['font-size']) || 14}px ${String(style?.['font-family'] || 'Inter').split(',')[0].replace(/["']/g, '')}`;
  return [{ kind: 'chars', el, text: a, from, to, font, value: `«${a.slice(from, to)}»`, label: `символы «${a.slice(from, to)}»`, box: el }];
}
let enriched = 0, relinked = 0;
// Ссылка на макет — на ближайший к элементу слой, который Figma открывает. Слои внутри экземпляра (id «I…;…») по ссылке
// не открываются; раньше тогда брался фрейм всей страницы (или группа фреймов) — дизайнер правил руками. Теперь — самый
// маленький открывающийся слой, в котором лежит элемент (кнопка → «карточка специалиста», заголовок модалки → «modal»).
const frameOf = shot => { const s = data.meta.widths.find(x => String(x.id ?? x.w) === String(shot)); const img = s && (s.aImg || s.figmaImg); if (!img) return null; const f = path.join(runDir, img.replace(/\.png$/, '.json')); try { return JSON.parse(fs.readFileSync(f, 'utf8')).frame?.id || null; } catch { return null; } };
function relink(ev) {
  const n = ev.figmaNode, ab = ev.a || ev.figma; if (!n || !ab) return;
  const els = loadFig(ev.shot ?? ev.w), frame = frameOf(ev.shot ?? ev.w); if (!els) return;
  const cur = n.link || n.id, curEl = els.find(e => e.id === cur), area = b => b[2] * b[3];
  const openable = e => e.id && !String(e.id).startsWith('I') && e.id !== frame && contains(B(e), ab, 2);
  const best = els.filter(openable).sort((p, q) => area(B(p)) - area(B(q)))[0];
  if (!best || best.id === cur) return;
  // своё (агент указал карточку, слой открывается и он не во всю страницу) не трогаем
  const tooFar = cur === frame || !curEl || String(cur).startsWith('I') || area(B(curEl)) > 25 * Math.max(area(ab), 1);
  if (!tooFar) return;
  if (!els.some(e => e.id === n.id) && n.id !== frame && !String(n.id).startsWith('I')) return; // слой из другого фрейма/файла — как указал агент
  if (process.env.DR_VERBOSE) console.log(`  ссылка: ${cur} (${curEl?.name || n.name || '?'}) → ${best.id} (${best.name})`);
  n.link = best.id; n.linkName = best.name; relinked++;
}
for (const f of data.findings) {
  for (const ev of f.evidence || []) {
    if (ev.measurement) {
      const gap = gapMeasurement(ev.measurement);
      ev.a = gap.a.box; ev.b = gap.b.box; ev.aMarks = gap.a.marks; ev.bMarks = gap.b.marks;
    }
    relink(ev);
    const bb = ev.b || ev.page, ab = ev.a || ev.figma, shot = ev.shot ?? ev.w;
    if (bb && !ev.dev?.b) {
      const els = loadPage(shot);
      if (els) {
        const best = els.filter(e => e.sel).map(e => ({ e, s: iou([e.box.x, e.box.y, e.box.width, e.box.height], bb) }))
          .filter(x => x.s > 0.6).sort((p, q) => q.s - p.s || p.e.box.width * p.e.box.height - q.e.box.width * q.e.box.height)[0];
        if (best) { ev.dev = { ...(ev.dev || {}), b: { sel: best.e.sel, selN: best.e.selN, cls: best.e.cls, tag: best.e.tag } }; enriched++; }
      }
    }
    // текст элемента — для ссылки на сайт с прокруткой к месту (#:~:text=…), в Jira разработчик попадает сразу к проблеме
    if (bb && !ev.textHint) {
      const els = loadPage(shot), clean = t => String(t || '').replace(/\s+/g, ' ').trim();
      const own = els?.filter(e => clean(e.text) && iou([e.box.x, e.box.y, e.box.width, e.box.height], bb) > 0.6).sort((p, q) => clean(p.text).length - clean(q.text).length)[0]
        || els?.filter(e => clean(e.text) && e.box.x >= bb[0] - 1 && e.box.y >= bb[1] - 1 && e.box.x + e.box.width <= bb[0] + bb[2] + 1 && e.box.y + e.box.height <= bb[1] + bb[3] + 1).sort((p, q) => p.box.y - q.box.y || p.box.x - q.box.x)[0];
      const t = clean(own?.text); if (t && t.length <= 80) ev.textHint = t; else if (t) ev.textHint = t.split(' ').slice(0, 6).join(' ');
    }
    // размер, названный словами («Высота кнопки 38 px»), а css про другое (flex) — тоже размерная линия
    // Значение — то, что относится к размеру и к ширине экрана этого кадра: в «На 768 px: ширина 720 px, …, Отступ слева
    // 24 px» для кадра 768 — 720, а не последнее число строки (было «Сайт 24px» — путало).
    const sizeCss = [...(f.css || [])];
    const shotW = data.meta.widths.find(x => String(x.id ?? x.w) === String(shot))?.w;
    const pick = (text, word) => {
      const segs = String(text ?? '').replace(/\[\[(?:ok|bad|b):([^\]]*)\]\]/g, '$1').split(/\n|,\s(?=[А-ЯЁA-Zа-яё])/);
      const lastPx = t => (t.match(/(\d+(?:[.,]\d+)?)\s?px/g) || []).pop();
      const seg = segs.find(t => word.test(t) && shotW && new RegExp(`\\b${shotW}\\s?px`).test(t)) || segs.find(t => word.test(t));
      return seg ? lastPx(seg.replace(shotW ? new RegExp(`На\\s*${shotW}\\s?px:?`, 'i') : /^$/, '')) : null;
    };
    if (!sizeCss.some(c => /^(height|width)$/.test(c.prop))) for (const p of [...(f.props || []), ...(f.values ? [{ name: '', a: f.values.a, b: f.values.b }] : [])]) {
      for (const [k, word] of [['height', /высот/i], ['width', /ширин/i]]) {
        const inName = word.test(p.name || '');
        const va = pick(inName ? `${p.name} ${p.a}` : p.a, word), vb = pick(inName ? `${p.name} ${p.b}` : p.b, word);
        if ((va || vb) && !sizeCss.some(c => c.prop === k)) sizeCss.push({ prop: k, a: (va || '').replace(/\s/g, ''), b: (vb || '').replace(/\s/g, '') });
      }
    }
    // перенос в несколько строк — не высота: в макете одна строка, на сайте две (рамки строк задаёт агент в aMarks/bMarks)
    const about0 = `${f.title} ${(f.props || []).map(p => p.name).join(' ')}`;
    if (/перенос|строк/i.test(about0)) sizeCss.length = 0;
    // A parent's padding must not be painted from its child's text box.
    const differentAnchor = f.selector && ev.dev?.b?.sel && f.selector !== ev.dev.b.sel;
    if (differentAnchor && sizeCss.some(c => SPACING.test(c.prop)) && !ev.measurement) {
      console.warn(`⚠ ${f.id}: отступ относится к другому контейнеру — задайте evidence.measurement с обеими границами`);
      for (let i = sizeCss.length - 1; i >= 0; i--) if (SPACING.test(sizeCss[i].prop)) sizeCss.splice(i, 1);
    }
    if (sizeCss.length && !ev.aMarks && !ev.bMarks) {
      const am = ab ? marksFor(ab, sizeCss, 'a') : [], bm = bb ? marksFor(bb, sizeCss, 'b') : [];
      if (am.length) ev.aMarks = am; if (bm.length) ev.bMarks = bm;
    }
    const about = `${f.title} ${(f.props || []).map(p => p.name).join(' ')}`;
    // символы: только отличающиеся символы, а не весь текст
    if (!ev.aMarks && !ev.bMarks && ab && bb && (f.symbol || /символ|знак|пробел|опечат|дефис|тире|минус/i.test(about))) {
      const pe = loadPage(shot), fe = loadFig(shot), clean = t => String(t || '').replace(/\s+/g, ' ').trim();
      const pt = pe?.filter(e => clean(e.text)).map(e => ({ e, s: iou(B(e), bb) })).sort((p, q) => q.s - p.s)[0];
      const ft = fe?.filter(e => e.kind === 'text' && clean(e.text)).map(e => ({ e, s: iou(B(e), ab) })).sort((p, q) => q.s - p.s)[0];
      if (pt?.s > 0.5 && ft?.s > 0.5) {
        const bm = charMarks(bb, clean(pt.e.text), clean(ft.e.text), pt.e.style), am = charMarks(ab, clean(ft.e.text), clean(pt.e.text), ft.e.style);
        if (bm.length && am.length) { ev.bMarks = bm; ev.aMarks = am; }
      }
    }
    // отступ до края контейнера: «выходит за край», «упирается», «отступ слева»
    if (!ev.aMarks && !ev.bMarks && ab && bb && /край|отступ|выходит|упира/i.test(about) && !(f.css || []).some(c => SPACING.test(c.prop))) {
      const edge = /прав/i.test(about) && !/лев/i.test(about) ? 'right' : 'left';
      const bm = insetMarks(bb, loadPage(shot), 'b', false, edge), am = insetMarks(ab, loadFig(shot), 'a', true, edge);
      if (bm.length && am.length) { ev.bMarks = bm; ev.aMarks = am; }
    }
  }
}

// Фронтенду нужно конкретно: какой элемент (селектор/класс) и какое свойство было → стало. Предупреждаем агента,
// у каких багов этого нет — дописать до того, как отдавать отчёт (структурные «нет блока» — хотя бы селектор контейнера).
{
  const ok = s => s && String(s).trim();
  const noSel = data.findings.filter(f => f.kind === 'bug' && !ok(f.selector) && !(f.evidence || []).some(e => ok(e.dev?.b?.sel)));
  const noCss = data.findings.filter(f => f.kind === 'bug' && !['text', 'absent', 'structure', 'content', 'logic', 'order', 'behavior', 'state'].includes(f.category) && !(f.css || []).some(c => /^-?[a-z][a-z-]*$/.test(c.prop || '')));
  if (noSel.length) console.log(`⚠ без селектора (фронтенд не найдёт элемент): ${noSel.map(f => f.id).join(', ')}`);
  if (noCss.length) console.log(`⚠ без CSS «было → стало» (непонятно, что менять): ${noCss.map(f => f.id).join(', ')}`);
}
const here = path.dirname(fileURLToPath(import.meta.url));
// Для разметки (feedback-*.json): где лежит прогон и на какой версии навыка он сделан — хеш скриптов и шаблона.
{
  const h = crypto.createHash('sha1');
  for (const f of fs.readdirSync(here).filter(f => /\.m?js$/.test(f)).sort()) h.update(fs.readFileSync(path.join(here, f)));
  h.update(fs.readFileSync(path.join(here, '..', 'templates', 'report.html')));
  data.meta.runDir = path.resolve(runDir); data.meta.skillVersion = h.digest('hex').slice(0, 10);
  data.meta.skillRelease = JSON.parse(fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8')).version;
}
const template = fs.readFileSync(path.join(here, '..', 'templates', 'report.html'), 'utf8');
const safe = s => JSON.stringify(s).replace(/</g, '\\u003c');
const html = template
  .replace('/*__DATA__*/null', safe(data))
  .replace('/*__IMAGES__*/null', safe(images))
  .replace('__TITLE__', 'Дизайн-ревью · ' + data.meta.title);
const out = outArg || path.join(runDir, 'report.html');
// решения дизайнера, сохранённые сервером отчёта, не теряются при пересборке: встраиваем их в новый отчёт
const decFile = path.join(path.dirname(out), 'decisions.json');
const saved = fs.existsSync(decFile) ? (() => { try { return JSON.parse(fs.readFileSync(decFile, 'utf8')).decisions; } catch { return null; } })() : null;
const TAG = '<script type="application/json" id="decisions">';
const html2 = saved && html.includes(TAG + '{}</script>') ? html.replace(TAG + '{}</script>', TAG + JSON.stringify(saved).replace(/</g, '\\u003c') + '</script>') : html;
fs.writeFileSync(out, html2);
const reviewRoot = path.resolve(out) === path.join(path.resolve(runDir), 'report.html') ? completeRevision(path.resolve(runDir)) : null;
// «Открыть отчёт.cmd» — двойной клик: сервер отчёта + браузер, решения сохраняются в эту папку сами
if (process.platform === 'win32') {
  const cmd = `@echo off\r\nstart "design-review" /min node "${path.join(here, 'serve-report.mjs')}" "%~dp0." --open\r\n`;
  fs.writeFileSync(path.join(path.dirname(out), 'Открыть отчёт.cmd'), cmd);
  if (reviewRoot) {
    const launcher = original => `@echo off\r\nstart "design-review" /min node "${path.join(here, 'serve-report.mjs')}" "%~dp0."${original?' --original':''} --open\r\n`;
    fs.writeFileSync(path.join(reviewRoot, 'Открыть отчёт.cmd'), launcher(false));
    fs.writeFileSync(path.join(reviewRoot, 'Открыть исходное ревью.cmd'), launcher(true));
  }
}
console.log(out, (fs.statSync(out).size / 1048576).toFixed(1) + ' MB', enriched ? `· селекторы добавлены к ${enriched} свидетельствам` : '', relinked ? `· ссылки на макет уточнены: ${relinked}` : '', saved ? '· решения из decisions.json встроены' : '');
