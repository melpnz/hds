// Выгрузка фреймов макета через Figma REST API (только чтение) — основной путь, без MCP и без лимита 20 КБ.
// node figma-export.mjs --file <fileKey> --frames <id>[=state],<id>[=state],… --out <run>/figma [--scale 1]
//   или --url "<ссылка на фрейм/секцию>" — тогда выгружаются все фреймы верхнего уровня внутри (ширины и состояния
//   определяются сами: состояние = имя фрейма, если на одной ширине несколько фреймов).
// Токен: переменная окружения FIGMA_TOKEN (Figma → Settings → Security → Personal access tokens,
//   права: File content — Read only). Токен — секрет: не писать в файлы проекта и не показывать в отчётах.
// Результат: figma-<w>[-<state>].png и .json (общий формат, см. figma-lib.mjs) + frames.json со списком.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { textEl, boxEl, effectiveTextStyle, weightOf } from './figma-lib.mjs';

const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
// Токен: переменная FIGMA_TOKEN или файл ~/.design-review/figma-token (его пользователь создаёт сам в своём терминале —
// так токен не попадает ни в чат, ни в проект, и его видят процессы, запущенные раньше, чем задана переменная).
const tokenFile = path.join(os.homedir(), '.design-review', 'figma-token');
const token = process.env.FIGMA_TOKEN || (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '');
if (!token) { console.error(`Нет токена Figma. Создайте его: Figma → Settings → Security → Personal access tokens (File content: Read only) и сохраните в ${tokenFile} или в переменную FIGMA_TOKEN.`); process.exit(2); }
let fileKey = opt('file'), framesArg = opt('frames'), rootId = null;
const urlArg = opt('url');
if (urlArg) {
  const m = /figma\.com\/(?:design|file)\/([A-Za-z0-9]+)(?:\/branch\/([A-Za-z0-9]+))?[^?]*(?:\?.*node-id=([0-9]+[-:][0-9]+))?/.exec(urlArg);
  if (!m) { console.error('Не разобрана ссылка Figma'); process.exit(1); }
  fileKey = m[2] || m[1]; rootId = m[3] ? m[3].replace('-', ':') : null;
}
const out = opt('out');
if (!fileKey || !out || (!framesArg && !rootId)) { console.error('usage: figma-export.mjs (--url <ссылка> | --file <key> --frames id[=state],…) --out <dir> [--scale 1]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

// 429 (лимит запросов) и 5xx — подождать и повторить (Retry-After или 10/30/60 с), а не падать посередине выгрузки
const api = async p => {
  let r;
  for (const wait of [10, 30, 60, 0]) {
    r = await fetch('https://api.figma.com/v1/' + p, { headers: { 'X-Figma-Token': token } });
    if (r.ok || !(r.status === 429 || r.status >= 500) || !wait) break;
    const s = Math.min(120, Number(r.headers.get('retry-after')) || wait);
    console.error(`Figma API ${r.status} — жду ${s} с и повторяю…`); await new Promise(res => setTimeout(res, s * 1000));
  }
  if (!r.ok) throw new Error(`Figma API ${r.status}: ${(await r.text()).slice(0, 200)}${r.status === 403 ? ' — нет доступа к файлу или токен без прав File content' : ''}`);
  return r.json();
};

// Какие фреймы выгружать
let frames = [];
if (framesArg) frames = framesArg.split(',').map(s => { const [id, state] = s.split('='); return { id: id.trim().replace('-', ':'), state: state?.trim() }; });
else {
  const root = (await api(`files/${fileKey}/nodes?ids=${encodeURIComponent(rootId)}&depth=1`)).nodes[rootId]?.document;
  if (!root) throw new Error('Узел не найден: ' + rootId);
  const kids = (root.type === 'FRAME' || root.type === 'COMPONENT') ? [root] : (root.children || []).filter(c => c.type === 'FRAME' && c.visible !== false);
  frames = kids.map(c => ({ id: c.id, name: c.name, w: Math.round(c.absoluteBoundingBox.width) }));
}

const nodes = await api(`files/${fileKey}/nodes?ids=${frames.map(f => encodeURIComponent(f.id)).join(',')}`);
// op — накопленная прозрачность слоя и его родителей: фон чипа часто — слой «fill» с opacity 20 %, а не заливка с альфой
const hex = (p, op = 1) => { if (!p || p.visible === false) return ''; if (p.type !== 'SOLID') return p.type[0]; const h = n => Math.round(n * 255).toString(16).padStart(2, '0'); const a = (p.opacity ?? 1) * (p.color.a ?? 1) * op; return ('#' + h(p.color.r) + h(p.color.g) + h(p.color.b) + (a < 1 ? h(a) : '')).toUpperCase(); };
const first = (arr, op = 1) => (arr || []).filter(p => p.visible !== false).map(p => hex(p, op))[0] || '';
const slug = s => String(s || '').toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 30);

const byW = {};
for (const f of frames) { const doc = nodes.nodes[f.id]?.document; if (!doc) throw new Error('Фрейм не найден: ' + f.id); f.doc = doc; f.w = Math.round(doc.absoluteBoundingBox.width); f.name = doc.name; (byW[f.w] ||= []).push(f); }
for (const list of Object.values(byW)) list.forEach((f, i) => { if (!f.state) f.state = list.length > 1 && i > 0 ? slug(f.name) || 'state' + i : 'default'; });

const index = [], allVars = new Set(), outputs = [], compMeta = {};
// Ссылки на макет. Слой внутри экземпляра компонента (id «I…;…») по ссылке часто открывает файл, а не место —
// поэтому у каждого слоя link: сам слой, либо ближайший предок вне экземпляра (сам экземпляр); frame — запасная
// ссылка на фрейм. inst — ближайший экземпляр компонента: имя, id главного компонента и что переопределено
// (overrides: fills, cornerRadius… — дизайнер кастомизировал компонент; характеры текста не в счёт).
for (const f of frames) {
  const comps = nodes.nodes[f.id].components || {}, sets = nodes.nodes[f.id].componentSets || {};
  const compName = id => { const c = comps[id]; if (!c) return ''; return c.componentSetId && sets[c.componentSetId] ? sets[c.componentSetId].name : c.name; };
  const fb = f.doc.absoluteBoundingBox, els = [], styleMap = nodes.nodes[f.id].styles || {};
  // Токены макета: переменные (boundVariables) и стили (styles) — по свойствам в терминах CSS.
  const varOf = v => (Array.isArray(v) ? v[0] : v)?.id;
  const paintVar = arr => varOf((arr || []).find(p => p.visible !== false)?.boundVariables?.color);
  const tokensOf = (n, isText) => {
    const t = {}, bv = n.boundVariables || {}, set = (k, id) => { if (id) { t[k] = { var: id }; allVars.add(id); } };
    set(isText ? 'color' : 'background-color', paintVar(n.fills));
    set('border-top-color', paintVar(n.strokes));
    for (const [figKey, css] of [['paddingTop', 'padding-top'], ['paddingRight', 'padding-right'], ['paddingBottom', 'padding-bottom'], ['paddingLeft', 'padding-left'],
      ['itemSpacing', 'gap'], ['topLeftRadius', 'border-radius'], ['fontSize', 'font-size'], ['lineHeight', 'line-height'], ['letterSpacing', 'letter-spacing'], ['fontWeight', 'font-weight']]) set(css, varOf(bv[figKey]));
    const st = n.styles || {};
    if (st.text && styleMap[st.text]) t['text-style'] = { style: styleMap[st.text].name };
    if (st.fill && styleMap[st.fill]) (t[isText ? 'color' : 'background-color'] ||= {}).style = styleMap[st.fill].name;
    if (st.stroke && styleMap[st.stroke]) (t['border-top-color'] ||= {}).style = styleMap[st.stroke].name;
    return Object.keys(t).length ? t : undefined;
  };
  const walk = (n, trail, op0 = 1, ctx = { link: f.id, inst: null }) => {
    if (n.visible === false || !n.absoluteBoundingBox) return;
    const op = op0 * (n.opacity ?? 1);
    const link = String(n.id).startsWith('I') ? ctx.link : n.id;
    let inst = ctx.inst;
    if (n.type === 'INSTANCE' && n.componentId) {
      const c = comps[n.componentId] || {};
      compMeta[n.componentId] ||= { key: c.key, remote: !!c.remote, name: compName(n.componentId) };
      // кастомизация — только визуальные переопределения (размеры, текст, автоширина — это не изменение компонента)
      const VIS = /^(fills|strokes|strokeWeight|individualStrokeWeights|cornerRadius|rectangleCornerRadii|topLeftRadius|topRightRadius|bottomLeftRadius|bottomRightRadius|effects|opacity|fontSize|fontName|fontFamily|fontWeight|fontStyle|lineHeight|letterSpacing|textCase|textDecoration|paragraphSpacing|itemSpacing|paddingLeft|paddingRight|paddingTop|paddingBottom|visible|blendMode)$/;
      inst = { id: link, name: compName(n.componentId), compId: n.componentId, overrides: [...new Set((n.overrides || []).flatMap(o => o.overriddenFields || []).filter(x => VIS.test(x)))] };
    }
    const tag = el => { if (link !== n.id) el.link = link; el.frame = f.id; if (inst) el.inst = inst; return el; };
    const b = n.absoluteBoundingBox, box = { x: Math.round(b.x - fb.x), y: Math.round(b.y - fb.y), width: Math.round(b.width), height: Math.round(b.height) };
    const p = trail ? trail + ' / ' + n.name : n.name;
    if (n.type === 'TEXT') {
      const { s, styleName, weight, fills } = effectiveTextStyle(n);
      els.push(tag({ ...textEl({ id: n.id, name: n.name, path: p, box, family: s.fontFamily, style: styleName, size: s.fontSize, lh: s.lineHeightPx, ls: s.letterSpacing, color: first(fills, op), tcase: s.textCase, text: n.characters }), tokens: tokensOf(n, true) }));
      els[els.length - 1].style['font-weight'] = String(weight);
      // стиль/переменная слоя говорят одно, а символы нарисованы другим начертанием — противоречие в макете (figma-lint)
      const baseW = Number(n.style?.fontWeight) || weightOf(n.style?.fontPostScriptName || '');
      if (baseW && Math.abs(baseW - weight) >= 100) els[els.length - 1].drawn = { styleWeight: baseW, weight, styleName: n.styles?.text && styleMap[n.styles.text] ? styleMap[n.styles.text].name : '' };
    } else if (n !== f.doc || true) {
      const hasLook = n.layoutMode || first(n.fills, op) || (n.strokes || []).length || n.type === 'INSTANCE';
      if (hasLook) els.push(tag({ ...boxEl({ id: n.id, name: n.name, path: p, box, layout: n.layoutMode ? n.layoutMode[0] : '-',
        pad: [n.paddingTop || 0, n.paddingRight || 0, n.paddingBottom || 0, n.paddingLeft || 0].join('/'), gap: n.itemSpacing,
        radius: n.rectangleCornerRadii ? n.rectangleCornerRadii.join('/') : n.cornerRadius, fill: first(n.fills, op),
        stroke: (n.strokes || []).length ? first(n.strokes, op) + '/' + (n.strokeWeight ?? '') : '', comp: n.componentId ? compName(n.componentId) : '' }), tokens: tokensOf(n, false) }));
      // обводка по четырём сторонам: individualStrokeWeights (разная по сторонам) или strokeWeight (одинаковая)
      // — иначе выходит «рамка только сверху», хотя нарисована со всех сторон (ложная находка, sticky-button)
      const sc = first(n.strokes, op);
      if (hasLook && sc && /^#/.test(sc)) {
        const sw = n.individualStrokeWeights || { top: n.strokeWeight, right: n.strokeWeight, bottom: n.strokeWeight, left: n.strokeWeight };
        const st = els[els.length - 1].style;
        for (const side of ['top', 'right', 'bottom', 'left']) if (sw[side] != null) { st[`border-${side}-width`] = `${sw[side]}px`; st[`border-${side}-color`] = sc; }
        if (n.strokeAlign) st['stroke-align'] = n.strokeAlign.toLowerCase();
      }
    }
    for (const c of n.children || []) walk(c, p, op, { link, inst });
  };
  walk(f.doc, '');
  const base = `figma-${f.w}${f.state === 'default' ? '' : '-' + f.state}`;
  outputs.push({ file: path.join(out, base + '.json'), data: { source: 'figma', fileKey, frame: { id: f.id, name: f.name, w: f.w, h: Math.round(fb.height) }, elements: els } });
  index.push({ id: f.id, name: f.name, w: f.w, h: Math.round(fb.height), state: f.state, json: base + '.json', png: base + '.png' });
}

// Компоненты: ссылка на главный компонент — в этом файле или в библиотеке (GET /v1/components/:key → file_key, node_id).
// Нет доступа к библиотеке — ссылки на компонент не будет, останется ссылка на экземпляр.
for (const [id, m] of Object.entries(compMeta)) {
  if (!m.remote) { m.url = `https://www.figma.com/design/${fileKey}?node-id=${encodeURIComponent(id.replace(/:/g, '-'))}`; continue; }
  if (!m.key) continue;
  try { const r = await api(`components/${m.key}`); const mm = r.meta || {}; if (mm.file_key && mm.node_id) m.url = `https://www.figma.com/design/${mm.file_key}?node-id=${encodeURIComponent(mm.node_id.replace(/:/g, '-'))}`; }
  catch (e) { m.err = String(e.message).slice(0, 80); }
}
const libMiss = Object.values(compMeta).filter(m => m.remote && !m.url).length;
if (libMiss) console.log(`Компоненты библиотеки: ${libMiss} без ссылки (нет доступа к библиотеке у токена) — будет ссылка на экземпляр`);
for (const o of outputs) {
  for (const e of o.data.elements) if (e.inst) { const m = compMeta[e.inst.compId]; if (m?.url) e.inst = { ...e.inst, url: m.url, lib: m.remote }; }
  fs.writeFileSync(o.file, JSON.stringify(o.data, null, 1));
}

// Картинки фреймов
const scale = Number(opt('scale') || 1);
const imgs = await api(`images/${fileKey}?ids=${frames.map(f => encodeURIComponent(f.id)).join(',')}&format=png&scale=${scale}`);
for (const f of index) {
  const u = imgs.images?.[f.id]; if (!u) { console.warn('Нет картинки для', f.id); continue; }
  const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
  fs.writeFileSync(path.join(out, f.png), buf);
}
fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify({ fileKey, root: rootId, frames: index }, null, 1));
for (const f of index) console.log(`${f.png}  ${f.w}×${f.h}  «${f.name}»  состояние: ${f.state}`);

// Имена переменных: REST отдаёт их только на тарифе Enterprise (scope file_variables:read). Иначе — список id для
// figma-variables.js (Plugin API через MCP use_figma), результат сохранить в figma/variables.json.
if (allVars.size) {
  const ids = [...allVars];
  fs.writeFileSync(path.join(out, 'variables-needed.json'), JSON.stringify(ids, null, 1));
  const resp = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, { headers: { 'X-Figma-Token': token } });
  if (resp.ok) {
    const meta = (await resp.json()).meta || {}, cols = meta.variableCollections || {}, vars = {};
    for (const [id, v] of Object.entries(meta.variables || {})) if (allVars.has(id)) vars[id] = { name: v.name, collection: cols[v.variableCollectionId]?.name || '' };
    fs.writeFileSync(path.join(out, 'variables.json'), JSON.stringify(vars, null, 1));
    console.log(`Токены: ${Object.keys(vars).length} из ${ids.length} имён получено через REST → variables.json`);
  } else {
    console.log(`Токены: в макете ${ids.length} переменных. Имена через REST недоступны (${resp.status}, нужен Enterprise) — выполнить scripts/figma-variables.js через use_figma, ответ сохранить в figma/variables.json.`);
  }
}
