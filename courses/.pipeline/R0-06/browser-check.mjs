import { chromium } from '@playwright/test';
import fs from 'node:fs';

const OUT = '.pipeline/R0-06';
const URL_SHOWCASE = 'http://127.0.0.1:4179/showcase/components.html';

const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const [name, width, height] of [['375', 375, 812], ['768', 768, 1024], ['1440', 1440, 1000]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const requests = [];
  const console_ = [];
  page.on('response', r => requests.push([r.status(), r.url()]));
  page.on('requestfailed', r => requests.push(['FAILED', r.url()]));
  page.on('console', m => console_.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', e => console_.push(`pageerror: ${e.message}`));

  await page.goto(URL_SHOWCASE, { waitUntil: 'networkidle' });

  const facts = await page.evaluate(() => {
    const cs = el => el && getComputedStyle(el);
    const stage = document.querySelector('.doc-stage');
    const nav = document.querySelector('.doc-nav');
    const root = getComputedStyle(document.documentElement);
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent.trim(),
      sections: [...document.querySelectorAll('main > section')].map(s => s.id),
      categories: [...document.querySelectorAll('.doc-category')].map(s => s.id),
      specimens: document.querySelectorAll('.doc-specimen').length,
      slots: document.querySelectorAll('.doc-slot').length,
      empties: document.querySelectorAll('.doc-empty').length,
      anchorsC: [...document.querySelectorAll('[id^="c-"]')].map(e => e.id),
      docBg: root.getPropertyValue('--doc-bg').trim(),
      bodyFont: cs(document.body).fontFamily,
      navFont: cs(nav).fontFamily,
      stageFont: cs(stage).fontFamily,
      stageSize: cs(stage).fontSize,
      stageLine: cs(stage).lineHeight,
      stageBg: cs(stage).backgroundColor,
      stageColor: cs(stage).color,
      navSticky: cs(nav).position,
      docHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      fontsLoaded: document.fonts ? document.fonts.size : null,
    };
  });

  const bad = requests.filter(([s]) => s === 'FAILED' || (typeof s === 'number' && s >= 400));
  console.log(`\n===== ${name} px =====`);
  console.log('запросов:', requests.length, '| 4xx/5xx/failed:', bad.length, bad.length ? JSON.stringify(bad) : '');
  console.log('консоль:', console_.length ? console_ : 'пусто');
  console.log(JSON.stringify(facts, null, 1));

  await page.screenshot({ path: `${OUT}/showcase-${name}.png`, fullPage: true });
  await page.close();
}

// Проверка METHOD §6.2 с другой стороны: страница, на которой подключён
// ТОЛЬКО ui/courses.css, без витрины. Оболочка не должна существовать.
const bare = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await bare.goto('http://127.0.0.1:4179/showcase/components.html');
const leak = await bare.evaluate(async () => {
  const doc = document.implementation.createHTMLDocument('bare');
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../ui/courses.css', location.href).href;
  doc.head.append(link);
  return null;
});
await bare.setContent(`<!doctype html><html><head><link rel="stylesheet" href="/ui/courses.css"></head><body><div class="doc-stage doc-specimen doc-nav" id="probe">x</div></body></html>`, { waitUntil: 'networkidle' });
const bareFacts = await bare.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const el = document.getElementById('probe');
  const cs = getComputedStyle(el);
  return {
    docBgVariable: JSON.stringify(root.getPropertyValue('--doc-bg')),
    docInkVariable: JSON.stringify(root.getPropertyValue('--doc-ink')),
    probePadding: cs.padding,
    probeBorder: cs.border,
    probeBackground: cs.backgroundColor,
    probeFont: cs.fontFamily,
    bodyFont: getComputedStyle(document.body).fontFamily,
  };
});
console.log('\n===== только ui/courses.css, без витрины =====');
console.log(JSON.stringify(bareFacts, null, 1));

await browser.close();
