import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from './serve.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const css = await readFile(`${root}/ui/tokens.css`, 'utf8');
const names = [...new Set([...css.matchAll(/(--ps-[\w-]+)\s*:/g)].map(m => m[1]))].sort();
const server = createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const out = `${root}/evidence/verification/tokens`;
await mkdir(out, { recursive: true });
let browser;
const report = { tokenCount: names.length, checks: [], result: 'FAIL' };
try {
  try { browser = await chromium.launch({ headless: true }); }
  catch (error) {
    if (!error.message.includes("Executable doesn't exist")) throw error;
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(base);
  await page.locator('#token-catalog [data-token-name]').first().waitFor({ state: 'attached' });
  const catalogNames = await page.locator('#token-catalog [data-token-name]').evaluateAll(rows => rows.map(r => r.dataset.tokenName).sort());
  assert.deepEqual(catalogNames, names, 'catalog must contain every public token exactly once');
  const assertCatalog = async () => {
    await page.waitForFunction(() => [...document.querySelectorAll('#token-catalog [data-token-name]')].every(row =>
      row.querySelector('[data-token-value]').textContent.trim() === getComputedStyle(document.querySelector('#c-button')).getPropertyValue(row.dataset.tokenName).trim()));
  };
  await assertCatalog();
  await page.selectOption('#theme', 'demo');
  await assertCatalog();
  await page.selectOption('#theme', 'figma');
  await assertCatalog();
  const boxes = locator => locator.evaluateAll(bs => bs.map(b => {
    const s = getComputedStyle(b), r = b.getBoundingClientRect();
    return { width: r.width, height: r.height, padding: s.padding, font: s.fontSize, line: s.lineHeight };
  }));
  const matrix = page.locator('#c-button .ps-button');
  const previews = page.locator('#token-preview .ps-button');
  await page.evaluate(() => document.fonts.ready);
  const matrixBefore = await boxes(matrix);
  const previewBefore = await boxes(previews);
  assert(previewBefore.length >= 2, 'editor needs real component previews');
  const edit = async (name, value) => {
    const control = page.locator(`#token-editor [data-token="${name}"]`);
    await control.fill(value);
    await control.dispatchEvent('input');
  };
  await edit('--ps-main', '#112233');
  await edit('--ps-secondary', '#445566');
  await edit('--ps-on-button', '#000000');
  await edit('--ps-radius-big', '20');
  assert.deepEqual(await boxes(previews), previewBefore, 'color/radius edits changed geometry');
  assert.deepEqual(await boxes(matrix), matrixBefore, 'isolated editor altered original matrix');
  assert.equal(await page.locator('#token-preview').evaluate(el => getComputedStyle(el).getPropertyValue('--ps-main').trim()), '#112233');
  const main = page.locator('#token-preview .ps-button--big:not(.ps-button--secondary):not([aria-busy])').first();
  await page.mouse.move(0, 0);
  assert.equal(await main.evaluate(b => getComputedStyle(b).backgroundColor), 'rgb(17, 34, 51)');
  assert.equal(await main.evaluate(b => getComputedStyle(b).borderRadius), '20px');
  const busy = page.locator('#token-preview .ps-button[aria-busy="true"]').first();
  assert(await busy.count(), 'preview must show loading');
  const spinner = await busy.evaluate(b => { const s = getComputedStyle(b, '::after'); return { color: s.backgroundColor, mask: s.maskImage || s.webkitMaskImage }; });
  assert.equal(spinner.color, 'rgb(0, 0, 0)', 'spinner must follow on-button token');
  assert(spinner.mask.includes('spinner.svg'), 'spinner must use original SVG mask');
  const exported = await page.locator('#token-css').inputValue();
  assert(exported.includes('--ps-main: #112233'));
  assert(exported.includes('--ps-hover-big:'));
  const isolated = await browser.newPage();
  await isolated.route('**/token-export-proof.html', route => route.fulfill({ contentType: 'text/html', body:
    `<!doctype html><html><head><link rel="stylesheet" href="${base}/ui/partner-specials.css"><style>${exported}</style></head><body><section data-ps-theme="client"><button class="ps-button ps-button--big"><span class="ps-button__label">Button</span></button></section></body></html>` }));
  await isolated.goto(`${base}/token-export-proof.html`);
  await isolated.evaluate(() => document.fonts.ready);
  assert.equal(await isolated.locator('button').evaluate(b => getComputedStyle(b).backgroundColor), 'rgb(17, 34, 51)');
  assert.equal(await isolated.locator('button').evaluate(b => getComputedStyle(b).borderRadius), '20px');
  assert.equal((await isolated.locator('button').boundingBox()).height, 64);
  await isolated.close();
  await page.locator('#token-editor [data-token="--ps-font"]').selectOption('Georgia, serif');
  await page.evaluate(() => document.fonts.ready);
  const fontBoxes = await boxes(previews);
  for (let i = 0; i < fontBoxes.length; i++) {
    for (const key of ['height', 'padding', 'font', 'line']) assert.equal(fontBoxes[i][key], previewBefore[i][key], `font change altered ${key}`);
  }
  assert((await page.locator('#token-css').inputValue()).includes('--ps-font: Georgia, serif;'));
  await page.locator('#token-reset').click();
  assert.equal(await page.locator('#token-preview').evaluate(el => getComputedStyle(el).getPropertyValue('--ps-main').trim()), '#2563eb');
  await assertCatalog();
  for (const width of [320, 1400]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('#tokens').scrollIntoViewIfNeeded();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: horizontal overflow`);
    const path = `${out}/Tokens.${width}.png`;
    let exists = false;
    try { await access(path); exists = true; } catch {}
    if (!process.argv.includes('--no-screenshots') && (!exists || process.argv.includes('--force-screenshots'))) {
      await page.locator('#tokens').screenshot({ path, animations: 'disabled' });
    }
  }
  assert.deepEqual(errors, []);
  report.checks = ['public catalog matches CSS', 'catalog follows both themes', 'isolated live edits preserve geometry', 'export works with one CSS on separate page', 'spinner follows text color using original asset', 'font change preserves fixed geometry and exports', 'reset restores selected theme', '320/1400 no overflow', 'no JS or asset errors'];
  report.result = 'PASS';
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(`PASS: ${names.length} tokens; theme catalog, live edits, isolated CSS export, spinner color and responsive layout.`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
