// Автосопоставление макета и сайта → черновик находок (kind: bug, auto: true) для просмотра агентом.
// node match-figma.mjs <runDir> [--out findings.auto.json] [--title "…"] [--figma-url <ссылка>] [--url <сайт>]
// В runDir: figma/figma-<w>[-<state>].json (+ .png) и page/page-<w>[-<state>].json (+ .png).
// Сопоставляются тексты интерфейса (не данные), затем их контейнеры; сравниваются типографика, цвет, отступы,
// скругления, фон, рамки. Одинаковые расхождения группируются. Данные (статьи, цены, имена) не сравниваются.
import fs from 'node:fs';
import path from 'node:path';
import { lintFigma } from './figma-lint.mjs';
import { PNG } from 'pngjs';
import { auditDetails } from './detail-audit.mjs';

// Где на снимке реально начинаются буквы текста (axis 'x' — левый край, 'y' — верхний): первый столбец/строка внутри
// рамки текста, где цвет заметно отличается от фона рядом. Нужен для пограничных отступов (≤ 3 px), когда рамки
// текста на сайте (Range) и в Figma (слой) меряются по-разному. null — нет снимка или фон неоднородный.
const pngCache = new Map();
function inkEdge(file, box, axis) {
  if (!pngCache.has(file)) { try { pngCache.set(file, fs.existsSync(file) ? PNG.sync.read(fs.readFileSync(file)) : null); } catch { pngCache.set(file, null); } }
  const im = pngCache.get(file); if (!im || !box) return null;
  const px = (x, y) => { const i = (Math.round(y) * im.width + Math.round(x)) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
  const d = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const x0 = Math.round(box.x), y0 = Math.round(box.y), w = Math.round(box.width), h = Math.round(box.height);
  if (x0 < 3 || y0 < 3 || x0 + w >= im.width || y0 + h >= im.height || w < 4 || h < 4) return null;
  // фон — по полосе перед текстом (слева или сверху); если он пёстрый (картинка) — не меряем
  const bgS = axis === 'x' ? Array.from({ length: h }, (_, i) => px(x0 - 2, y0 + i)) : Array.from({ length: Math.min(w, 200) }, (_, i) => px(x0 + i, y0 - 2));
  const bg = [0, 1, 2].map(c => bgS.map(p => p[c]).sort((a, b) => a - b)[bgS.length >> 1]);
  if (bgS.filter(p => d(p, bg) > 30).length > bgS.length * 0.2) return null;
  const lim = axis === 'x' ? Math.min(w, 40) : Math.min(h, 30);
  for (let k = -1; k < lim; k++) {
    const hit = axis === 'x' ? Array.from({ length: h }, (_, i) => px(x0 + k, y0 + i)).some(p => d(p, bg) > 90)
      : Array.from({ length: Math.min(w, 200) }, (_, i) => px(x0 + i, y0 + k)).some(p => d(p, bg) > 90);
    if (hit) return (axis === 'x' ? x0 : y0) + k;
  }
  return null;
}

const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const run = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!run) { console.error('usage: match-figma.mjs <runDir> [--out findings.auto.json]'); process.exit(1); }
const figDir = path.join(run, 'figma'), pageDir = path.join(run, 'page');

