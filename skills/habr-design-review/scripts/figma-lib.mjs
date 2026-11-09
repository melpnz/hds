// Общий формат данных макета — как у page-*.json, чтобы сравнивать одним кодом:
// { source: 'figma', frame: {id, name, w, h}, elements: [{ id, kind: 'text'|'box', name, path, comp, text,
//   box: {x,y,width,height}, style: { 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
//   color, 'text-transform', 'background-color', 'border-top-width', 'border-top-color', 'border-radius',
//   'padding-top'…, gap, layout } }] }
// Значения стилей — как в CSS (px, #RRGGBB), чтобы сравнивать с getComputedStyle.

// Начертание из имени стиля шрифта Figma → font-weight.
export function weightOf(style = '') {
  const s = style.toLowerCase().replace(/[\s_-]/g, '');
  const table = [['thin', 100], ['hairline', 100], ['extralight', 200], ['ultralight', 200], ['light', 300], ['regular', 400], ['normal', 400], ['book', 400],
    ['medium', 500], ['semibold', 600], ['demibold', 600], ['extrabold', 800], ['ultrabold', 800], ['black', 900], ['heavy', 900], ['bold', 700]];
  for (const [k, v] of table) if (s.includes(k)) return v;
  return 400;
}
export const textTransform = c => ({ UPPER: 'uppercase', LOWER: 'lowercase', TITLE: 'capitalize' }[c] || 'none');
export const px = v => (v === '' || v === undefined || v === null || v === 'AUTO' || Number.isNaN(Number(v))) ? undefined : `${Math.round(Number(v) * 100) / 100}px`;

export function textEl({ id, name = '', path = '', box, family, style, size, lh, ls, color, tcase, text, comp = '' }) {
  return {
    id, kind: 'text', name, path, comp, text, box,
    style: {
      'font-family': family, 'font-size': px(size), 'font-weight': String(weightOf(style)), 'font-style-name': style,
      'line-height': px(lh) || 'normal', 'letter-spacing': px(ls) || '0px', color: color || undefined, 'text-transform': textTransform(tcase),
    },
  };
}
export function boxEl({ id, name = '', path = '', box, layout = '-', pad = '', gap, radius, fill, stroke, comp = '' }) {
  const [pt, pr, pb, pl] = String(pad || '').split('/').map(Number);
  const [sc, sw] = String(stroke || '').split('/');
  const r = String(radius ?? '').split('/').map(Number).filter(Number.isFinite);
  return {
    id, kind: 'box', name, path, comp, box,
    style: {
      layout: { H: 'row', V: 'column', G: 'grid' }[layout] || 'none',
      'padding-top': px(pt), 'padding-right': px(pr), 'padding-bottom': px(pb), 'padding-left': px(pl),
      gap: px(gap), 'border-radius': r.length ? (r.every(v => v === r[0]) ? px(r[0]) : r.map(px).join(' ')) : undefined,
      'background-color': /^#/.test(fill || '') ? fill : undefined, 'background-image': fill && !/^#/.test(fill) ? fill : undefined,
      'border-top-color': /^#/.test(sc || '') ? sc : undefined, 'border-top-width': sw && sw !== 'M' ? px(sw) : undefined,
    },
  };
}

// Чем текстовый слой REST API нарисован на самом деле. Переопределение по символам (characterStyleOverrides),
// покрывающее бо́льшую часть текста, важнее базового стиля (стиль «text micro (bold)», а символы — Regular).
// fontWeight в REST не всегда соответствует рисунку: при привязке к переменной там остаётся её значение (600 при
// fontStyle «Regular»), поэтому начертание переопределения — по fontStyle.
export function effectiveTextStyle(n) {
  const cnt = {};
  for (const k of n.characterStyleOverrides || []) if (k) cnt[k] = (cnt[k] || 0) + 1;
  const [dk, dn] = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0] || [];
  const o = dk && dn * 2 > (n.characters || '').length ? (n.styleOverrideTable || {})[dk] || {} : {};
  const s = { ...(n.style || {}), ...Object.fromEntries(Object.entries(o).filter(([k, v]) => v !== null && v !== undefined && k !== 'fills')) };
  const styleName = o.fontStyle || s.fontPostScriptName || s.fontStyle || '';
  const weight = o.fontStyle ? weightOf(o.fontStyle) : (s.fontWeight || weightOf(styleName));
  return { s, styleName, weight, fills: o.fills || n.fills };
}

// UTF-16 offsets, like Figma characterStyleOverrides and DOM Range.
export function styledTextRuns(n, colorOf, opacity = 1) {
  const text = n.characters || '', runs = [];
  for (let start = 0; start < text.length;) {
    const key = n.characterStyleOverrides?.[start] || 0;
    let end = start + 1;
    while (end < text.length && (n.characterStyleOverrides?.[end] || 0) === key) end++;
    const override = n.styleOverrideTable?.[key] || {}, s = { ...n.style, ...override };
    const fills = override.fills || n.fills;
    const el = textEl({ text: text.slice(start, end), family: s.fontFamily, style: s.fontStyle || s.fontPostScriptName,
      size: s.fontSize, lh: s.lineHeightPx, ls: s.letterSpacing, color: colorOf(fills, opacity), tcase: s.textCase });
    el.style['font-weight'] = String(override.fontStyle ? weightOf(override.fontStyle) : s.fontWeight || weightOf(s.fontPostScriptName));
    el.style['text-decoration'] = s.textDecoration || 'NONE';
    const variable = fills?.find(p => p.visible !== false)?.boundVariables?.color;
    runs.push({ start, end, text: text.slice(start, end), style: el.style,
      ...(variable?.id ? { tokens: { color: { var: variable.id } } } : {}) });
    start = end;
  }
  return runs;
}
