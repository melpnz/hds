// READ-ONLY. Запасной путь, если нет токена Figma REST API (основной путь — figma-export.mjs).
// Выполняется через use_figma (Plugin API), ничего не меняет в макете.
// Выдаёт компактные строки (табуляция) — сохранить их в файл <run>/figma/rows-<w>.tsv и сконвертировать:
//   node figma-rows.mjs <run>/figma/rows-<w>.tsv <run>/figma/figma-<w>.json
// Лимит ответа use_figma 20 КБ: если ответ не влез — увеличить FROM_Y до значения из nextFromY и забрать следующую часть.
//
// Строки:
//   T  id  x,y,w,h  family  style  size  lineHeight  letterSpacingPx  #color  textCase  текст
//   B  id  x,y,w,h  имя  layout(H|V|G|-)  pt/pr/pb/pl  gap  radius  #fill  #stroke/weight  компонент
const FRAME_ID = "REPLACE";
const FROM_Y = 0;          // часть, начиная с этой высоты фрейма
const LIMIT = 18000;       // байт на ответ (лимит use_figma — 20 480 байт с учётом обёртки)
const REPEAT_NAME = "";    // имя повторяющегося компонента (карточка ленты): подробно — только первый экземпляр

const frame = await figma.getNodeByIdAsync(FRAME_ID);
const fb = frame.absoluteBoundingBox;
const hex = p => { if (!p || p.visible === false) return ''; if (p.type !== 'SOLID') return p.type[0]; const h = n => Math.round(n * 255).toString(16).padStart(2, '0'); const a = p.opacity ?? 1; return ('#' + h(p.color.r) + h(p.color.g) + h(p.color.b) + (a < 1 ? h(a) : '')).toUpperCase(); };
const first = arr => Array.isArray(arr) ? (arr.filter(p => p.visible !== false).map(hex)[0] || '') : 'M';
const clean = s => String(s).replace(/[\t\n\r]+/g, ' ').slice(0, 80);
// Лимит use_figma — в байтах JSON-ответа: кириллица 2 байта, \t и \n экранируются в 2 символа.
const bytes = s => { let n = 0; for (const ch of s) { const c = ch.codePointAt(0); n += ch === '\t' || ch === '\n' || ch === '"' || ch === '\\' ? 2 : c > 0xffff ? 4 : c > 0x7ff ? 3 : c > 127 ? 2 : 1; } return n; };
const rows = []; let size = 0, nextFromY = null, repeatSeen = 0;
function walk(n) {
  if (n.visible === false || nextFromY !== null) return;
  const b = n.absoluteBoundingBox; if (!b) return;
  const bb = [Math.round(b.x - fb.x), Math.round(b.y - fb.y), Math.round(b.width), Math.round(b.height)];
  if (bb[1] > fb.height) return; // ниже границы фрейма — обрезано, на скриншоте макета этого нет
  let descend = 'children' in n && !['VECTOR', 'BOOLEAN_OPERATION'].includes(n.type);
  if (REPEAT_NAME && n.type === 'INSTANCE' && n.name === REPEAT_NAME && repeatSeen++ > 0) descend = false;
  if (n.type === 'INSTANCE' && (/^(icon|avatar|logo)/i.test(n.name) || (b.width <= 32 && b.height <= 32))) descend = false;
  if (bb[1] + bb[3] >= FROM_Y) {
    let row = null;
    if (n.type === 'TEXT') {
      const fn = n.fontName === figma.mixed ? null : n.fontName, lh = n.lineHeight === figma.mixed ? null : n.lineHeight, ls = n.letterSpacing === figma.mixed ? null : n.letterSpacing;
      const fs = n.fontSize === figma.mixed ? '' : n.fontSize;
      const lhPx = !lh ? '' : lh.unit === 'PIXELS' ? lh.value : lh.unit === 'PERCENT' && fs ? Math.round(fs * lh.value) / 100 : 'AUTO';
      const lsPx = !ls || !ls.value ? 0 : ls.unit === 'PIXELS' ? ls.value : fs ? Math.round(fs * ls.value) / 100 : 0;
      row = ['T', n.id, bb.join(','), fn ? fn.family : 'MIXED', fn ? fn.style : 'MIXED', fs, lhPx, lsPx, first(n.fills), n.textCase === figma.mixed ? '' : (n.textCase || ''), clean(n.characters)].join('\t');
    } else if (('layoutMode' in n && n.layoutMode !== 'NONE') || first(n.fills) || ('strokes' in n && n.strokes.length) || n.type === 'INSTANCE') {
      let comp = ''; try { comp = n.type === 'INSTANCE' && n.mainComponent ? (n.mainComponent.parent?.type === 'COMPONENT_SET' ? n.mainComponent.parent.name : n.mainComponent.name) : ''; } catch {}
      const lay = 'layoutMode' in n && n.layoutMode !== 'NONE' ? n.layoutMode[0] : '-';
      const pad = 'paddingTop' in n ? [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].join('/') : '';
      const r = 'cornerRadius' in n ? (n.cornerRadius === figma.mixed ? [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].join('/') : n.cornerRadius) : '';
      const st = 'strokes' in n && n.strokes.length ? first(n.strokes) + '/' + (n.strokeWeight === figma.mixed ? 'M' : n.strokeWeight) : '';
      row = ['B', n.id, bb.join(','), clean(n.name), lay, pad, 'itemSpacing' in n ? n.itemSpacing : '', r, 'fills' in n ? first(n.fills) : '', st, clean(comp)].join('\t');
    }
    if (row) { const b = bytes(row) + 2; if (size + b > LIMIT) { nextFromY = bb[1]; return; } rows.push(row); size += b; }
  }
  if (descend) for (const c of n.children) walk(c);
}
walk(frame);
return { frame: { id: frame.id, name: frame.name, w: Math.round(frame.width), h: Math.round(frame.height) }, nextFromY, rows: rows.join('\n') };
