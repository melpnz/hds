import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failures = [];
const runtimeErrors = [];
const expectedWidths = ['320', '480', '768', '1024', 'full'];

page.on('pageerror', error => runtimeErrors.push(error.message));
page.on('response', response => {
  if (response.status() >= 400) runtimeErrors.push(`HTTP ${response.status()} ${response.url()}`);
});

try {
  await page.goto(`${baseUrl}/viewer/`, { waitUntil: 'networkidle' });
  const entries = await page.evaluate(() => fetch('../machine/catalog.json').then(response => response.json()));
  const shellRight = await page.locator('.shell').evaluate(element => element.getBoundingClientRect().right);
  const contentRight = await page.locator('.content').evaluate(element => element.getBoundingClientRect().right);
  if (Math.abs(shellRight - contentRight) > 1) failures.push('layout: content does not fill available width');

  for (const entry of entries) {
    const item = await page.evaluate(file => fetch(`../${file}`).then(response => response.json()), entry.file);
    await page.evaluate(id => { location.hash = id; }, entry.id);
    await page.waitForFunction(id => document.querySelector('#raw-json')?.textContent.includes(`"id": "${id}"`), entry.id);

    if (item.examples.length > 1 && item.examples.every(example => example.preview.mode === 'intrinsic')) {
      if (await page.locator('#example-tabs').isVisible()) failures.push(`${entry.id}: intrinsic examples use tabs`);
      if (await page.locator('.preview-toolbar').isVisible()) failures.push(`${entry.id}: intrinsic examples show viewport toolbar`);
      if (await page.locator('.stacked-example').count() !== item.examples.length) failures.push(`${entry.id}: not all intrinsic examples are stacked`);
      for (const example of item.examples) {
        const frame = page.locator(`[data-stacked-example="${example.id}"] iframe`);
        await frame.waitFor({ state: 'visible' });
        await page.waitForFunction(id => {
          const element = document.querySelector(`[data-stacked-example="${CSS.escape(id)}"] iframe`);
          return element?.contentDocument?.readyState === 'complete' && element.contentDocument.body;
        }, example.id);
        try {
          await page.waitForFunction(id => {
            const element = document.querySelector(`[data-stacked-example="${CSS.escape(id)}"] iframe`);
            const body = element?.contentDocument?.body;
            return body && Math.abs(element.clientHeight - body.scrollHeight) <= 3;
          }, example.id, { timeout: 5000 });
        } catch {
          failures.push(`${entry.id}/${example.id}: intrinsic iframe does not fit content height`);
        }
      }
    }

    if (item.examples.some(example => example.preview.mode === 'viewport')) {
      const controls = await page.locator('#viewport-controls button').evaluateAll(buttons => buttons.map(button => button.dataset.width));
      if (JSON.stringify(controls) !== JSON.stringify(expectedWidths)) failures.push(`${entry.id}: viewport controls differ`);
      for (const width of expectedWidths.slice(0, -1)) {
        await page.locator(`#viewport-controls [data-width="${width}"]`).click();
        await page.waitForTimeout(220);
        const actual = await page.locator('#preview').evaluate(element => Math.round(element.getBoundingClientRect().width));
        if (actual !== Number(width)) failures.push(`${entry.id}: ${width}px control produces ${actual}px iframe`);
        const rootOverflow = await page.locator('#preview').evaluate(element => {
          const root = element.contentDocument?.documentElement;
          return root ? root.scrollWidth > root.clientWidth + 1 : true;
        });
        if (rootOverflow) failures.push(`${entry.id}: page overflows horizontally at ${width}px`);
      }
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    const compoundControlFailures = await page.locator('iframe').evaluateAll(frames => frames.flatMap(frame => {
      const document = frame.contentDocument;
      if (!document) return [];
      return [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')]
        .filter(input => input.nextElementSibling?.matches('.indicator, .tm-radio__indicator'))
        .filter(input => {
          const rect = input.getBoundingClientRect();
          return rect.width > 2 || rect.height > 2;
        })
        .map(input => input.outerHTML);
    }));
    if (compoundControlFailures.length) {
      failures.push(`${entry.id}: native choice input is visible beside its decorative indicator`);
    }

    if (item.previewNotes?.length && !(await page.locator('#preview-notes').isVisible())) failures.push(`${entry.id}: preview notes are hidden`);
  }

  await page.locator('#guide-search').fill('loading');
  if (await page.locator('[data-item]').count() === 0) failures.push('search returned no results');
  const assetFailures = await page.evaluate(async () => {
    const inventory = await fetch('../machine/assets.json').then(response => response.json());
    const failures = [];
    let cursor = 0;
    async function worker() {
      while (cursor < inventory.assets.length) {
        const asset = inventory.assets[cursor++];
        if (!asset.previewable) continue;
        const ok = await new Promise(resolve => {
          const image = new Image();
          image.onload = () => resolve(image.naturalWidth > 0);
          image.onerror = () => resolve(false);
          image.src = `../${asset.path}`;
        });
        if (!ok) failures.push(asset.path);
      }
    }
    await Promise.all(Array.from({ length: 16 }, worker));
    return failures;
  });
  if (assetFailures.length) failures.push(...assetFailures.map(path => `asset did not decode: ${path}`));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('#guide-search').fill('');
  if (await page.locator('.nav-section').count() < 2) failures.push('mobile navigation lost sections');
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (mobileOverflow) failures.push('viewer has horizontal overflow at 375px');
  if (runtimeErrors.length) failures.push(...runtimeErrors.map(error => `runtime: ${error}`));
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`OK: ${entries.length} viewer pages; intrinsic, viewport, notes, search and full-width shell verified`);
  }
} finally {
  await browser.close();
}
