// Перепроверка исправлений после дизайн-ревью.
//
//   node scripts/recheck.mjs plan  <исходный прогон> <новый прогон> [--decisions файл]
//   …снять страницы заново (команды печатает plan) …
//   node scripts/recheck.mjs check <новый прогон>
//   node scripts/build-report.mjs <новый прогон>
//
// plan  — берёт находки с решением «Баг» и «Допустимо» (и найденные дизайнером), для каждой — что мерить:
//         селектор элемента, CSS-свойства (было на сайте → как в макете), check-и агента (расстояние между элементами).
//         Решения — из decisions.json (сервер отчёта), из <script id="decisions"> в report.html, из feedback-*.json
//         или сохранённого «с решениями» HTML (--decisions). Копирует макеты страниц в новый прогон (для match-figma).
// check — меряет то же в новой съёмке и ставит статус: fixed / partial / not-fixed / look (изменилось не так, как
//         ожидалось, или элемента нет) / eyes (мерить нечего — смотреть глазами) / kept («Допустимо» без изменений).
//         Пишет recheck.json и findings.json для отчёта в режиме перепроверки (кадры «было | сейчас | макет»).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allocateRecheck } from './workspace-lib.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const pos = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')));
const opt = k => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : null; };
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const TAG = '<script type="application/json" id="decisions">';

// ---------- решения дизайнера
function loadDecisions(origRun, extra) {
  const fromHtml = f => { const h = fs.readFileSync(f, 'utf8'), i = h.indexOf(TAG); if (i < 0) return null; const j = h.indexOf('</script>', i); try { return JSON.parse(h.slice(i + TAG.length, j).replace(/\\u003c/g, '<')); } catch { return null; } };
  const fromFeedback = f => { const j = readJson(f); return Object.fromEntries((j.findings || []).filter(x => x.verdict).map(x => [x.id, { v: x.verdict, note: x.note, reason: x.reason }])); };
  const tries = [];
  if (extra) tries.push(['--decisions', () => /\.json$/i.test(extra) ? (readJson(extra).decisions || fromFeedback(extra)) : fromHtml(extra)]);
  tries.push(['decisions.json', () => readJson(path.join(origRun, 'decisions.json')).decisions]);
  tries.push(['report.html', () => fromHtml(path.join(origRun, 'report.html'))]);
  for (const f of fs.existsSync(origRun) ? fs.readdirSync(origRun).filter(f => /^feedback-.*\.json$/.test(f)).sort().reverse() : []) tries.push([f, () => fromFeedback(path.join(origRun, f))]);
  for (const [src, fn] of tries) { try { const d = fn(); if (d && Object.keys(d).filter(k => !k.startsWith('__')).length) return { src, d }; } catch { } }
  return { src: null, d: {} };
}