// ---------- утилиты
const num = v => { const m = /-?[\d.]+/.exec(String(v ?? '')); return m ? parseFloat(m[0]) : NaN; };
const rgb = v => {
  const s = String(v || '').trim();
  let m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s); if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)).concat(m[2] ? parseInt(m[2], 16) / 255 : 1);
  m = /rgba?\(([^)]+)\)/.exec(s); if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; }
  // color-mix(in srgb, #hex 20%, transparent) — так на сайтах часто задают «токен с прозрачностью»
  m = /color-mix\(in srgb,\s*([^\s,]+)\s+([\d.]+)%\s*,\s*transparent\s*\)/i.exec(s); if (m) { const c = rgb(m[1]); if (c) return [c[0], c[1], c[2], (c[3] ?? 1) * m[2] / 100]; }
  // color(srgb-linear …) — так Chromium отдаёт color-mix в линейном пространстве; переводим в обычный sRGB
  m = /color\(srgb-linear ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(s);
  if (m) { const g = c => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055); return [g(+m[1]), g(+m[2]), g(+m[3]), m[4] !== undefined ? +m[4] : 1]; }
  m = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(s); if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] !== undefined ? +m[4] : 1];
  return null;
};
const hex = c => c ? '#' + c.slice(0, 3).map(n => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase() + (c[3] < 1 ? Math.round(c[3] * 255).toString(16).padStart(2, '0').toUpperCase() : '') : '';
const cdist = (a, b) => (a && b) ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs((a[3] ?? 1) - (b[3] ?? 1)) * 255 : 0;
// Для сопоставления: тире/минусы (‐‑‒–—−) = дефис, неразрывные/узкие пробелы = пробел, пробелы вокруг дефиса не важны
// («до -60%» ↔ «до − 60%» — одна пара; разница символов — отдельная находка «другой символ»), ё = е, кавычки не важны.
const norm = t => String(t || '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"“”„]/g, '').replace(/[‐-―−]/g, '-').replace(/[     ]/g, ' ').replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
// Текст интерфейса (подписи, кнопки, вкладки), а не данные: короткий, без чисел и дат.
const isUiText = t => { const n = norm(t); return n.length >= 2 && n.length <= 40 && !/\d/.test(n) && !/^[^a-zа-я]+$/.test(n); };
const sim = (a, b) => { // похожесть строк 0..1 (Левенштейн)
  a = norm(a); b = norm(b); if (a === b) return 1; const m = a.length, n = b.length; if (!m || !n) return 0;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
};
const contains = (o, i, slack = 1) => o.x - slack <= i.x && o.y - slack <= i.y && o.x + o.width + slack >= i.x + i.width && o.y + o.height + slack >= i.y + i.height;
const area = b => b.width * b.height;
const bx = b => [b.x, b.y, b.width, b.height];
const tb = p => p.tbox || p.box; // рамка строки текста на сайте (если снята), иначе элемента
const SYSTEM_FONT = /-apple-system|system-ui|blinkmacsystemfont|segoe ui|^sf\b|sf pro|helvetica neue|roboto$/i;
const family = s => String(s || '').split(',')[0].replace(/["']/g, '').trim();
const RU = { 'font-size': 'размер шрифта', 'font-weight': 'начертание', 'line-height': 'межстрочный', 'letter-spacing': 'трекинг', color: 'цвет текста', 'text-transform': 'регистр',
  'font-family': 'шрифт', 'padding-top': 'отступ сверху', 'padding-right': 'отступ справа', 'padding-bottom': 'отступ снизу', 'padding-left': 'отступ слева',
  'margin-top': 'расстояние до элемента выше', 'border-radius': 'скругление', 'background-color': 'фон', 'border-top-width': 'толщина рамки', 'border-top-color': 'цвет рамки', 'border-sides': 'рамка по сторонам', 'border-width': 'рамка по сторонам', height: 'высота', text: 'текст' };
const CAT = { 'font-size': 'typography', 'font-weight': 'typography', 'line-height': 'typography', 'letter-spacing': 'typography', 'text-transform': 'typography', 'font-family': 'typography',
  color: 'color', 'background-color': 'color', 'border-top-color': 'color', 'border-top-width': 'size', 'border-sides': 'size', 'border-width': 'size', 'border-radius': 'radius', height: 'size', text: 'text' };

// ---------- токены (переменные) макета: figma/variables.json ({id: {name, collection, value}}) или variables.tsv
// (строки «<локальный id>@<8 символов ключа> | имя | коллекция | значение» из figma-variables.js)
const figVars = {};
{
  const vj = path.join(figDir, 'variables.json'), vt = path.join(figDir, 'variables.tsv');
  if (fs.existsSync(vj)) Object.assign(figVars, JSON.parse(fs.readFileSync(vj, 'utf8')));
  if (fs.existsSync(vt)) for (const line of fs.readFileSync(vt, 'utf8').split(/\r?\n/)) {
    const c = line.split(/\t|\s\|\s/).map(s => s.trim()); if (c.length < 2 || !c[1] || c[1] === '?') continue;
    figVars['short:' + c[0]] = { name: c[1], collection: c[2] || '', value: c[3] || '' };
  }
}
const varName = id => { if (!id) return null; if (figVars[id]) return figVars[id].name; const m = /^VariableID:([0-9a-f]{8})[0-9a-f]*\/(.+)$/.exec(id); return m && figVars[`short:${m[2]}@${m[1]}`] ? figVars[`short:${m[2]}@${m[1]}`].name : null; };
const tokNorm = n => String(n || '').replace(/^--/, '').toLowerCase().replace(/[\/_\s]+/g, '-');
const hslToRgb = s => { const m = /hsla?\(\s*([\d.]+)[, ]+([\d.]+)%[, ]+([\d.]+)%(?:[ ,/]+([\d.]+))?/.exec(s); if (!m) return null; const h = +m[1] / 360, sat = +m[2] / 100, l = +m[3] / 100;
  const f = n => { const k = (n + h * 12) % 12, a = sat * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); }; return [f(0), f(8), f(4), m[4] !== undefined ? +m[4] : 1]; };
const anyRgb = v => rgb(v) || hslToRgb(String(v || ''));

// ---------- пары снимков
let figFiles = fs.readdirSync(figDir).filter(f => /^figma-\d+.*\.json$/.test(f));
const exportManifest = path.join(figDir, 'frames.json');
if (fs.existsSync(exportManifest)) {
  const exported = JSON.parse(fs.readFileSync(exportManifest, 'utf8')).frames;
  if (exported?.length) figFiles = figFiles.filter(f => exported.some(e => e.json === f) || fs.existsSync(path.join(pageDir, f.replace(/^figma-/, 'page-')))); // A manifest may describe only the last export batch; retain existing exact pairs.
}
// Фреймы-фрагменты макета («комбинации кнопок в табе», «карточки откликов») часто без своего состояния на сайте:
// тогда пара — основной снимок этой ширины (или ширины ±2 px: фрейм 767 ↔ снимок 768), с пометкой «фрагмент».
// Копия основного снимка под именем состояния — тоже фрагмент. Во фрагменте позиции не совпадают со страницей, поэтому
// сопоставляются только тексты, уникальные с обеих сторон (иначе «Git», «Lead», «Docker» из разных карточек путаются).
const pageFiles = fs.existsSync(pageDir) ? fs.readdirSync(pageDir).filter(f => /^page-\d+.*\.json$/.test(f)) : [];
const statePlanFile = path.join(run, 'state-plan.json');
const statePlan = fs.existsSync(statePlanFile) ? JSON.parse(fs.readFileSync(statePlanFile, 'utf8')).states || [] : [];
const unresolvedStates = [], geometryWarnings = [];
const baseOf = w => { for (const d of [0, 1, -1, 2, -2]) { const f = `page-${w + d}.json`; if (pageFiles.includes(f)) return path.join(pageDir, f); } return null; };
const sameFile = (a, b) => { try { const sa = fs.statSync(a), sb = fs.statSync(b); return sa.size === sb.size && fs.readFileSync(a).equals(fs.readFileSync(b)); } catch { return false; } };
const shots = figFiles.map(f => ({ suffix: f.slice(6, -5), fig: path.join(figDir, f) })).map(s => {
  const own = path.join(pageDir, `page-${s.suffix}.json`), w = parseInt(s.suffix, 10), hasState = /^\d+-/.test(s.suffix), base = baseOf(w);
  const plan = statePlan.find(p => p.id === s.suffix);
  const mapped = plan?.kind === 'fragment' && plan.pageShot ? path.join(pageDir, `page-${plan.pageShot}.json`) : null;
  const chosen = mapped || own;
  let data = null; try { data = JSON.parse(fs.readFileSync(chosen, 'utf8')); } catch { }
  if (data && !data.stepErrors?.length && data.stateReached !== false) return { ...s, page: chosen, fragment: !!mapped || hasState && base && base !== own && sameFile(own, base) };
  const note = `Состояние ${s.suffix} не снято или не достигнуто. Уточнить у пользователя, как его открыть; стартовым экраном не заменять.`;
  console.error('  ' + note);
  unresolvedStates.push({ id: s.suffix, w, status: 'needs-clarification', question: plan?.question || note, ownerDecision: plan?.ownerDecision || null });
  return { ...s, page: null };
}).filter(s => s.page);
if (!shots.length) { console.error('Нет пар figma-*.json ↔ page-*.json в', run); process.exit(1); }

const findingsRaw = [], widths = [], coverage = [], matches = [], debug = {}, lintRaw = [], tokenSystems = [], detailFindings = [];
for (const shot of shots) {
  const F = JSON.parse(fs.readFileSync(shot.fig, 'utf8')), P = JSON.parse(fs.readFileSync(shot.page, 'utf8'));
  const w = F.frame?.w || P.width, state = P.state || 'default', sid = shot.suffix;
  widths.push({ id: sid, w, state, aImg: `figma/figma-${sid}.png`, bImg: `page/${path.basename(shot.page, '.json')}.png`, ...(shot.fragment ? { fragment: true } : {}) });
  // Обрезанное рамкой фрейма (REST отдаёт и то, что ниже границы) на макете не видно — не сравниваем.
  const fh = F.frame?.h || Infinity;
  F.elements = F.elements.filter(e => e.box.y < fh && e.box.y + e.box.height > 0 && e.box.x < w && e.box.x + e.box.width > 0);
  // Проверка одного компонента (--scope-site «кусок класса/селектора», --scope-figma «кусок имени/пути слоя»):
  // сравниваем только то, что внутри найденных блоков, — иначе вся остальная страница даёт шум (sticky-button)
  // Принадлежность — по вложенности (путь в DOM / путь слоёв), а не по рамке: плашка лежит поверх контента, и текст
  // страницы под ней попадает в её рамку. Рамка — запасной вариант, если пути нет.
  const inScope = (els, pred) => { const roots = els.filter(pred); if (!roots.length) return null;
    const inBox = (r, b) => b.x >= r.x - 1 && b.y >= r.y - 1 && b.x + b.width <= r.x + r.width + 1 && b.y + b.height <= r.y + r.height + 1;
    return els.filter(e => pred(e) || roots.some(r => r.path && e.path ? String(e.path).startsWith(String(r.path) + (/ \/ /.test(r.path) ? ' / ' : '>')) : inBox(r.box, e.box))); };
  // несколько вариантов через «|» (в вариантах макета слои называются по-разному)
  const anyOf = (k, t) => k.toLowerCase().split('|').map(x => x.trim()).filter(Boolean).some(x => t.toLowerCase().includes(x));
  if (opt('scope-figma')) { const s = inScope(F.elements, e => anyOf(opt('scope-figma'), `${e.name || ''} ${e.path || ''}`)); if (s) F.elements = s; else console.error(`⚠ ${w} px${state !== 'default' ? ' · ' + state : ''}: в макете нет слоя «${opt('scope-figma')}» — сравниваю весь фрейм`); }
  if (opt('scope-site')) { const s = inScope(P.elements, e => anyOf(opt('scope-site'), `${e.sel || ''} ${e.cls || ''}`)); if (s) P.elements = s; else console.error(`⚠ ${w} px${state !== 'default' ? ' · ' + state : ''}: на сайте нет элемента «${opt('scope-site')}» — сравниваю всю страницу`); }
  // В компоненте тексты с цифрами («до -60% скидка») — интерфейс, а не данные: в режиме компонента сравниваем все тексты
  const scoped = !!(opt('scope-figma') || opt('scope-site'));
  const isUi = t => scoped ? norm(t).length >= 2 && /[a-zа-я]/i.test(t) : isUiText(t);
  lintRaw.push(...lintFigma(F, { sid, w, state, tokens: Object.values(figVars).filter(v => /^#/.test(v.value || '')).map(v => ({ name: v.name, value: v.value })) }));
  const fTexts = F.elements.filter(e => e.kind === 'text' && isUi(e.text));
  const pTexts = P.elements.filter(e => e.text && isUi(e.text));
  const pBy = new Map(); for (const e of pTexts) { const k = norm(e.text); if (!pBy.has(k)) pBy.set(k, []); pBy.get(k).push(e); }
  const fCount = new Map(); for (const e of fTexts) fCount.set(norm(e.text), (fCount.get(norm(e.text)) || 0) + 1);

  // 1) уникальные точные совпадения → общий сдвиг страницы относительно макета
  const pairs = [], usedP = new Set(), usedF = new Set();
  for (const f of fTexts) { const c = pBy.get(norm(f.text)); if (c?.length === 1 && fCount.get(norm(f.text)) === 1) { pairs.push({ f, p: c[0], how: 'exact' }); usedP.add(c[0]); usedF.add(f); } }
  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  if (shot.fragment && pairs.length >= 3) {
    const mx = med(pairs.map(q => tb(q.p).x - q.f.box.x)), my = med(pairs.map(q => tb(q.p).y - q.f.box.y));
    for (let i = pairs.length - 1; i >= 0; i--) { const q = pairs[i]; if (Math.abs(tb(q.p).x - q.f.box.x - mx) > 120 || Math.abs(tb(q.p).y - q.f.box.y - my) > 400) { usedP.delete(q.p); usedF.delete(q.f); pairs.splice(i, 1); } }
  } else if (shot.fragment && pairs.length < 3) { for (const q of pairs.splice(0)) { usedP.delete(q.p); usedF.delete(q.f); } } // слишком мало опор — фрагмент не сопоставить
  const dy0 = med(pairs.map(q => tb(q.p).y - q.f.box.y)), dx0 = med(pairs.map(q => tb(q.p).x - q.f.box.x));
  // Местный сдвиг: по трём ближайшим (в макете) надёжным парам. Один общий сдвиг не годится, когда блоки
  // переставлены (сайдбар на 2000 px ниже) — тогда неоднозначные тексты ищутся не там.
  const anchors = pairs.slice();
  const localShift = f => {
    const near = anchors.map(q => ({ q, d: Math.hypot(q.f.box.x - f.box.x, q.f.box.y - f.box.y) })).sort((a, b) => a.d - b.d).slice(0, 3);
    if (!near.length) return [dx0, dy0];
    return [med(near.map(n => tb(n.q.p).x - n.q.f.box.x)), med(near.map(n => tb(n.q.p).y - n.q.f.box.y))];
  };
  const xTol = Math.min(120, w * 0.15); // допуск по горизонтали для неуникальных и похожих текстов
  const posCost = (f, p) => { const [lx, ly] = localShift(f); return Math.abs(tb(p).x - f.box.x - lx) + 0.25 * Math.abs(tb(p).y - f.box.y - ly); };
  // 2) неуникальные точные — по положению; 3) похожие (опечатки, другая формулировка) — по похожести и положению
  // Во фрагменте неуникальные — только когда фрагмент уже привязан к странице уникальными опорами, и строго по месту
  // (кнопка «Анализировать» в каждой карточке: берём ту, что стоит там же, где во фрагменте). Похожие во фрагменте не ищем.
  const fragAnchored = shot.fragment && pairs.length >= 3;
  if (!shot.fragment || fragAnchored) for (const f of fTexts) {
    if (usedF.has(f)) continue;
    const c = (pBy.get(norm(f.text)) || []).filter(p => !usedP.has(p)).sort((a, b) => posCost(f, a) - posCost(f, b))[0];
    // по горизонтали допуск жёстче: одинаковый текст в другой колонке («Москва» в фильтре и в карточке) — другой элемент
    const yOk = !shot.fragment || (c && Math.abs(tb(c).y - f.box.y - localShift(f)[1]) < 150);
    if (c && yOk && posCost(f, c) < 600 && Math.abs(tb(c).x - f.box.x - localShift(f)[0]) < xTol) { pairs.push({ f, p: c, how: 'exact' }); usedP.add(c); usedF.add(f); }
  }
  if (!shot.fragment) for (const f of fTexts) {
    if (usedF.has(f) || norm(f.text).length < 5) continue;
    let best = null;
    for (const p of pTexts) { if (usedP.has(p) || norm(p.text) === norm(f.text) || Math.abs(tb(p).x - f.box.x - localShift(f)[0]) >= xTol) continue; const s = sim(f.text, p.text); if (s >= 0.72 && posCost(f, p) < 400 && (!best || s - posCost(f, p) / 2000 > best.s - posCost(f, best.p) / 2000)) best = { p, s }; }
    if (best) { pairs.push({ f, p: best.p, how: 'similar', s: best.s }); usedP.add(best.p); usedF.add(f); }
  }

  const details = auditDetails(F, P, { sid, w, state, fragment: shot.fragment, anchors });
  detailFindings.push(...details.findings); geometryWarnings.push(...details.warnings);
  // ---------- сравнение текстов
  const diffs = []; let equal = 0;
  const add = (pair, prop, a, b, d, sev, fEl = pair.f, pEl = pair.p, css, extra) => diffs.push({ pair, prop, a, b, d, sev, fEl, pEl, css, ...extra });
  // Цвет с учётом токенов: макет — переменная/стиль Figma, сайт — CSS-переменная из совпавшего правила (capture, CDP).
  const cssVars = P.cssVars || {};
  // Разные системы токенов (сайт на habr-ui `--color-ui-*`, макет на библиотеке Education `elements/button/…`):
  // имена не совпадут никогда — «тот же цвет, другой токен» у каждого элемента это шум. Тогда — одна общая находка,
  // а по элементам сравниваются только значения цветов.
  const figTokNames = [...new Set(F.elements.flatMap(e => ['color', 'background-color', 'border-top-color'].map(p => varName(e.tokens?.[p]?.var) || e.tokens?.[p]?.style).filter(Boolean)))];
  const siteTokNorm = new Set(Object.keys(cssVars).map(tokNorm));
  const tokOverlap = figTokNames.length ? figTokNames.filter(n => siteTokNorm.has(tokNorm(n))).length / figTokNames.length : 1;
  const systemsDiffer = figTokNames.length >= 5 && siteTokNorm.size >= 5 && tokOverlap < 0.2;
  if (systemsDiffer) tokenSystems.push({ w, sid, fig: figTokNames.slice(0, 4), site: Object.keys(cssVars).filter(k => /color/.test(k)).slice(0, 4), overlap: tokOverlap, figN: figTokNames.length });
  const siteVarFor = (figTok, figRgb) => {
    // токен с прозрачностью слоя: color/ui/gray-4 при 20 % ↔ --color-ui-gray-4-20
    const al = figRgb?.[3] ?? 1, want = figTok ? tokNorm(figTok) + (al < 0.99 ? '-' + Math.round(al * 100) : '') : null;
    if (want) { const n = Object.keys(cssVars).find(k => tokNorm(k) === want); if (n) return n; }
    const byVal = Object.entries(cssVars).filter(([, v]) => { const c = anyRgb(v); return c && cdist(c, figRgb) <= 6; }).map(([k]) => k);
    return byVal.length === 1 ? byVal[0] : byVal.length ? byVal.sort((x, y) => x.length - y.length)[0] : null;
  };
  function colorDiff(pair, prop, fc, pc, fEl, pEl) {
    const ft = fEl.tokens?.[prop], figTok = varName(ft?.var) || ft?.style || null;
    const st = pEl.vars?.[prop], siteTok = st?.var || null, siteRaw = !siteTok && st?.raw && !/^(inherit|unset|currentcolor|revert|transparent)$/i.test(st.raw) ? st.raw : null;
    const lbl = (h, t, al = 1) => t ? `${h} · ${t}${al < 0.99 ? ' ' + Math.round(al * 100) + ' %' : ''}` : h;
    const d = cdist(fc, pc), sameTok = figTok && siteTok && tokNorm(figTok) === tokNorm(siteTok);
    const want = siteVarFor(figTok, fc);
    const cssA = want ? `var(${want})` : hex(fc);
    if (systemsDiffer && d <= 12) { equal++; return; } // значения совпали — имена токенов несравнимы
    if (d > 12) {
      const why = systemsDiffer ? null : sameTok ? 'token-value' : figTok && siteTok ? 'token-other' : figTok && siteRaw ? 'hardcoded' : null;
      add(pair, prop, lbl(hex(fc), figTok, fc?.[3] ?? 1), lbl(hex(pc), siteTok || (siteRaw ? 'без токена' : '')), null, d > 45 ? 'major' : 'minor', fEl, pEl,
        { a: cssA, b: siteTok ? `var(${siteTok})` : hex(pc) }, { tokenIssue: why, figTok, siteTok });
    } else if (figTok && siteTok && !sameTok && !(want && tokNorm(want) === tokNorm(siteTok))) {
      // цвет совпадает, но взят из другого токена — при смене темы/палитры разъедется
      add(pair, prop + '-token', figTok, siteTok, null, 'minor', fEl, pEl, { a: want ? `var(${want})` : hex(fc), b: `var(${siteTok})` }, { tokenIssue: 'token-other-same-color', figTok, siteTok, realProp: prop });
    } else if (figTok && siteRaw) {
      add(pair, prop + '-token', figTok, `${siteRaw} (без токена)`, null, 'minor', fEl, pEl, { a: want ? `var(${want})` : hex(fc), b: siteRaw }, { tokenIssue: 'hardcoded-same-color', figTok, siteTok: null, realProp: prop });
    } else equal++;
  }
  for (const q of pairs) {
    const fs_ = q.f.style, ps = q.p.style;
    // Разница текста — только опечатка-уровня: отличается одно слово и оно похоже (е/ё, дефис, буква). Заменено целое
    // слово («Кэшбек» → «Подарок» при покупке курса) — это другой контент/данные; пара остаётся для сравнения стилей.
    const typoLike = (a, b) => { const wa = norm(a).split(/\s+/), wb = norm(b).split(/\s+/); if (wa.length !== wb.length) return false;
      const dif = wa.map((w, i) => [w, wb[i]]).filter(([x, y]) => x !== y); return dif.length <= 1 && dif.every(([x, y]) => sim(x, y) >= 0.6); };
    if (q.how === 'similar' && typoLike(q.f.text, q.p.text)) add(q, 'text', `«${q.f.text}»`, `«${q.p.text}»`, null, 'discuss');
    // одинаковые после нормализации, но символы разные: минус вместо дефиса, лишний пробел, «е» вместо «ё», неразрывный дефис
    // (регистр не в счёт — его делает text-transform)
    const raw = t => String(t || '').replace(/\s+/g, ' ').trim();
    if (q.how === 'exact' && raw(q.f.text).toLowerCase() !== raw(q.p.text).toLowerCase())
      add(q, 'text', `«${raw(q.f.text)}»`, `«${raw(q.p.text)}»`, null, 'minor', q.f, q.p, null, { symbol: true });
    const fsz = num(fs_['font-size']), psz = num(ps['font-size']);
    if (Number.isFinite(fsz) && Number.isFinite(psz)) { if (Math.abs(fsz - psz) >= 0.5) add(q, 'font-size', `${fsz}px`, `${psz}px`, +(psz - fsz).toFixed(1), Math.abs(psz - fsz) >= 2 ? 'major' : 'minor'); else equal++; }
    const fw = num(fs_['font-weight']), pw = num(ps['font-weight']);
    if (Number.isFinite(fw) && Number.isFinite(pw)) { if (Math.abs(fw - pw) >= 100) add(q, 'font-weight', String(fw), String(pw), pw - fw, 'minor'); else equal++; }
    const flh = num(fs_['line-height']), plh = num(ps['line-height']);
    // Межстрочный у текста в одну строку при том же кегле — только если это видно (решение дизайнера, ai-response-ranking):
    // сдвигается то, что под текстом (следующая сопоставленная строка ниже), а если её нет — меняется высота элемента
    const lines = (h, lh) => Math.max(1, Math.round(h / (lh || h || 1)));
    const oneLine = lines(q.f.box.height, flh) === 1 && lines(tb(q.p).height, plh) === 1 && Math.abs((fsz || 0) - (psz || 0)) < 0.5;
    const lhVisible = () => {
      const nx = pairs.filter(o => o !== q && o.f.box.y >= q.f.box.y + q.f.box.height - 1 && o.f.box.y - q.f.box.y < 120 && Math.abs(o.f.box.x - q.f.box.x) < 200).sort((a, b) => a.f.box.y - b.f.box.y)[0];
      // по центрам строк: межстрочный растит строку симметрично, верх сдвигается, даже если текст на месте
      const cy = b => b.y + b.height / 2;
      if (nx) return Math.abs((cy(nx.f.box) - cy(q.f.box)) - (cy(tb(nx.p)) - cy(tb(q.p)))) > 2;
      return Math.abs(q.f.box.height - q.p.box.height) > 2;
    };
    if (Number.isFinite(flh) && Number.isFinite(plh)) { if (Math.abs(flh - plh) > 0.5 && (!oneLine || lhVisible())) add(q, 'line-height', `${flh}px`, `${plh}px`, +(plh - flh).toFixed(1), 'minor'); else equal++; }
    const fls = num(fs_['letter-spacing']) || 0, pls = ps['letter-spacing'] === 'normal' ? 0 : (num(ps['letter-spacing']) || 0);
    if (Math.abs(fls - pls) > 0.1) add(q, 'letter-spacing', `${fls}px`, `${pls}px`, +(pls - fls).toFixed(2), 'minor'); else equal++;
    const fc = rgb(fs_.color), pc = rgb(ps.color);
    const mixedColor = e => new Set((e.textRuns || []).map(r => r.style?.color)).size > 1;
    if (fc && pc && !mixedColor(q.f) && !mixedColor(q.p)) colorDiff(q, 'color', fc, pc, q.f, q.p);
    // регистр — как видно глазами: текст, набранный заглавными, равен text-transform: uppercase (и наоборот)
    const caps = t => /[a-zа-яё]/i.test(t || '') && t === String(t).toUpperCase();
    const lows = t => /[a-zа-яё]/i.test(t || '') && t === String(t).toLowerCase();
    const look = (tt, t) => tt === 'uppercase' || caps(t) ? 'uppercase' : (tt === 'lowercase' && lows(t)) || (tt === 'none' && lows(t)) ? 'lowercase-or-none' : tt === 'lowercase' ? 'lowercase' : tt;
    const ftt = fs_['text-transform'] || 'none', ptt = ps['text-transform'] || 'none';
    if (look(ftt, q.f.text) !== look(ptt, q.p.text)) add(q, 'text-transform', ftt, ptt, null, 'minor'); else equal++;
    const ff = family(fs_['font-family']), pf = family(ps['font-family']);
    if (ff && pf && !(SYSTEM_FONT.test(ff) || SYSTEM_FONT.test(pf)) && norm(ff).split(' ')[0] !== norm(pf).split(' ')[0]) add(q, 'font-family', ff, pf, null, 'major');
  }

  // ---------- контейнеры: ближайшие оформленные предки текста в макете ↔ элемент сайта похожего размера вокруг текста
  const fBoxes = F.elements.filter(e => e.kind === 'box'), pAll = P.elements;
  const looks = s => s && (num(s['padding-top']) || num(s['padding-left']) || num(s['border-radius']) || s['background-color'] || num(s['border-top-width']));
  const pLooks = s => (s['background-color'] && s['background-color'] !== 'rgba(0, 0, 0, 0)') || num(s['border-top-width']) || num(s['border-radius']) || num(s['padding-top']) || num(s['padding-left']);
  const doneC = new Set(), cpairs = []; let gapsN = 0;
  for (const q of pairs) {
    const fAnc = fBoxes.filter(b => contains(b.box, q.f.box) && area(b.box) > area(q.f.box) && looks(b.style)).sort((a, b) => area(a.box) - area(b.box)).slice(0, 3);
    for (const fb of fAnc) {
      if (fb.box.width > w * 0.9 && !scoped) break; // секции во всю ширину — раскладка, её смотрит агент (в режиме компонента — сам компонент)
      // обёртка текста без фона и рамки высотой почти со строку — не контейнер (в Figma фон чипа бывает отдельным слоем «fill»)
      if (!fb.style['background-color'] && !num(fb.style['border-top-width']) && fb.box.height <= q.f.box.height + 8) continue;
      // мелкие блоки (кнопки, плашки) тянутся по тексту — их ширина зависит от формулировки, допуск больше
      const wTol = fb.box.width < 240 ? Math.max(16, fb.box.width * 0.25) : Math.max(16, fb.box.width * 0.08);
      // сам элемент с текстом (подпись кнопки) — не контейнер: иначе рамку кнопки из макета сравним с подписью
      // (сама кнопка с текстом внутри — контейнер, если её рамка заметно больше строки текста)
      const bare = e => e === q.p && area(e.box) < area(tb(q.p)) * 1.3;
      const cand = pAll.filter(e => !bare(e) && contains(e.box, q.p.box) && pLooks(e.style) && Math.abs(e.box.width - fb.box.width) <= wTol && Math.abs(e.box.height - fb.box.height) <= Math.max(12, fb.box.height * 0.25))
        .sort((a, b) => (Math.abs(a.box.width - fb.box.width) + Math.abs(a.box.height - fb.box.height)) - (Math.abs(b.box.width - fb.box.width) + Math.abs(b.box.height - fb.box.height)))[0];
      // Ближайший к тексту блок не нашёлся на сайте — внешние уровни не сравниваем: расхождение внутреннего блока
      // иначе припишется внешнему (padding карточки вместо padding кнопки).
      if (!cand) break;
      if (Math.max(cand.box.height, fb.box.height) > 2 * Math.min(cand.box.height, fb.box.height)) break;
      // Крупный блок другого вида — другой вариант шаблона, а не ошибка: брендированная карточка на сайте (свой фон и рамка)
      // против обычной в макете. Пары карточек строятся по общим подписям («Откликнуться»), и вариант при этом не учитывается.
      if (fb.box.height > 120) {
        const bgF = rgb(fb.style['background-color']) || [255, 255, 255, 1], bgP = rgb(cand.style['background-color']);
        const bcF = rgb(fb.style['border-top-color']), bcP = rgb(cand.style['border-top-color']);
        const bgOk = !bgP || bgP[3] === 0 || cdist(bgF, bgP) <= 30, bcOk = !bcF || !bcP || !num(cand.style['border-top-width']) || cdist(bcF, bcP) <= 60;
        if (!bgOk || !bcOk) break;
      }
      const key = fb.id + '|' + cand.id; if (doneC.has(key)) continue; doneC.add(key);
      const cq = { f: fb, p: cand, how: 'box', label: q.f.text };
      cpairs.push(cq);
      // Отступы сравниваем по ФАКТИЧЕСКОМУ положению текста в контейнере, а не по значениям padding:
      // в вёрстке отступ часто задан у вложенного элемента, а в Figma — у рамки (значения разные, результат тот же).
      // Положение текста на сайте — по его content-box (без собственных padding/рамки элемента с текстом).
      // Рамка строки текста: tbox из capture (Range), для старых снимков — content-box элемента.
      const ps_ = q.p.style, pTextX = q.p.tbox ? q.p.tbox.x : q.p.box.x + (num(ps_['padding-left']) || 0) + (num(ps_['border-top-width']) || 0);
      const pTextY = q.p.tbox ? q.p.tbox.y + (q.p.tbox.height - (num(ps_['line-height']) || q.p.tbox.height)) / 2 : q.p.box.y + (num(ps_['padding-top']) || 0) + (num(ps_['border-top-width']) || 0);
      // Отступ показателен только у крайнего текста: левый — у самого левого в контейнере, верхний — у самого верхнего.
      // У остальных положение зависит от соседей (ширина счётчика «+163» против «+71» — это данные).
      const inside = pairs.filter(o => contains(fb.box, o.f.box));
      const leftmost = inside.every(o => o.f.box.x >= q.f.box.x), topmost = inside.every(o => o.f.box.y >= q.f.box.y);
      // Текст по центру блока (кнопка) — отступ слева зависит от длины надписи, это не padding
      const fRight = fb.box.x + fb.box.width - (q.f.box.x + q.f.box.width), centered = Math.abs((q.f.box.x - fb.box.x) - fRight) <= 3 && fRight > 4;
      const insets = [
        ...(leftmost && !centered ? [['padding-left', q.f.box.x - fb.box.x, Math.round(pTextX - cand.box.x)]] : []),
        // по вертикали — только если высоты контейнеров совпадают (иначе это находка про высоту)
        ...(topmost && Math.abs(fb.box.height - cand.box.height) <= 2 ? [['padding-top', q.f.box.y - fb.box.y, Math.round(pTextY - cand.box.y)]] : []),
      ];
      for (const [s, fIn0, pIn0] of insets) {
        // больше 64 px — это положение внутри крупного блока (кнопка внизу карточки), зависит от контента, а не отступ
        if (fIn0 > 64 && pIn0 > 64) continue;
        let fIn = fIn0, pIn = pIn0, how = '';
        // Пограничная разница (≤ 3 px): рамки текста на сайте и в макете меряются по-разному (Range vs слой) —
        // решаем по пикселям: где на снимках реально начинаются буквы относительно края блока (пропуск: свитч 49/50 по
        // рамкам, а буквы — 50/52).
        if (Math.abs(fIn - pIn) <= 3) {
          const fx = inkEdge(shot.fig.replace(/\.json$/, '.png'), q.f.box, s === 'padding-left' ? 'x' : 'y'), px = inkEdge(shot.page.replace(/\.json$/, '.png'), tb(q.p), s === 'padding-left' ? 'x' : 'y');
          if (fx != null && px != null) {
            const k = s === 'padding-left' ? 'x' : 'y';
            fIn = Math.round(fx - fb.box[k]); pIn = Math.round(px - cand.box[k]); how = 'ink';
            if (Math.abs(fIn - pIn) <= 1) { equal++; continue; }
          } else if (Math.abs(fIn - pIn) <= 1) { equal++; continue; }
        }
        const cur = num(cand.style[s]) || 0, target = cur + (fIn - pIn);
        if (target < 0) {
          geometryWarnings.push({ shot: sid, property: s, attemptedValue: target, figmaNode: fb.id, selector: cand.sel, reason: 'Недостоверная модель отступа: проверить ширину, переносы и выравнивание; отрицательный padding не предлагать.' });
          continue;
        }
        add(cq, s, `${fIn}px`, `${pIn}px`, pIn - fIn, Math.abs(pIn - fIn) >= 8 ? 'major' : 'minor', fb, cand,
          { a: `${target}px`, b: `${cur}px`, note: how === 'ink' ? `по пикселям: буквы начинаются в ${fIn}px от края блока в макете и в ${pIn}px на сайте` : `отступ текста от края блока: в макете ${fIn}px, на сайте ${pIn}px` });
      }
      const fr = num(fb.style['border-radius']), pr = num(cand.style['border-radius']);
      const fVisible = !!fb.style['background-color'] || !!fb.style['background-image'] || ['top', 'right', 'bottom', 'left'].some(sd => num(fb.style[`border-${sd}-width`]) > 0);
      if (Number.isFinite(fr) && Number.isFinite(pr) && fVisible) { if (Math.abs(fr - pr) > 1 && !(fr >= 100 && pr >= 100)) add(cq, 'border-radius', `${fr}px`, `${pr}px`, pr - fr, 'minor', fb, cand); else equal++; }
      const fbg = rgb(fb.style['background-color']), pbg = rgb(cand.style['background-color']);
      if (fbg && pbg && pbg[3] > 0) colorDiff(cq, 'background-color', fbg, pbg, fb, cand);
      // Рамки — по сторонам. Старые снимки/выгрузки знают только верх: тогда сравниваем верх и только если рамка есть
      // с обеих сторон (у Figma обводка бывает с одной стороны — разделители).
      const sides = fb.style['border-right-width'] !== undefined && cand.style['border-right-width'] !== undefined ? ['top', 'right', 'bottom', 'left'] : ['top'];
      // рамка тенью: box-shadow «0 0 0 1px …» (в т. ч. inset) — на экране это та же рамка 1 px
      const shadowRing = (() => { const m = /(?:^|,)\s*(?:inset\s+)?(?:rgba?\([^)]*\)\s+)?0px 0px 0px (\d+(?:\.\d+)?)px/.exec(String(cand.style['box-shadow'] || '')); return m ? +m[1] : 0; })();
      const faint = (rgb(fb.style['border-top-color']) || [0, 0, 0, 1])[3] < 0.15;
      const bw = sides.map(sd => [sd, faint && !(num(cand.style[`border-${sd}-width`]) || shadowRing) ? 0 : num(fb.style[`border-${sd}-width`]) || 0, num(cand.style[`border-${sd}-width`]) || shadowRing]);
      if (shadowRing && sides.length === 1 && !(num(cand.style['border-top-width']) > 0)) bw[0][2] = shadowRing;
      if (sides.length === 1) { const [, fsw, psw] = bw[0]; if (fsw > 0 && psw > 0 && Math.abs(fsw - psw) >= 1) add(cq, 'border-top-width', `${fsw}px`, `${psw}px`, psw - fsw, 'minor', fb, cand); }
      else {
        const dif = bw.filter(([, a, b]) => Math.abs(a - b) >= 1);
        // одинаковая разница со всех сторон — одна находка «толщина рамки», по сторонам — «рамка: …»
        if (dif.length === 4 && dif.every(([, a, b]) => a === dif[0][1] && b === dif[0][2])) add(cq, 'border-top-width', `${dif[0][1]}px`, `${dif[0][2]}px`, dif[0][2] - dif[0][1], 'minor', fb, cand);
        else if (dif.length) add(cq, 'border-sides', bw.map(([s, a]) => `${s} ${a}`).join(', '), bw.map(([s, , b]) => `${s} ${b}`).join(', '), null, 'minor', fb, cand, { a: bw.map(([, a]) => a + 'px').join(' '), b: bw.map(([, , b]) => b + 'px').join(' ') }, { realProp: 'border-width' });
      }
      // Высоту — только у блоков из одних текстов интерфейса: карточки с данными законно разной высоты.
      const dataInside = F.elements.some(e => e.kind === 'text' && contains(fb.box, e.box) && !isUiText(e.text));
      if (!dataInside && Math.abs(fb.box.height - cand.box.height) > 2) add(cq, 'height', `${fb.box.height}px`, `${cand.box.height}px`, cand.box.height - fb.box.height, Math.abs(cand.box.height - fb.box.height) >= 6 ? 'major' : 'minor', fb, cand);
    }
  }

  // ---------- расстояния между соседями: блок → следующий блок, строка → следующая строка в том же блоке
  // Меряем от низа верхнего до верха нижнего — высоты самих элементов на результат не влияют.
  // Причину (откуда отступ на сайте) — в подсказку: margin-bottom верхнего, margin-top нижнего.
  const hOverlap = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) / Math.max(1, Math.min(a.width, b.width));
  const below = (a, b) => b.y >= a.y + a.height - 1; // b целиком ниже a
  // ближайший родитель в макете: соседи — только элементы одного уровня (низ строки внутри карточки ≠ сосед следующей карточки)
  const fParent = el => fBoxes.filter(b => b !== el && contains(b.box, el.box) && area(b.box) > area(el.box)).sort((a, b) => area(a.box) - area(b.box))[0]?.id;
  // соседи и на сайте: между ними нет другого видимого содержимого (текста или оформленного блока)
  const pBetween = (a, b, onlyText) => P.elements.some(e => e.box.height > 4 && e.box.y >= a.y + a.height - 1 && e.box.y + e.box.height <= b.y + 1 && hOverlap(e.box, a) > 0.3
    && !contains(e.box, a) && !contains(e.box, b) && (e.text ? isUiText(e.text) || String(e.text).trim().length > 1 : !onlyText && pLooks(e.style)));
  const gapCheck = (x, y, fGap, pGap, tol, kind) => {
    // разница больше 40 px — это уже перестройка раскладки (другой блок между, перенос) — её смотрит агент
    if (pGap < 0 || Math.abs(fGap - pGap) > 40) return;
    gapsN++;
    if (Math.abs(fGap - pGap) <= tol) { equal++; return; }
    const mt = num(y.p.style['margin-top']) || 0, mb = num(x.p.style['margin-bottom']) || 0, d = pGap - fGap;
    add({ f: y.f, p: y.p, how: 'gap', label: `${String(x.label).slice(0, 24)} → ${String(y.label).slice(0, 24)}` }, 'margin-top', `${fGap}px`, `${pGap}px`, d, Math.abs(d) >= 8 ? 'major' : 'minor', y.f, y.p,
      { a: `${mt - d}px`, b: `${mt}px`, note: `${kind}: в макете ${fGap}px, на сайте ${pGap}px; сейчас у верхнего margin-bottom ${mb}px, у нижнего margin-top ${mt}px (остальное — padding/gap родителя)` });
  };
  // блоки
  const cuniq = [...new Map(cpairs.map(c => [c.f.id, c])).values()].filter(c => c.f.box.height > 24);
  for (const x of cuniq) {
    const px_ = fParent(x.f);
    const cands = cuniq.filter(y => y !== x && below(x.f.box, y.f.box) && hOverlap(x.f.box, y.f.box) >= 0.6 && !contains(y.f.box, x.f.box) && !contains(x.f.box, y.f.box) && fParent(y.f) === px_);
    const y = cands.sort((a, b) => a.f.box.y - b.f.box.y)[0]; if (!y) continue;
    const fGap = y.f.box.y - (x.f.box.y + x.f.box.height); if (fGap < 0 || fGap > 160) continue;
    // между ними в макете не должно быть другого блока (иначе это не соседи)
    if (fBoxes.some(z => z !== x.f && z !== y.f && hOverlap(z.box, x.f.box) > 0.3 && z.box.y >= x.f.box.y + x.f.box.height && z.box.y + z.box.height <= y.f.box.y && z.box.height > 8)) continue;
    if (!below(x.p.box, y.p.box) || hOverlap(x.p.box, y.p.box) < 0.6) continue; // на сайте порядок другой — это раскладка, её смотрит агент
    if (pBetween(x.p.box, y.p.box, false)) continue;
    gapCheck(x, y, fGap, Math.round(y.p.box.y - (x.p.box.y + x.p.box.height)), 1, 'расстояние между блоками');
  }
  // строки текста: соседние по вертикали тексты интерфейса, без других текстов между ними (данные сдвигают)
  const lineBox = p => { const t = tb(p), lh = num(p.style['line-height']) || t.height, n = Math.max(1, Math.round(t.height / lh)), top = t.y + t.height / 2 - n * lh / 2; return { top, bottom: top + n * lh }; };
  const fAllTexts = F.elements.filter(e => e.kind === 'text');
  for (const x of pairs) {
    const ys = pairs.filter(y => y !== x && below(x.f.box, y.f.box) && (hOverlap(x.f.box, y.f.box) > 0 || Math.abs(x.f.box.x - y.f.box.x) <= 4)).sort((a, b) => a.f.box.y - b.f.box.y);
    const y = ys[0]; if (!y) continue;
    const fGap = y.f.box.y - (x.f.box.y + x.f.box.height); if (fGap < 0 || fGap > 60) continue;
    // строки в одном блоке (заголовок и текст под ним): общий ближайший оформленный предок
    const anc = t => fBoxes.filter(b => contains(b.box, t.box) && area(b.box) > area(t.box) && looks(b.style)).sort((a, b) => area(a.box) - area(b.box))[0]?.id;
    if (anc(x.f) !== anc(y.f)) continue;
    if (fAllTexts.some(t => t !== x.f && t !== y.f && t.box.y >= x.f.box.y + x.f.box.height - 1 && t.box.y + t.box.height <= y.f.box.y + 1 && hOverlap(t.box, x.f.box) > 0)) continue;
    // межстрочный или кегль уже разошлись — расстояние изменилось как следствие, отдельной находкой не дублируем
    if ([x, y].some(q => Math.abs((num(q.f.style['line-height']) || 0) - (num(q.p.style['line-height']) || 0)) > 1 || Math.abs(num(q.f.style['font-size']) - num(q.p.style['font-size'])) > 0.5)) continue;
    const a = lineBox(x.p), b = lineBox(y.p); if (b.top < a.bottom - 2) continue;
    if (pBetween({ ...tb(x.p), y: a.top, height: a.bottom - a.top }, { ...tb(y.p), y: b.top, height: b.bottom - b.top }, true)) continue;
    gapCheck({ ...x, label: x.f.text }, { ...y, label: y.f.text }, fGap, Math.round(b.top - a.bottom), 2, 'расстояние между строками');
  }

  // ---------- группировка одинаковых расхождений
  const groups = new Map();
  for (const d of diffs) {
    const k = `${d.prop}|${d.a}|${d.b}|${d.prop === 'text' ? d.pair.f.id : ''}`;
    if (!groups.has(k)) groups.set(k, { ...d, items: [] });
    groups.get(k).items.push(d);
  }
  for (const g of groups.values()) {
    const uniq = []; const seenP = new Set(); for (const it of g.items) if (!seenP.has(it.pEl.id)) { seenP.add(it.pEl.id); uniq.push(it); }
    const names = [...new Set(uniq.map(it => it.pair.label || it.pair.f.text || it.fEl.name))];
    findingsRaw.push({ g, uniq, names, sid, w, state });
  }
  debug[sid] = pairs.map(q => ({ how: q.how, text: q.f.text, fig: bx(q.f.box), figId: q.f.id, page: bx(tb(q.p)), sel: q.p.sel, pageText: q.p.text }));
  const fUi = fTexts.length, missing = fTexts.filter(f => !usedF.has(f));
  coverage.push({ area: `Тексты интерфейса, ${w} px${state !== 'default' ? ' · ' + state : ''}`, widths: [w], status: 'checked',
    note: `сопоставлено ${pairs.length} из ${fUi} текстов интерфейса (точно ${pairs.filter(q => q.how === 'exact').length}, похоже ${pairs.filter(q => q.how === 'similar').length}); контейнеров сравнено ${doneC.size}; расстояний между соседями ${gapsN}; пары — в match-pairs.json` });
  if (missing.length) findingsRaw.push({ missing, sid, w, state });
  matches.push({ area: `${w} px${state !== 'default' ? ' · ' + state : ''}`, items: [`${equal} совпавших значений`, `${pairs.length} пар текстов`, `${doneC.size} пар контейнеров`] });
}

// ---------- находки
// Слой макета для ссылки: link — открываемый узел (экземпляр, а не слой внутри него), frame — запасной, comp — компонент
// (ссылка на главный компонент в библиотеке и переопределения: дизайнер кастомизировал?)
const figNode = e => ({ id: e.id, name: e.name || e.text, ...(e.link ? { link: e.link } : {}), ...(e.frame ? { frame: e.frame } : {}), ...(e.inst ? { comp: { name: e.inst.name, url: e.inst.url, lib: e.inst.lib, custom: e.inst.overrides || [] } } : {}) });
const SEVR = { critical: 0, major: 1, minor: 2, discuss: 3 };
const findings = [];
let n = 0;
const px = v => String(v).replace('px', ' px');
for (const r of findingsRaw.filter(r => r.g).sort((a, b) => SEVR[a.g.sev] - SEVR[b.g.sev] || b.uniq.length - a.uniq.length)) {
  const { g, uniq, names, sid, w, state } = r, cnt = uniq.length, first = uniq[0];
  const isText = g.prop === 'text';
  const delta = g.d === null || g.d === undefined ? '' : (g.d > 0 ? '+' : '') + g.d + (/^(color|text-transform|font-weight|font-family)$/.test(g.prop) ? '' : ' px');
  const realProp = g.realProp || g.prop, cap = s => s[0].toUpperCase() + s.slice(1);
  const elems = `${cnt === 1 ? 'Элемент' : cnt + ' элементов'}: ${names.slice(0, 6).map(t => `«${String(t).slice(0, 30)}»`).join(', ')}${names.length > 6 ? ` и ещё ${names.length - 6}` : ''}.`;
  const where = cnt > 1 ? ` · ${cnt} эл.` : ` у «${names[0]}»`;
  // Формулировки для токенов: что именно чинить — компонент, определение токена или захардкоженный цвет.
  const TOK = {
    'token-other': [`${cap(RU[realProp])}: токен ${g.siteTok} вместо ${g.figTok}${where}`, `В макете цвет задан токеном ${g.figTok}, на сайте — токеном ${g.siteTok}, и цвета различаются (${px(g.a)} → ${px(g.b)}). Чинить в компоненте: сменить токен.`],
    'token-value': [`Токен ${g.siteTok} на сайте другого цвета${where}`, `И в макете, и на сайте используется токен ${g.figTok}, но значения разные (${px(g.a)} → ${px(g.b)}). Чинить определение токена в CSS, а не компонент.`],
    'hardcoded': [`${cap(RU[realProp])} задан без токена (${String(g.b).split(' · ')[0]}), в макете ${g.figTok}${where}`, `В макете — токен ${g.figTok}, на сайте цвет задан значением без токена и отличается (${px(g.a)} → ${px(g.b)}).`],
    'token-other-same-color': [`Тот же цвет, но другой токен: ${g.siteTok} вместо ${g.figTok}${where}`, `Сейчас цвета совпадают, но при смене темы или палитры разъедутся: в макете ${g.figTok}, на сайте ${g.siteTok}.`],
    'hardcoded-same-color': [`Цвет без токена (в макете ${g.figTok})${where}`, `Цвет совпадает с макетом, но на сайте задан значением, а не токеном ${g.figTok} — не обновится вместе с дизайн-системой.`],
  }[g.tokenIssue];
  findings.push({
    id: 'AUTO-' + String(++n).padStart(2, '0'), kind: 'bug', severity: g.tokenIssue?.endsWith('same-color') ? 'minor' : g.sev, category: CAT[realProp] || 'spacing', auto: true,
    title: isText ? (g.symbol ? `Другой символ в тексте: ${g.a} в макете, ${g.b} на сайте` : `Текст отличается: ${g.a} в макете, ${g.b} на сайте`) : TOK ? TOK[0] : `${cap(RU[g.prop])} ${px(g.b)} вместо ${px(g.a)}${where}`,
    why: isText ? (g.symbol ? 'Текст тот же, но символы разные: тире/минус вместо дефиса, лишний или неразрывный пробел, «е» вместо «ё» — на экране выглядит иначе. Проверить, какой вариант правильный.' : 'Похожие, но разные формулировки. Проверить, какая правильная.') : TOK ? `${elems} ${TOK[1]}` : `${elems} В макете ${px(g.a)}, на сайте ${px(g.b)}.`,
    fix: isText ? 'Согласовать формулировку.' : g.pair?.how === 'gap' ? `Расстояние должно быть ${px(g.a)}: ${g.css.note}. Например, margin-top нижнего элемента: ${g.css.a}.`
      : `${realProp}: ${g.css?.a || g.a}${g.css?.note ? ` (${g.css.note} — в макете отступ от рамки до контента ${g.a})` : ''}`,
    widths: [w], state, occurrences: cnt,
    props: [{ name: g.tokenIssue?.endsWith('same-color') ? 'токен' : RU[realProp], a: px(g.a), b: px(g.b), delta }],
    css: isText || g.prop === 'height' ? [] : [{ prop: realProp, a: g.css?.a || g.a, b: g.css?.b || g.b }],
    evidence: uniq.slice(0, 3).map(it => ({ shot: sid, w, a: bx(it.fEl.box), b: bx(it.pEl.box), figmaNode: figNode(it.fEl), dev: { b: { sel: it.pEl.sel, selN: it.pEl.selN, cls: it.pEl.cls, tag: it.pEl.tag } } })),
  });
}
// «В макете есть, на сайте не найдено» — справка для агента и «Что проверено», а не находка: почти всегда это
// другое состояние (вход, фильтры), данные или блок за пределами снимка. Отсутствие блока агент оформляет сам.
for (const r of findingsRaw.filter(r => r.missing)) {
  coverage.push({ area: `Тексты макета, не найденные на сайте, ${r.w} px${r.state !== 'default' ? ' · ' + r.state : ''}`, widths: [r.w], status: 'not-checked',
    note: `${r.missing.length}: ` + r.missing.slice(0, 15).map(e => `«${e.text}»`).join(', ') + (r.missing.length > 15 ? ' и др.' : '') + ' — другое состояние, данные или блока нет; проверить по снимкам' });
}
// Разные системы токенов — одна находка на весь прогон (вместо «тот же цвет, другой токен» у каждого элемента)
if (tokenSystems.length) {
  const t = tokenSystems[0];
  findings.push({
    id: 'AUTO-' + String(++n).padStart(2, '0'), kind: 'bug', severity: 'discuss', category: 'color', auto: true,
    title: 'Сайт и макет на разных системах токенов — имена цветов не сопоставить',
    why: `В макете цвета привязаны к токенам вида ${t.fig.map(x => `«${x}»`).join(', ')} (${t.figN} шт.), на сайте — к переменным вида ${t.site.map(x => `«${x}»`).join(', ')}; совпадающих имён ${Math.round(t.overlap * 100)} %. Поэтому по элементам сравнивались только значения цветов. Если это две библиотеки одной дизайн-системы — нужна таблица соответствия токенов.`,
    fix: 'Решить, какая система токенов эталонная, и либо перевести вёрстку на токены макета, либо завести соответствие имён.',
    widths: [...new Set(tokenSystems.map(x => x.w))].sort((a, b) => b - a), props: [], evidence: [{ shot: t.sid, w: t.w, a: [0, 0, t.w, 600], b: [0, 0, t.w, 600] }],
  });
}

// Одинаковое расхождение на разных ширинах (тот же элемент, то же свойство и значения) — одна находка
findings.push(...detailFindings);
// с несколькими ширинами и свидетельством на каждой, а не по карточке на ширину.
{
  const merged = [], byKey = new Map();
  for (const f of findings) {
    const sel = f.evidence[0]?.dev?.b?.sel || f.evidence[0]?.figmaNode?.name || '';
    const key = f.category === 'absent' ? null : [f.title.replace(/ · \d+ эл\./, ''), f.props.map(p => `${p.a}|${p.b}`).join(';'), sel].join('#');
    if (key && byKey.has(key)) {
      const m = byKey.get(key);
      m.widths = [...new Set([...m.widths, ...f.widths])].sort((a, b) => b - a);
      m.evidence.push(...f.evidence.slice(0, 1));
      m.occurrences = Math.max(m.occurrences || 1, f.occurrences || 1);
      if (SEVR[f.severity] < SEVR[m.severity]) m.severity = f.severity;
    } else { if (key) byKey.set(key, f); merged.push(f); }
  }
  findings.length = 0; findings.push(...merged);
  findings.forEach((f, i) => { f.id = 'AUTO-' + String(i + 1).padStart(2, '0'); });
}
// Проверка самого макета (figma-lint): одно правило и значение на разных ширинах — одна находка «MK-NN».
{
  const byKey = new Map();
  for (const r of lintRaw) { const m = byKey.get(r.key); if (m) { m.widths.push(r.w); m.evidence.push(...r.evidence.slice(0, 1)); m.occurrences = Math.max(m.occurrences, r.count); } else byKey.set(r.key, { ...r, widths: [r.w], occurrences: r.count }); }
  [...byKey.values()].sort((a, b) => b.occurrences - a.occurrences).forEach((r, i) => findings.push({
    id: 'MK-' + String(i + 1).padStart(2, '0'), kind: 'mockup', severity: 'minor', category: 'mockup', auto: true,
    title: r.title, why: `${r.names.length ? 'Слои: ' + r.names.map(t => `«${String(t).slice(0, 30)}»`).join(', ') + '. ' : ''}${r.why}`, fix: r.fix,
    widths: [...new Set(r.widths)].sort((a, b) => b - a), state: r.state, occurrences: r.occurrences,
    props: [{ name: r.prop, a: r.value, b: '—' }], evidence: r.evidence,
  }));
}
const prev = fs.existsSync(path.join(run, 'findings.json')) ? JSON.parse(fs.readFileSync(path.join(run, 'findings.json'), 'utf8')) : null;
const report = {
  meta: {
    runId: prev?.meta?.runId || path.basename(path.resolve(run)), title: opt('title') || prev?.meta?.title || 'Дизайн-ревью', labels: { a: 'Макет', b: 'Сайт' },
    figmaUrl: opt('figma-url') || prev?.meta?.figmaUrl || '', testUrl: opt('url') || prev?.meta?.testUrl || '',
    createdAt: new Date().toISOString().slice(0, 10), state: [...new Set(widths.map(w => w.state))].join(', '), widths,
    method: 'Автосопоставление: тексты интерфейса макета найдены на странице (точно или по похожести, с учётом общего сдвига), сравнены их стили и стили оформленных контейнеров вокруг. Допуски: шрифт 0,5 px, отступы и скругления 1 px, цвет ~12 единиц RGB. Данные (статьи, цифры, имена) не сравниваются. Раскладку, порядок блоков и адаптив проверяет агент.',
    coverage: [...coverage, ...unresolvedStates.map(s => ({ area: `Состояние ${s.id}`, widths: [s.w], status: 'not-checked', note: s.question, ownerDecision: s.ownerDecision }))], unresolvedStates, geometryWarnings,
  },
  findings, matches,
};
// findings.auto.json — всегда «сырой» выход автоматики (по нему feedback.mjs размечает её точность);
// findings.json — рабочая копия, которую чистит агент: создаётся, только если её ещё нет.
const outFile = opt('out') || (prev ? 'findings.auto.json' : 'findings.json');
fs.writeFileSync(path.join(run, outFile), JSON.stringify(report, null, 1));
if (!opt('out') && outFile !== 'findings.auto.json') fs.writeFileSync(path.join(run, 'findings.auto.json'), JSON.stringify(report, null, 1));
// Пары «текст макета ↔ элемент сайта» — для проверки агентом, что сопоставление осмысленное.
fs.writeFileSync(path.join(run, 'match-pairs.json'), JSON.stringify(debug, null, 1));
console.log(`${findings.length} находок → ${path.join(run, outFile)}`);
for (const c of coverage) console.log('  ' + c.area + ': ' + c.note);
