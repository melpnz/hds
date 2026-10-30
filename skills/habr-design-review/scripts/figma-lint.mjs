// Проверка самого макета: макет — эталон на 99 %, ошибки бывают и в нём.
// Ищет то, что выбивается из правил этого же макета (а не из чужих правил):
//  - цвет без токена — если остальной макет почти весь на токенах;
//  - текст без текстового стиля — если остальные тексты со стилями;
//  - отступ (padding/gap автолейаута) не по сетке 4 px — если сетка в макете соблюдается почти везде.
// Находки kind: 'mockup' — в отчёте отдельная вкладка «Макет», в задачи разработчикам и в метрики навыка не идут.
const num = v => { const m = /-?[\d.]+/.exec(String(v ?? '')); return m ? parseFloat(m[0]) : NaN; };
const bx = b => [b.x, b.y, b.width, b.height];

const hexRgb = h => { const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(h || '').trim()); return m ? [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)).concat(m[2] ? parseInt(m[2], 16) / 255 : 1) : null; };
const cdist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs(a[3] - b[3]) * 255;

// tokens: [{name, value: '#RRGGBB[AA]'}] — переменные макета (figma/variables.*), если известны
export function lintFigma(F, { sid, w, state, tokens = [] }) {
  const els = F.elements || [], out = [];
  const add = (key, title, why, fix, prop, value, list) => out.push({ key, title, why, fix, prop, value, sid, w, state,
    evidence: list.slice(0, 3).map(e => ({ shot: sid, w, a: bx(e.box), b: bx(e.box), figmaNode: { id: e.id, name: e.name || e.text, ...(e.link ? { link: e.link } : {}), ...(e.frame ? { frame: e.frame } : {}) } })), count: list.length,
    names: [...new Set(list.map(e => e.text || e.name).filter(Boolean))].slice(0, 6) });
  const group = (list, keyOf) => { const m = new Map(); for (const e of list) { const k = keyOf(e); if (!m.has(k)) m.set(k, []); m.get(k).push(e); } return m; };

  // 1. цвета без токена (векторы иконок и логотипов — не в счёт: их красят в компоненте иконки)
  const vectorish = e => Math.max(e.box.width, e.box.height) <= 24 || (/^(vector|union|subtract|intersect|exclude|ellipse|line|path|star|polygon|shape)\b/i.test(e.name || '') && Math.max(e.box.width, e.box.height) <= 64);
  const colored = [
    ...els.filter(e => e.kind === 'text' && /^#/.test(e.style?.color || '')).map(e => ({ e, prop: 'color', v: e.style.color })),
    ...els.filter(e => e.kind === 'box' && /^#/.test(e.style?.['background-color'] || '') && !vectorish(e)).map(e => ({ e, prop: 'background-color', v: e.style['background-color'] })),
  ];
  const bound = c => c.e.tokens?.[c.prop]?.var || c.e.tokens?.[c.prop]?.style;
  // Флажок — только если цвет совпадает (почти) со значением токена: «взяли hex вместо токена». Прочие цвета без токена —
  // иллюстрации, эмодзи, логотипы партнёров — законны.
  const toks = tokens.map(t => ({ ...t, rgb: hexRgb(t.value) })).filter(t => t.rgb);
  if (toks.length && colored.length >= 20 && colored.filter(bound).length / colored.length >= 0.7) {
    for (const [v, list] of group(colored.filter(c => !bound(c)), c => c.v)) {
      const rgb = hexRgb(v), near = rgb && toks.map(t => ({ t, d: cdist(rgb, t.rgb) })).sort((a, b) => a.d - b.d)[0];
      if (!near || near.d > 12) continue;
      const es = list.map(c => c.e);
      add(`color|${v}`, `В макете цвет ${v} не привязан к токену ${near.t.name}${es.length > 1 ? ` · ${es.length} слоёв` : ''}`,
        `Значение ${near.d ? 'почти ' : ''}совпадает с токеном ${near.t.name} (${near.t.value}), но слой красится вручную. Остальной макет на токенах (${Math.round(colored.filter(bound).length / colored.length * 100)} % цветов). Разработчик увидит голый hex и может взять не тот токен; при смене палитры слой не обновится.`,
        `Привязать цвет к переменной ${near.t.name}.`, 'цвет', v, es);
    }
  }
  // 2. тексты без текстового стиля
  const texts = els.filter(e => e.kind === 'text');
  const styled = t => t.tokens?.['text-style']?.style;
  if (texts.length >= 20 && texts.filter(styled).length / texts.length >= 0.7) {
    for (const [k, es] of group(texts.filter(t => !styled(t) && num(t.style['font-size']) >= 10), t => `${num(t.style['font-size'])}/${num(t.style['line-height']) || '—'} ${t.style['font-weight']}`)) {
      add(`text-style|${k}`, `В макете текст ${k} без текстового стиля${es.length > 1 ? ` · ${es.length} слоёв` : ''}`,
        `Остальные тексты макета на текстовых стилях (${Math.round(texts.filter(styled).length / texts.length * 100)} %), а эти — с ручными настройками шрифта. Такой текст легко «уплывает» от системы: разработчик не поймёт, какой стиль брать.`,
        'Применить текстовый стиль из библиотеки.', 'текстовый стиль', k, es);
    }
  }
  // 2б. текст нарисован не тем начертанием, что задают его стиль и переменная (переопределение по символам):
  // разработчик возьмёт стиль (600), а нарисовано 400 — дизайнеру решить, что верно
  for (const [k, es] of group(texts.filter(t => t.drawn), t => `${t.drawn.styleName || '—'}|${t.drawn.styleWeight}|${t.drawn.weight}`)) {
    const [sn, sw, dw] = k.split('|');
    add(`drawn|${k}`, `В макете текст нарисован начертанием ${dw}, а стиль${sn !== '—' ? ` «${sn}»` : ''} задаёт ${sw}${es.length > 1 ? ` · ${es.length} слоёв` : ''}`,
      `На символы наложено переопределение начертания: по стилю и привязанной переменной текст ${sw}, а нарисован ${dw}. Разработчик возьмёт стиль — и вёрстка «не совпадёт» с картинкой макета. Сравнение с сайтом шло по нарисованному (${dw}).`,
      `Решить, что задумано: если ${dw} — поправить стиль/привязку в макете; если ${sw} — снять переопределение (и тогда это расхождение на сайте).`, 'начертание', `${dw} при стиле ${sw}`, es);
  }
  // 3. отступы автолейаута не по сетке 4 px
  const sp = [];
  for (const e of els.filter(e => e.kind === 'box' && e.style?.layout && e.style.layout !== 'none'))
    for (const p of ['padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap']) { const v = num(e.style[p]); if (v > 0) sp.push({ e, p, v }); }
  if (sp.length >= 20 && sp.filter(s => s.v % 4 === 0).length / sp.length >= 0.85) {
    // 6, 10, 14 px — нормальная «половинная» сетка 2 px; ошибки правки — нечётные и дробные (3, 7, 17, 79)
    // у одного блока несколько нечётных отступов — одна находка; одинаковые блоки (тот же набор) — вместе
    const perEl = new Map(); for (const s of sp.filter(s => s.v % 2 !== 0 && s.v > 2)) { if (!perEl.has(s.e)) perEl.set(s.e, []); perEl.get(s.e).push(s); }
    for (const [sig, es] of group([...perEl.keys()], e => perEl.get(e).map(s => `${s.p} ${s.v}`).join(', '))) {
      const list = perEl.get(es[0]), share = Math.round(sp.filter(s => s.v % 4 === 0).length / sp.length * 100);
      add(`grid|${sig}`, `В макете отступ не по сетке: ${sig} px${es.length > 1 ? ` · ${es.length} блоков` : ''}`,
        `В остальном макете отступы кратны 4 px (${share} %), а здесь нечётные: ${sig} px. Обычно это случайность при правке (сдвинули на глаз) — разработчик либо повторит её, либо округлит по-своему.`,
        `Проверить и выставить ${list.map(s => `${s.p} ${Math.round(s.v / 4) * 4} px`).join(', ')} (или подтвердить, что так задумано).`, 'отступ', `${sig} px`, es);
    }
  }
  return out;
}
