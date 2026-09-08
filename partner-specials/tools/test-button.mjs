import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile, unlink, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from './serve.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const server = createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const output = `${root}/evidence/verification/button`;
await mkdir(output, { recursive: true });
await mkdir(`${root}/.pipeline/button`, { recursive: true });
const spec = await readFile(`${root}/components/actions/button.md`, 'utf8');
const snippet = spec.match(/```html\r?\n([\s\S]*?)```/)[1];
const copyPath = `${root}/.pipeline/button/copy-check.html`;
await writeFile(copyPath, `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Copy check</title>${snippet}</html>`);
let browser;
const report = { widths: [], checks: [], source: 'Figma geometry, new HTML runtime; no production comparison' };
const screenshot = async (page, options) => {
  if (process.argv.includes('--no-screenshots')) return;
  if (!process.argv.includes('--force-screenshots')) { try { await access(options.path); return; } catch {} }
  await page.screenshot(options);
};
try {
  try { browser = await chromium.launch({ headless: true }); report.browser = 'Playwright Chromium'; }
  catch (error) {
    if (!error.message.includes("Executable doesn't exist")) throw error;
    console.log('Playwright Chromium is not installed; testing with installed Chrome.');
    browser = await chromium.launch({ headless: true, channel: 'chrome' }); report.browser = 'Installed Chrome fallback';
  }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  for (const width of [320, 768, 1024, 1400]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.fonts.check('700 20px "Partner Inter"', 'Button Начать')));
    const geometry = await page.locator('[data-example]').evaluateAll(buttons => buttons.map(b => {
      const s = getComputedStyle(b), r = b.getBoundingClientRect();
      return { size: b.dataset.size, state: b.dataset.example, type: b.dataset.variant, width: r.width, height: r.height, font: s.fontSize, line: s.lineHeight, padding: s.padding, radius: s.borderRadius, background: s.backgroundColor };
    }));
    assert.equal(geometry.length, 30);
    const expected = { big: [64, 130, '20px', '28px', '18px 32px'], medium: [48, 93, '16px', '20px', '14px 20px'], small: [36, 71, '14px', '20px', '8px 12px'] };
    for (const b of geometry) {
      const e = expected[b.size];
      assert.equal(b.height, e[0], `${width}: ${b.type}/${b.size}/${b.state} height`);
      // Figma font version is unknown. Local Inter differs by up to 1.75px in these labels.
      assert(Math.abs(b.width - e[1]) <= 2, `source text width tolerance: ${JSON.stringify(b)}`);
      assert.equal(b.font, e[2]); assert.equal(b.line, e[3]); assert.equal(b.padding, e[4]);
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: overflow`);
    await screenshot(page, { path: `${output}/Button.figma.${width}.png`, fullPage: true, animations: 'disabled' });
    await page.selectOption('#theme', 'demo');
    const themed = await page.locator('[data-example]').evaluateAll(bs => bs.map(b => { const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {width:r.width,height:r.height,padding:s.padding,font:s.fontSize,background:s.backgroundColor,radius:s.borderRadius}; }));
    for (let i=0;i<30;i++) { for (const key of ['width','height','padding','font']) assert.equal(themed[i][key],geometry[i][key], `theme altered ${key}`); }
    assert.notEqual(themed[0].background, geometry[0].background);
    await screenshot(page, { path: `${output}/Button.demo.${width}.png`, fullPage: true, animations: 'disabled' });
    if (width === 320) assert(await page.locator('#long-label .ps-button__label').evaluate(b=>b.scrollWidth>b.clientWidth), 'long label does not exercise overflow');
    report.widths.push({ width, geometry, themeGeometryUnchanged: true, noOverflow: true });
  }
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  const action = page.locator('#action');
  // Reach the live action using keyboard only.
  for (let i=0;i<40 && !(await action.evaluate(b=>b===document.activeElement));i++) await page.keyboard.press('Tab');
  assert(await action.evaluate(b=>b===document.activeElement && b.matches(':focus-visible')));
  assert.notEqual(await action.evaluate(b=>getComputedStyle(b).outlineStyle), 'none');
  const before = await action.boundingBox();
  await page.keyboard.press('Enter');
  assert.equal(await action.getAttribute('aria-busy'), 'true');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  const busy = await action.boundingBox();
  assert.equal(before.width,busy.width); assert.equal(before.height,busy.height);
  assert(await action.evaluate(b=>b===document.activeElement), 'busy loses focus');
  await page.waitForFunction(() => document.querySelector('#result').textContent === 'Готово. Запусков: 1.');
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('#result').textContent === 'Готово. Запусков: 2.');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'long-label','disabled not skipped');
  assert(await page.locator('#unavailable').isDisabled());
  await page.locator('#unavailable').evaluate(b=>{window.disabledClicks=0;b.addEventListener('click',()=>window.disabledClicks++);b.click();});
  assert.equal(await page.evaluate(()=>window.disabledClicks),0);
  const actualHover = page.locator('[data-example="default"][data-size="big"][data-variant="main"]');
  await actualHover.hover();
  assert.equal(await actualHover.evaluate(b=>getComputedStyle(b).backgroundColor),'rgb(25, 33, 44)');
  assert.equal(await page.locator('[data-example="disabled"]').first().locator('span').evaluate(b=>getComputedStyle(b).opacity),'0.5');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('[data-example="loading"]').first().evaluate(b=>getComputedStyle(b,'::after').animationName),'none');
  await page.goto(`${base}/.pipeline/button/copy-check.html`);
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('link[rel="stylesheet"]').count(),1);
  assert.equal((await page.locator('button').boundingBox()).height,64);
  assert.equal(await page.locator('button').evaluate(b=>getComputedStyle(b).backgroundColor),'rgb(37, 99, 235)');
  await screenshot(page, {path:`${output}/Button.copy-check.1400.png`});
  await page.locator('button').evaluate(b=>{ b.style.setProperty('--ps-font','Arial, sans-serif'); b.querySelector('span').textContent='Очень длинная подпись с другим шрифтом для проверки переполнения'; });
  await page.setViewportSize({width:320,height:1000});
  assert.equal((await page.locator('button').boundingBox()).height,64);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('button span').evaluate(b=>b.scrollWidth>b.clientWidth));
  assert.deepEqual(errors,[]);
  report.checks = ['30 source variants × 4 canonical widths', 'Theme geometry invariant × 4 widths', 'Local fonts loaded', 'Long text overflow', 'Keyboard focus-visible, Enter and Space', 'Busy preserves geometry/focus and prevents duplicate action', 'Disabled native activation and Tab skip', 'Actual hover and disabled opacity', 'Reduced motion', 'Copied specification with one CSS', 'Alternative font height and overflow', 'No browser or asset errors'];
  report.result='PASS';
  await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
  console.log('PASS: 30 variants × 4 widths; themes, keyboard, disabled/loading, reduced motion, copyability and overflow.');
} finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); await unlink(copyPath); }
