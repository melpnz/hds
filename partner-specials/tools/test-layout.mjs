import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from './serve.mjs';
const source = JSON.parse(await readFile(new URL('../evidence/source/figma/layout-details.json', import.meta.url), 'utf8'));
const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const out = new URL('../evidence/verification/layout/', import.meta.url);
await mkdir(out, { recursive: true });
const report = [];
try {
  try { browser = await chromium.launch({ headless: true }); }
  catch (error) { if (!error.message.includes("Executable doesn't exist")) throw error; browser = await chromium.launch({ channel: 'chrome', headless: true }); }
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  // Single entry only: no showcase CSS and no direct layout stylesheet imports.
  await page.route('**/layout-proof.html', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${base}/ui/partner-specials.css"></head><body style="margin:0"><div class="ps-layout"><div class="ps-layout__grid">${'<div>Колонка</div>'.repeat(12)}</div></div></body></html>` }));
  await page.goto(`${base}/layout-proof.html`);
  const measure = () => page.locator('.ps-layout').evaluate(el => { const s = getComputedStyle(el); const g = getComputedStyle(el.firstElementChild); return { margin: parseFloat(s.paddingLeft), columns: g.gridTemplateColumns.split(' ').length, gap: parseFloat(g.columnGap), width: el.getBoundingClientRect().width }; });
  for (const profile of ['native', 'drawn']) {
    await page.locator('.ps-layout').evaluate((el, p) => el.dataset.psLayoutSource = p, profile);
    for (const frame of source) {
      await page.setViewportSize({ width: frame.width, height: 800 });
      const grid = frame.grids[0];
      const expectedMargin = profile === 'drawn' && frame.width >= 1440 ? 100 : profile === 'drawn' && frame.width === 768 ? 36 : grid.offset;
      const result = await measure();
      assert.equal(result.margin, expectedMargin, `${profile} ${frame.width}: margin`);
      assert.equal(result.columns, grid.count, `${profile} ${frame.width}: columns`);
      assert.equal(result.gap, grid.gutterSize, `${profile} ${frame.width}: gap`);
      assert.equal(result.width, frame.width);
      report.push({ profile, width: frame.width, ...result });
    }
  }
  // Explicit profiles must remain stable even at an unrelated viewport width.
  await page.setViewportSize({ width: 1400, height: 800 });
  for (const frame of source) {
    await page.locator('.ps-layout').evaluate((el, w) => { el.dataset.psLayout = String(w); el.dataset.psLayoutSource = 'native'; }, frame.width);
    const result = await measure(); assert.equal(result.margin, frame.grids[0].offset); assert.equal(result.columns, frame.grids[0].count);
  }
  await page.locator('.ps-layout').evaluate(el => { delete el.dataset.psLayout; el.firstElementChild.innerHTML = '<div class="ps-layout__full">' + 'ДлинныйТекст'.repeat(100) + '</div>'; });
  for (const width of [320, 767, 768, 1023, 1024, 1279, 1280, 1400, 1439, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `proof overflow ${width}`);
    const before = await measure();
    await page.locator('body').evaluate(el => el.dataset.psTheme = 'demo');
    assert.deepEqual(await measure(), before, 'theme altered layout geometry');
    await page.locator('body').evaluate(el => el.dataset.psTheme = 'figma');
  }
  await page.goto(`${base}/showcase/layout.html`);
  await page.locator('#layout-profiles .ps-layout').last().waitFor();
  for (const profile of ['native', 'drawn']) {
    await page.selectOption('#layout-source', profile);
    const rows = await page.locator('#layout-profiles .ps-layout').evaluateAll(items => items.map(el => { const s = getComputedStyle(el); return { width: +el.dataset.psLayout, margin: parseFloat(s.paddingLeft), columns: +s.getPropertyValue('--ps-layout-columns') }; }));
    assert.equal(rows.length, 7);
    for (const row of rows) {
      const frame = source.find(f => f.width === row.width);
      assert.equal(row.margin, profile === 'drawn' && row.width >= 1440 ? 100 : profile === 'drawn' && row.width === 768 ? 36 : frame.grids[0].offset);
      assert.equal(row.columns, frame.grids[0].count);
    }
  }
  await page.selectOption('#layout-source', 'native');
  for (const width of [320, 768, 1024, 1400]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForFunction(() => [...document.querySelectorAll('#layout-tokens dt')].every(dt => dt.nextElementSibling.textContent === getComputedStyle(document.querySelector('#layout-live')).getPropertyValue(dt.textContent).trim()));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `showcase overflow ${width}`);
    const before = await page.locator('#layout-live').boundingBox();
    await page.selectOption('#layout-theme', 'demo');
    assert.deepEqual(await page.locator('#layout-live').boundingBox(), before);
    await page.selectOption('#layout-theme', 'figma');
    if ([320, 1400].includes(width) && !process.argv.includes('--no-screenshots')) {
      const path = new URL(`Layout.${width}.png`, out); let exists = false; try { await access(path); exists = true; } catch {}
      if (!exists) await page.screenshot({ path: path.pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(new URL('report.json', out), JSON.stringify({ result: 'PASS', sourceProfiles: report, checks: ['single entry CSS copy', '7 reference widths × 2 source profiles', 'explicit profile overrides viewport', 'threshold boundaries and long text', 'theme geometry invariant', 'live token values', '4 showcase widths no overflow', 'no JS or asset errors'] }, null, 2));
  console.log('PASS: Layout 7 widths × 2 profiles; single CSS, explicit profiles, boundaries, themes, token catalog and 4 responsive widths.');
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
