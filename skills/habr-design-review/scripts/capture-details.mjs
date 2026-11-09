// Self-contained browser function: keep raw CSS-pixel geometry and inline styles.
export function captureDetails({ fullPage = true } = {}) {
  const result = {}, offX = fullPage ? scrollX : 0, offY = fullPage ? scrollY : 0;
  const rect = r => ({ x: r.x + offX, y: r.y + offY, width: r.width, height: r.height });
  const props = ['color', 'font-weight', 'font-size', 'font-family', 'line-height', 'letter-spacing', 'text-decoration-line', 'opacity'];
  const styleOf = (cs, owner) => {
    const style=Object.fromEntries(props.map(p => [p, cs.getPropertyValue(p)]));
    let opacity=1;for(let p=owner;p;p=p.parentElement)opacity*=parseFloat(getComputedStyle(p).opacity)||0;
    style.opacity=String(opacity);return style;
  };
  for (const el of document.querySelectorAll('[data-dr]')) {
    const cs = getComputedStyle(el), rawBox = rect(el.getBoundingClientRect()), textRuns = [], generated = [];
    const text = el.textContent || '';
    if (text.trim() && text.length <= 500 && !el.querySelector('div,p,li,ul,ol,table,h1,h2,h3,button,input,textarea')) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let node, offset = 0;
      while ((node = walker.nextNode())) {
        const value = node.textContent, start = offset; offset += value.length;
        const s = getComputedStyle(node.parentElement);
        if (!value || s.visibility === 'hidden' || s.display === 'none') continue;
        const range = document.createRange(); range.selectNodeContents(node);
        const b = range.getBoundingClientRect(); if (!b.width || !b.height) continue;
        textRuns.push({ start, end: offset, text: value, style: styleOf(s,node.parentElement), rawBox: rect(b) });
      }
    }
    for (const pseudo of ['::before', '::after']) {
      const s = getComputedStyle(el, pseudo), content = s.content;
      if (content && !['none','normal','""','\'\''].includes(content) && s.display !== 'none' && s.visibility !== 'hidden')
        generated.push({ pseudo, content, style: styleOf(s,el) });
    }
    result[el.getAttribute('data-dr')] = { rawBox, ...(textRuns.length ? { rawText: text, textRuns } : {}),
      ...(generated.length ? { generated } : {}), role: el.getAttribute('role') || undefined,
      geometry: { boxSizing: cs.boxSizing, transform: cs.transform, zoom: cs.zoom, outline: cs.outline, boxShadow: cs.boxShadow } };
  }
  return { elements: result, environment: { devicePixelRatio, visualViewportScale: visualViewport?.scale ?? null,
    innerWidth, innerHeight, rootZoom: getComputedStyle(document.documentElement).zoom } };
}
