// Съёмка фактов с живой страницы. Шаблон: копируется в <product>/tools/capture.mjs
// и дальше живёт в пакете. Ничего не интерпретирует — только снимает.
//
//   node tools/capture.mjs --url https://... --selector ".vacancy-card" \
//     --out evidence/source/production/course-card \
//     [--name CourseCard] [--widths 320,768,1024,1400] \
//     [--state hover] [--channel msedge] [--wait 1500] [--full-page] [--force]
//
// Компонент и блок — кроп узла с именем: CourseCard.1400.png, CourseCard.hover.320.png.
// Страница семейства — --full-page, имя страницы: CoursesListing.1400.png.
// Если в --out уже есть computed.json и PNG запрошенных ширин — выход 0 без браузера.
// Пересъёмка только с --force (аудит кладёт срез в новую папку).
//
// На выходе в --out:
//   dom.html         разметка узла, снятая с очищенными фреймворк-атрибутами
//   computed.json    computed styles по каждому узлу поддерева
//   tokens.json      кастомные свойства :root и подключённые шрифты
//   <Name>.<width>.png           кроп (или страница) на каждой ширине
//   <Name>.<state>.<width>.png   то же для --state, не default
//   meta.json        URL, имя, откуда имя, селектор, состояние, файлы

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : (argv[i + 1]?.startsWith('--') ? true : argv[i + 1]);
};
const flag = (name) => argv.includes(`--${name}`);

const url = arg('url');
const selector = arg('selector', 'body');
const out = arg('out');
const widths = String(arg('widths', '320,768,1024,1400')).split(',').map(Number);
const state = arg('state') || 'default';
const channel = arg('channel');
const wait = Number(arg('wait', 1200));
const pad = Number(arg('pad', 8));
const nameArg = arg('name');

if (!url || !out) {
  console.error('Нужны --url и --out. См. шапку файла.');
  process.exit(2);
}

const fileStem = (raw) => String(raw ?? '')
  .trim()
  .replace(/[/|]+/g, '-')
  .replace(/\s+/g, '-')
  .replace(/[^\p{L}\p{N}._-]+/gu, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '') || 'element';

const shotFile = (stem, width, shotState) => {
  const st = shotState && shotState !== 'default' ? `.${fileStem(shotState)}` : '';
  return `${stem}${st}.${width}.png`;
};

const hasShot = (files, width, stem, shotState) => {
  if (shotState && shotState !== 'default') {
    if (stem) return files.includes(shotFile(stem, width, shotState));
    return files.some((name) => name.endsWith(`.${fileStem(shotState)}.${width}.png`));
  }
  if (stem) return files.includes(shotFile(stem, width, 'default')) || files.includes(`${width}.png`);
  return files.includes(`${width}.png`)
    || files.some((name) => new RegExp(`^[^./\\\\]+\\.${width}\\.png$`).test(name));
};

const stemGuess = fileStem(nameArg || path.basename(out));
if (fs.existsSync(out) && !flag('force')) {
  const files = fs.readdirSync(out);
  const pngReady = widths.every((width) => hasShot(files, width, stemGuess, state));
  if (files.includes('computed.json') && pngReady) {
    console.log(`Уже снято: ${out} (${state}, ${widths.join('·')}). Пропуск. Пересъёмка — --force.`);
    process.exit(0);
  }
}

const PROPS = [
  'display', 'position', 'inset', 'box-sizing', 'width', 'height', 'min-height', 'max-width',
  'margin', 'padding', 'gap', 'row-gap', 'column-gap',
  'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'flex', 'order',
  'grid-template-columns', 'grid-template-rows', 'grid-auto-flow', 'grid-column', 'grid-row',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform',
  'text-align', 'text-decoration-line', 'white-space', 'overflow', 'overflow-wrap',
  'color', 'background-color', 'background-image', 'opacity',
  'border', 'border-radius', 'border-color', 'border-width', 'border-style',
  'box-shadow', 'outline', 'outline-offset', 'transition', 'transform', 'cursor', 'z-index',
];