// ---------- значения
const CSS_PROP = /^-?[a-z][a-z-]*$/;
const hex = c => { const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(c); if (!m) return null; const h = [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join(''); return '#' + h.toUpperCase() + (m[4] != null && +m[4] < 1 ? Math.round(+m[4] * 255).toString(16).padStart(2, '0').toUpperCase() : ''); };
const norm = v => {
  if (v == null) return null; let s = String(v).trim().replace(/\[\[(?:ok|bad|b):([^\]]*)\]\]/g, '$1');
  const c = hex(s.toLowerCase()); if (c && /^rgba?\([^)]*\)$/i.test(s)) return c; if (/^#[0-9a-f]{3,8}$/i.test(s)) return s.toUpperCase();
  // цвета внутри градиентов и теней: rgb(…) → #HEX, регистр и пробелы не важны
  s = s.replace(/rgba?\([^)]*\)/gi, m => hex(m.toLowerCase()) || m).replace(/#[0-9a-f]{3,8}\b/gi, m => m.toUpperCase()).replace(/\s+/g, ' ').replace(/\s*([(),])\s*/g, '$1');
  if (/^["«].*["»]$/.test(s)) return s.slice(1, -1).toLowerCase(); // текст: "Анализ соответствия"
  s = s.toLowerCase().replace(/#[0-9a-f]{3,8}\b/g, m => m.toUpperCase());
  if (/^-?[\d.]+(px)?$/.test(s)) return parseFloat(s);
  const px = s.match(/-?[\d.]+px/g); if (px && px.length > 1 && /^[\d.\spx-]+$/.test(s)) return px.map(parseFloat).join(' '); // padding 8px 16px
  return s;
};
const same = (x, y) => x != null && y != null && (typeof x === 'number' && typeof y === 'number' ? Math.abs(x - y) <= 0.5 : String(x) === String(y));
// сокращённые свойства (padding: 4px 8px) — из сторон, которые снимает capture; текст — свойство content/text
const SIDES = ['top', 'right', 'bottom', 'left'];
const LONG = p => p === 'padding' || p === 'margin' ? SIDES.map(s => `${p}-${s}`) : p === 'border-width' ? SIDES.map(s => `border-${s}-width`) : p === 'content' || p === 'text' ? [] : [p];
const valueOf = (el, prop) => {
  if (!el) return undefined;
  if (prop === 'content' || prop === 'text') return clean(el.text || el.fullText);
  if (['padding', 'margin', 'border-width'].includes(prop)) {
    const v = LONG(prop).map(k => el.style?.[k]); if (v.some(x => x == null)) return undefined;
    const [t, r, b, l] = v; return t === b && r === l ? (t === r ? t : `${t} ${r}`) : r === l ? `${t} ${r} ${b}` : v.join(' ');
  }
  return el.style?.[prop];
};
const B = e => [e.box.x, e.box.y, e.box.width, e.box.height];
const iou = (p, q) => { const x1 = Math.max(p[0], q[0]), y1 = Math.max(p[1], q[1]), x2 = Math.min(p[0] + p[2], q[0] + q[2]), y2 = Math.min(p[1] + p[3], q[1] + q[3]); const i = Math.max(0, x2 - x1) * Math.max(0, y2 - y1); return i / (p[2] * p[3] + q[2] * q[3] - i || 1); };
const clean = t => String(t || '').replace(/\s+/g, ' ').trim();

if (cmd === 'plan') plan(); else if (cmd === 'check') check();
else { console.error('usage: recheck.mjs plan <исходный прогон> <новый прогон> [--decisions файл] | check <новый прогон>'); process.exit(1); }

function plan() {
  const origRun = pos[0] && path.resolve(pos[0]);
  if (!origRun) { console.error('usage: recheck.mjs plan <исходный прогон> [новый прогон]'); process.exit(1); }
  const O = readJson(path.join(origRun, 'findings.json'));
  const { src, d } = loadDecisions(origRun, opt('decisions'));
  if (!src) { console.error('⚠ Решений дизайнера не нашёл (decisions.json, report.html, feedback-*.json). Откройте исходный отчёт через «Открыть отчёт.cmd» или передайте --decisions <файл>.'); process.exit(1); }
  const allocation = allocateRecheck(origRun, pos[1]), newRun = allocation.run;
  const pages = O.meta.pages || [{ id: '', title: O.meta.title, testUrl: O.meta.testUrl, figmaUrl: O.meta.figmaUrl, dir: origRun }];
  const pageDir = id => { const p = pages.find(x => x.id === (id || '')) || pages[0]; return p.dir || path.join(origRun, p.id); };
  const shotOf = id => O.meta.widths.find(w => String(w.id) === String(id));
  const pick = O.findings.filter(f => f.kind === 'bug' && (['bug', 'ok'].includes(d[f.id]?.v) || (f.foundBy === 'designer' && d[f.id]?.v !== 'notbug')) || f.kind === 'improvement' && (d[f.id]?.v === 'take' || f.acceptedAction && !['skip','discuss'].includes(d[f.id]?.v)));
  const loadPage = rel => { const f = path.join(origRun, rel.replace(/\.png$/, '.json')); return fs.existsSync(f) ? readJson(f).elements : null; };
  const items = pick.map(f => {
    const css = (f.css || []).filter(c => CSS_PROP.test(c.prop || '') && (c.a != null || c.b != null)).map(c => ({ prop: c.prop, expected: c.a, was: c.b }));
    const evs = (f.evidence || []).filter(e => e.b).map(e => {
      const s = shotOf(e.shot), els = s?.bImg ? loadPage(s.bImg) : null;
      const sel = e.dev?.b?.sel || f.selector || null;
      // какой по счёту среди элементов с тем же селектором (сверху вниз) — в новой съёмке берём тот же
      let nth = null, text = e.textHint || null;
      if (els && sel) { const same = els.filter(x => x.sel === sel).sort((p, q) => p.box.y - q.box.y || p.box.x - q.box.x); const best = same.map((x, i) => ({ i, s: iou(B(x), e.b) })).sort((p, q) => q.s - p.s)[0]; if (best?.s > 0.3) nth = best.i; }
      if (els && !text) { const own = els.filter(x => clean(x.text) && iou(B(x), e.b) > 0.5).sort((p, q) => clean(p.text).length - clean(q.text).length)[0]; if (own) text = clean(own.text).slice(0, 60); }
      return { shot: e.shot, w: s?.w ?? e.w, page: s?.page ?? f.page ?? '', file: s?.bImg ? path.basename(s.bImg, '.png') : null, sel, nth, text, a: e.a, b: e.b, figmaNode: e.figmaNode, aImg: s?.aImg, bImg: s?.bImg };
    });
    const how = (css.length || (f.check || []).length) && evs.some(e => e.sel) ? 'measure' : 'eyes';
    return { id: f.id, kind: f.kind, foundBy: f.foundBy, basis: f.basis, referenceStatus: f.referenceStatus, acceptedAction: f.kind === 'improvement', verdict: d[f.id]?.v || (f.kind === 'improvement' ? 'take' : f.foundBy === 'designer' ? 'bug' : null), note: d[f.id]?.note || f.approvedInstruction || undefined, page: f.page || '', area: f.area, element: f.element, title: f.title, severity: f.severity, category: f.category, widths: f.widths, state: f.state, css, check: f.check || undefined, how, evidence: evs, values: f.values, why: f.why, fix: f.fix };
  });
  // страницы и съёмка
  const used = [...new Set(items.map(i => i.page))];
  const P = pages.filter(p => used.includes(p.id || '')).map(p => {
    // все ширины, на которых страница снималась в ревью, а не только ширины находок: правка адаптива ломает соседние
    // ширины (nowrap для 1200 сжал сортировку на 1024)
    const dir = pageDir(p.id), widths = [...new Set([...O.meta.widths.filter(w => (w.page || '') === (p.id || '')).map(w => w.w), ...items.filter(i => i.page === (p.id || '')).flatMap(i => i.evidence.map(e => e.w))].filter(Boolean))].sort((a, b) => b - a);
    const nd = path.join(newRun, p.id || '');
    fs.mkdirSync(path.join(nd, 'page'), { recursive: true });
    // макет страницы — в новый прогон (match-figma ищет расхождения, в том числе новые)
    if (fs.existsSync(path.join(dir, 'figma'))) fs.cpSync(path.join(dir, 'figma'), path.join(nd, 'figma'), { recursive: true });
    const scen = ['states.json', 'scenario.json'].map(f => path.join(dir, f)).find(fs.existsSync) || ['states.json'].map(f => path.join(origRun, f)).find(fs.existsSync);
    // что замерить: селекторы находок и их свойства — capture снимет и «невидимые» контейнеры (панель, обёртку модалки)
    const ms = new Map();
    for (const it of items.filter(i => i.page === (p.id || ''))) {
      const props = it.css.flatMap(c => LONG(c.prop));
      for (const e of it.evidence) if (e.sel) ms.set(e.sel, [...new Set([...(ms.get(e.sel) || []), ...props])]);
      for (const c of it.check || []) for (const s of [c.from, c.to, c.sel].filter(Boolean)) ms.set(s, [...new Set([...(ms.get(s) || []), ...(c.prop ? LONG(c.prop) : [])])]);
    }
    const mfile = path.join(nd, 'measure.json');
    fs.writeFileSync(mfile, JSON.stringify([...ms].map(([sel, props]) => ({ sel, props })), null, 1));
    return { id: p.id || '', title: p.title, testUrl: p.testUrl, figmaUrl: p.figmaUrl, origDir: dir, dir: nd, widths, scenario: scen || null,
      capture: `node "${path.join(path.dirname(fileURLToPath(import.meta.url)), 'capture.mjs')}" --url "${p.testUrl}" --out "${path.join(nd, 'page')}" --widths ${widths.join(',')}${scen ? ` --scenario "${scen}"` : ''} --measure "${mfile}"` };
  });
  const configFile=path.join(origRun,'review-config.json');
  const audience=fs.existsSync(configFile)?readJson(configFile).audience:O.meta.audience;
  const out = { origin: origRun, audience:audience||'designer', workspaceRoot: allocation.root, decisionsFrom: src, createdAt: new Date().toISOString().slice(0, 10), title: O.meta.title, labels: O.meta.labels, figmaUrl: O.meta.figmaUrl, testUrl: O.meta.testUrl, pages: P, items };
  fs.mkdirSync(newRun, { recursive: true });
  fs.writeFileSync(path.join(newRun, 'recheck-plan.json'), JSON.stringify(out, null, 1));
  const cnt = v => items.filter(i => i.verdict === v).length;
  console.log(`План перепроверки: ${items.length} находок (Баг ${cnt('bug')}, Допустимо ${cnt('ok')}) · решения — из ${src}`);
  console.log(`  мерить автоматически: ${items.filter(i => i.how === 'measure').length} · смотреть глазами: ${items.filter(i => i.how === 'eyes').length} (${items.filter(i => i.how === 'eyes').map(i => i.id).join(', ')})`);
  console.log(`\nСнять страницы (с теми же параметрами, что в исходном ревью: --cdp, --cookie, профиль…):`);
  for (const p of P) console.log(`  ${p.title}: ${p.capture}`);
  console.log(`\nЗатем: node scripts/recheck.mjs check "${newRun}"`);
}

function check() {
  const newRun = path.resolve(pos[0] || '.');
  const PL = readJson(path.join(newRun, 'recheck-plan.json'));
  const cache = {};
  const load = f => cache[f] ??= (fs.existsSync(f) ? readJson(f) : null);
  // снимок новой съёмки для кадра: то же имя, иначе основной снимок ширины (фрагменты макета снимались с него же)
  const newPage = (pg, ev) => {
    const dir = path.join(pg.dir, 'page');
    const names = ev.file ? [ev.file] : [`page-${ev.w}`];
    for (const n of names) { const f = path.join(dir, n + '.json'); if (fs.existsSync(f)) return { f, png: f.replace(/\.json$/, '.png'), j: load(f) }; }
    return null;
  };
  // элемент в новой съёмке: сначала замер (--measure, все элементы по селектору), потом обычные элементы съёмки;
  // из нескольких — с тем же текстом, затем ближайший к прежнему месту (вёрстка могла сдвинуться, но порядок тот же)
  const near = (list, ev) => { if (!ev.b) return list[0]; const cx = ev.b[0] + ev.b[2] / 2, cy = ev.b[1] + ev.b[3] / 2; return [...list].sort((p, q) => Math.hypot(p.box.x + p.box.width / 2 - cx, (p.box.y + p.box.height / 2 - cy) / 3) - Math.hypot(q.box.x + q.box.width / 2 - cx, (q.box.y + q.box.height / 2 - cy) / 3))[0]; };
  const findEl = (j, ev) => {
    const els = j?.elements; if (!els) return { el: null, how: 'no-shot' };
    if (ev.sel) for (const pool of [j.measured || [], els]) {
      const same = pool.filter(x => x.sel === ev.sel && x.visible !== false); if (!same.length) continue;
      const byText = ev.text ? same.filter(x => clean(x.text || x.fullText).includes(ev.text)) : [];
      const el = byText.length === 1 ? byText[0] : near(byText.length ? byText : same, ev);
      if (el) return { el, how: 'selector' };
    }
    // селектор поменялся (переделали вёрстку) — по тексту элемента
    if (ev.text) { const t = els.filter(x => clean(x.text) === ev.text || clean(x.fullText) === ev.text).sort((p, q) => p.box.width * p.box.height - q.box.width * q.box.height); if (t[0]) return { el: t[0], how: 'text', newSel: t[0].sel }; }
    return { el: null, how: 'not-found' };
  };
  const res = [];
  for (const it of PL.items) {
    const pg = PL.pages.find(p => p.id === it.page);
    const per = [];
    for (const ev of it.evidence) {
      const np = pg && newPage(pg, ev);
      const { el, how, newSel } = findEl(np?.j, ev);
      const props = it.css.map(c => {
        const now = valueOf(el, c.prop);
        const n = norm(now), exp = norm(c.expected), was = norm(c.was);
        const st = now === undefined ? 'unknown' : same(n, exp) ? 'fixed' : same(n, was) ? 'not-fixed' : 'changed';
        return { prop: c.prop, was: c.was, expected: c.expected, now, st };
      });
      // check агента: расстояние между двумя элементами ({from, to, axis:'y', expected, was})
      for (const c of it.check || []) {
        if (!(c.from && c.to)) continue;
        const els = [...(np?.j?.measured || []), ...(np?.j?.elements || [])], f1 = els.find(x => x.sel === c.from), f2 = els.find(x => x.sel === c.to);
        const now = f1 && f2 ? Math.round(c.axis === 'x' ? f2.box.x - (f1.box.x + f1.box.width) : f2.box.y - (f1.box.y + f1.box.height)) : undefined;
        props.push({ prop: `расстояние ${c.from} → ${c.to}`, was: c.was, expected: c.expected, now: now == null ? undefined : `${now}px`, st: now == null ? 'unknown' : same(now, norm(c.expected)) ? 'fixed' : same(now, norm(c.was)) ? 'not-fixed' : 'changed' });
      }
      per.push({ shot: ev.shot, w: ev.w, found: how, newSel, el: el ? { sel: el.sel, box: B(el) } : null, png: np?.png || null, props });
    }
    const sts = per.flatMap(p => p.props.map(x => x.st));
    const wFixed = per.filter(p => p.props.length && p.props.every(x => x.st === 'fixed')).map(p => p.w), wBad = per.filter(p => p.props.some(x => x.st === 'not-fixed')).map(p => p.w);
    let status;
    if (it.how === 'eyes' || !sts.length) status = 'eyes';
    else if (sts.every(s => s === 'fixed')) status = 'fixed';
    else if (sts.every(s => s === 'not-fixed')) status = it.verdict === 'ok' ? 'kept' : 'not-fixed';
    else if (sts.some(s => s === 'fixed') && sts.some(s => s === 'not-fixed')) status = 'partial';
    else if (sts.some(s => s === 'not-fixed')) status = it.verdict === 'ok' ? 'kept' : 'not-fixed';
    else status = 'look'; // изменилось, но не в значение макета, или элемента нет — посмотреть глазами
    res.push({ id: it.id, title: it.title, verdict: it.verdict, status, wFixed: [...new Set(wFixed)], wBad: [...new Set(wBad)], per });
  }
  fs.writeFileSync(path.join(newRun, 'recheck.json'), JSON.stringify({ origin: PL.origin, checkedAt: new Date().toISOString(), items: res }, null, 1));

  // ---------- findings.json для отчёта перепроверки
  const ST = { 'not-fixed': 'Не исправлено', partial: 'Исправлено не до конца', look: 'Проверить глазами: изменилось не так, как ожидалось', eyes: 'Проверить глазами', fixed: 'Исправлено', kept: 'Без изменений — по решению «Допустимо»' };
  const ORDER = ['partial', 'not-fixed', 'look', 'eyes', 'fixed', 'kept'];
  const rel = p => p ? path.relative(newRun, p).split(path.sep).join('/') : null;
  const widths = new Map();
  const findings = [];
  for (const r of [...res].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status))) {
    const it = PL.items.find(i => i.id === r.id), pg = PL.pages.find(p => p.id === it.page);
    const evidence = it.evidence.map((ev, k) => {
      const p = r.per[k];
      const shotId = String(ev.shot);
      if (!widths.has(shotId)) widths.set(shotId, { id: shotId, w: ev.w, state: it.state || 'default', page: it.page || undefined,
        aImg: ev.aImg ? (fs.existsSync(path.join(pg.dir, 'figma', path.basename(ev.aImg))) ? rel(path.join(pg.dir, 'figma', path.basename(ev.aImg))) : rel(path.join(PL.origin, ev.aImg))) : null,
        bImg: p?.png && fs.existsSync(p.png) ? rel(p.png) : null, cImg: rel(path.join(PL.origin, ev.bImg)) });
      return { shot: shotId, w: ev.w, a: ev.a, b: p?.el?.box || ev.b, c: ev.b, figmaNode: ev.figmaNode, dev: p?.el ? { b: { sel: p.el.sel } } : undefined };
    }).filter(e => e && widths.get(e.shot)?.bImg);
    // значения по ширинам, если они разные (исправлено на 1200, на 768 — нет); иначе одна строка на свойство
    const withProps = r.per.filter(p => p.props.length), differs = withProps.some(p => p.props.some((x, k) => String(x.now) !== String(withProps[0].props[k]?.now)));
    const props = (differs ? withProps : withProps.slice(0, 1)).flatMap(p => p.props.map(x => ({ name: differs ? `${x.prop} · ${p.w} px` : x.prop, a: x.expected ?? '—', b: x.now == null ? 'не нашёл' : x.st === 'fixed' ? `[[ok:${x.now}]]` : `[[bad:${x.now}]]`, c: x.was ?? '—' })));
    const where = r.per.map(p => `${p.w}: ${p.props.map(x => `${x.prop} ${x.now ?? '—'}`).join(', ') || (p.found === 'not-found' ? 'элемент не найден' : '—')}${p.found === 'text' ? ` (селектор стал ${p.newSel})` : ''}`);
    findings.push({ id: `RC-${r.id}`, origin: r.id, recheck: r.status, kind: ['fixed', 'kept'].includes(r.status) ? 'fixed' : it.kind === 'improvement' ? 'improvement' : 'bug', foundBy:it.foundBy,basis:it.basis,referenceStatus:it.referenceStatus,acceptedAction:it.acceptedAction,approvedInstruction:it.note,severity: it.severity || 'minor', category: it.category || 'other',
      area: ST[r.status], element: it.area, page: it.page || undefined,
      title: `${it.area ? it.area + ': ' : ''}${it.title}`,
      why: `Исходная находка ${r.id} (решение: ${it.verdict === 'take' ? 'Берём' : it.verdict === 'ok' ? 'Допустимо' : 'Баг'}). ${r.status === 'partial' ? `Исправлено на ${r.wFixed.join(', ')} px, не исправлено на ${r.wBad.join(', ')} px. ` : ''}${it.how === 'eyes' ? (it.acceptedAction ? 'Сверьте текущее состояние с согласованным решением дизайнера: '+(it.note||it.fix||'') : 'Мерить нечего (нет CSS-свойства) — сравните кадры «было | сейчас | макет».') : 'Замер: ' + where.join('; ')}`,
      fix: r.status === 'fixed' || r.status === 'kept' ? undefined : it.fix, widths: it.widths || [], state: it.state, props, evidence, values: it.values });
  }
  const O = { meta: { title: `Перепроверка · ${PL.title || ''}`.trim(), mode: 'recheck', origin: PL.origin, labels: { a: (PL.labels?.a) || 'Макет', b: 'Сейчас', c: 'Было' }, figmaUrl: PL.figmaUrl, testUrl: PL.testUrl, createdAt: new Date().toISOString().slice(0, 10), state: 'default',
    runId: path.basename(newRun), audience:PL.audience||'designer', pages: PL.pages.length > 1 || PL.pages[0]?.id ? PL.pages.map(p => ({ id: p.id, title: p.title, testUrl: p.testUrl, figmaUrl: p.figmaUrl, dir: p.dir })) : undefined,
    widths: [...widths.values()].filter(w => w.bImg) }, findings, matches: [] };
  // находки агента, добавленные вручную (новые поломки, ответы на «глазами») — сохраняем при пересчёте
  const prevF = path.join(newRun, 'findings.json');
  // agent: true — агент сам поставил статус (посмотрел глазами) или добавил новую поломку: такая находка важнее пересчёта
  if (fs.existsSync(prevF)) { try { const prev = readJson(prevF), keep = (prev.findings || []).filter(f => f.agent || !String(f.id).startsWith('RC-'));
    O.findings = [...keep.filter(f => f.recheck === 'new'), ...O.findings.map(f => keep.find(k => k.id === f.id) || f), ...keep.filter(f => f.recheck !== 'new' && !O.findings.some(g => g.id === f.id))];
    for (const w of prev.meta?.widths || []) if (!O.meta.widths.some(x => x.id === w.id)) O.meta.widths.push(w); } catch (e) { console.error('⚠ прежний findings.json не прочитан:', e.message); } }
  fs.writeFileSync(prevF, JSON.stringify(O, null, 1));
  const c = s => res.filter(r => r.status === s).length;
  console.log(`Перепроверено ${res.length}: исправлено ${c('fixed')} · частично ${c('partial')} · не исправлено ${c('not-fixed')} · глазами ${c('look') + c('eyes')} · «Допустимо» без изменений ${c('kept')}`);
  for (const r of res.filter(r => !['fixed', 'kept'].includes(r.status))) console.log(`  ${r.status.padEnd(9)} ${r.id} ${r.title.slice(0, 90)}`);
  const lost = res.filter(r => r.per.some(p => p.found === 'not-found' || p.found === 'no-shot'));
  if (lost.length) console.log(`⚠ элемент не найден или нет снимка: ${lost.map(r => r.id).join(', ')} — селектор поменялся? Посмотрите кадр и допишите статус вручную.`);
  console.log(`\nНовые поломки: прогоните match-figma на страницах нового прогона и сравните с исходными автонаходками — затем добавьте в findings.json с recheck:"new".\nОтчёт: node scripts/build-report.mjs "${newRun}"`);
}