const cleanAttrs = /^(data-v-[0-9a-f]+|data-testid|data-reactroot|nonce)$/;

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch(channel ? { channel } : {}).catch(async (error) => {
  if (channel) throw error;
  return chromium.launch({ channel: 'msedge' });
});
const context = await browser.newContext({ viewport: { width: widths.at(-1), height: 1000 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
await page.waitForTimeout(wait);
await page.waitForSelector(selector, { timeout: 15000 });

const target = page.locator(selector).first();
if (state === 'hover') await target.hover();
if (state === 'focus-visible') await target.focus();

const snapshot = await page.evaluate(({ selector, PROPS, cleanAttrsSource }) => {
  const cleanAttrs = new RegExp(cleanAttrsSource);
  const root = document.querySelector(selector);
  if (!root) return null;

  const utilities = /^(flex|grid|block|inline|hidden|relative|absolute|sticky|container|sr-only|truncate)|^(w|h|p|m|px|py|pt|pb|pl|pr|gap|text|bg|border|rounded|shadow|font|leading|tracking|opacity|z|top|left|right|bottom|inset|min|max|col|row|items|justify|content|self|place|overflow|object|cursor|pointer|select|whitespace|align)-/;

  const computed = [];
  const walk = (node, pathParts) => {
    if (node.nodeType !== 1) return;
    const style = getComputedStyle(node);
    const entry = { path: pathParts.join(' > '), tag: node.tagName.toLowerCase(), classes: node.className?.toString?.() ?? '', styles: {} };
    for (const prop of PROPS) {
      const value = style.getPropertyValue(prop);
      if (value && value !== 'normal' && value !== 'none' && value !== 'auto' && value !== '0px') entry.styles[prop] = value;
    }
    const box = node.getBoundingClientRect();
    entry.box = { w: Math.round(box.width * 100) / 100, h: Math.round(box.height * 100) / 100 };
    computed.push(entry);
    [...node.children].forEach((child, index) => walk(child, [...pathParts, `${child.tagName.toLowerCase()}[${index}]`]));
  };
  walk(root, [root.tagName.toLowerCase()]);

  const clone = root.cloneNode(true);
  const strip = (node) => {
    if (node.nodeType === 1) {
      for (const attr of [...node.attributes]) if (cleanAttrs.test(attr.name)) node.removeAttribute(attr.name);
      [...node.children].forEach(strip);
    }
  };
  strip(clone);

  const rootStyle = getComputedStyle(document.documentElement);
  const custom = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules ?? []) {
      if (rule.style && /^:root\b|^html\b/.test(rule.selectorText ?? '')) {
        for (const name of rule.style) if (name.startsWith('--')) custom[name] = rootStyle.getPropertyValue(name).trim();
      }
    }
  }

  const storyNode = root.closest('[data-story-id]') || document.querySelector('[data-story-id]');
  const storyId = storyNode?.getAttribute('data-story-id') || null;
  const storyTitle = document.title.replace(/\s*[-–—]\s*Storybook\s*$/i, '').trim();
  const dataComponent = root.getAttribute('data-component') || root.getAttribute('data-name');
  const bem = [...root.classList].find((cls) => !utilities.test(cls)) || null;
  const aria = root.getAttribute('aria-label');

  return {
    html: clone.outerHTML,
    computed,
    tokens: custom,
    fonts: [...new Set([...document.fonts].map((font) => `${font.family} ${font.weight} ${font.style}`))],
    title: document.title,
    inferred: { storyId, storyTitle, dataComponent, bem, aria, tag: root.tagName.toLowerCase() },
  };
}, { selector, PROPS, cleanAttrsSource: cleanAttrs.source });

if (!snapshot) {
  console.error(`Узел ${selector} не найден на ${url}`);
  await browser.close();
  process.exit(1);
}

const pickName = () => {
  if (nameArg) return { name: nameArg, source: 'flag' };
  const inf = snapshot.inferred;
  if (inf.dataComponent) return { name: inf.dataComponent, source: 'production' };
  if (inf.storyId) {
    const parts = inf.storyId.split('--').filter(Boolean);
    return { name: parts.slice(-2).join('-'), source: 'storybook' };
  }
  if (inf.storyTitle && !/^https?:/i.test(inf.storyTitle)) {
    return { name: inf.storyTitle, source: 'storybook' };
  }
  if (inf.bem) return { name: inf.bem, source: 'production' };
  if (inf.aria) return { name: inf.aria, source: 'production' };
  return { name: path.basename(out), source: 'id' };
};

const picked = pickName();
const stem = fileStem(picked.name);

const screenshotCrop = async (file) => {
  if (flag('full-page')) {
    await page.screenshot({ path: file, fullPage: true });
    return;
  }
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  const vp = page.viewportSize();
  if (box && vp && box.width + pad * 2 <= vp.width && box.height + pad * 2 <= vp.height) {
    const x = Math.max(0, box.x - pad);
    const y = Math.max(0, box.y - pad);
    await page.screenshot({
      path: file,
      clip: {
        x,
        y,
        width: Math.min(vp.width - x, box.width + pad * 2),
        height: Math.min(vp.height - y, box.height + pad * 2),
      },
    });
    return;
  }
  await target.screenshot({ path: file });
};

fs.writeFileSync(path.join(out, 'dom.html'), snapshot.html, 'utf8');
fs.writeFileSync(path.join(out, 'computed.json'), JSON.stringify(snapshot.computed, null, 2), 'utf8');
fs.writeFileSync(path.join(out, 'tokens.json'), JSON.stringify({ custom: snapshot.tokens, fonts: snapshot.fonts }, null, 2), 'utf8');

const files = [];
for (const width of widths) {
  await page.setViewportSize({ width, height: 1000 });
  await page.waitForTimeout(300);
  const file = shotFile(stem, width, state);
  await screenshotCrop(path.join(out, file)).catch(() => {});
  files.push(file);
}

fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({
  url,
  selector,
  name: picked.name,
  nameSource: picked.source,
  fileStem: stem,
  state,
  widths,
  crop: !flag('full-page'),
  pad: flag('full-page') ? 0 : pad,
  files,
  title: snapshot.title,
  capturedAt: new Date().toISOString(),
}, null, 2), 'utf8');

await browser.close();
console.log(`Снято: ${out} · ${stem} (${picked.source}) · ${files.join(', ')} · узлов ${snapshot.computed.length}`);
