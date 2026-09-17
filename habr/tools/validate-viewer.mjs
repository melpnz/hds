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
  await page.waitForFunction(id => document.querySelector('#raw-json')?.textContent.includes(`"id": "${id}"`), entries[0].id);
  const themeControls = await page.locator('[data-theme-value]').evaluateAll(buttons => buttons.map(button => ({
    theme: button.dataset.themeValue,
    pressed: button.getAttribute('aria-pressed')
  })));
  if (JSON.stringify(themeControls) !== JSON.stringify([
    { theme: 'light', pressed: 'true' },
    { theme: 'dark', pressed: 'false' }
  ])) failures.push('theme controls do not start in light mode');
  await page.waitForFunction(() => {
    const frame = document.querySelector('iframe:not([hidden])');
    const themeLink = frame?.contentDocument
      ? [...frame.contentDocument.querySelectorAll('link[rel="stylesheet"]')].find(link => /\/themes\/(?:light|dark)-v2\.css/.test(link.href))
      : null;
    return frame?.contentDocument?.documentElement?.dataset.theme === 'light'
      && themeLink?.href.includes('/themes/light-v2.css');
  });
  await page.locator('[data-theme-value="dark"]').click();
  await page.waitForFunction(() => {
    const themeLink = document.querySelector('#habr-theme-stylesheet');
    const frame = document.querySelector('iframe:not([hidden])');
    const frameThemeLink = frame?.contentDocument
      ? [...frame.contentDocument.querySelectorAll('link[rel="stylesheet"]')].find(link => /\/themes\/(?:light|dark)-v2\.css/.test(link.href))
      : null;
    return document.documentElement.dataset.theme === 'dark'
      && themeLink?.href.includes('/themes/dark-v2.css')
      && frame?.contentDocument?.documentElement?.dataset.theme === 'dark'
      && frameThemeLink?.href.includes('/themes/dark-v2.css');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark'
    && document.querySelector('[data-theme-value="dark"]')?.getAttribute('aria-pressed') === 'true');
  await page.evaluate(id => { location.hash = id; }, entries[1].id);
  await page.waitForFunction(id => document.querySelector('#raw-json')?.textContent.includes(`"id": "${id}"`), entries[1].id);
  await page.waitForFunction(() => {
    const frame = document.querySelector('iframe:not([hidden])');
    const themeLink = frame?.contentDocument
      ? [...frame.contentDocument.querySelectorAll('link[rel="stylesheet"]')].find(link => /\/themes\/(?:light|dark)-v2\.css/.test(link.href))
      : null;
    return frame?.contentDocument?.documentElement?.dataset.theme === 'dark'
      && themeLink?.href.includes('/themes/dark-v2.css');
  });
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

  await page.evaluate(() => { location.hash = 'icons'; });
  await page.waitForFunction(() => document.querySelector('#raw-json')?.textContent.includes('"id": "icons"'));
  for (const exampleId of ['production', 'editor']) {
    const frame = page.locator(`[data-stacked-example="${exampleId}"] iframe`);
    await frame.waitFor({ state: 'visible' });
    try {
      await page.waitForFunction(id => {
        const frameDocument = document.querySelector(`[data-stacked-example="${CSS.escape(id)}"] iframe`)?.contentDocument;
        const themeLink = frameDocument
          ? [...frameDocument.querySelectorAll('link[rel="stylesheet"]')]
            .find(link => /\/themes\/(?:light|dark)-v2\.css/.test(link.href))
          : null;
        const expectedTheme = document.documentElement.dataset.theme;
        return frameDocument?.documentElement?.dataset.theme === expectedTheme
          && themeLink?.href.includes(`/themes/${expectedTheme}-v2.css`)
          && frameDocument.querySelector('.asset-card__icon_tokenized')
          && !frameDocument.querySelector('.asset-card img[src*="/icons/"]');
      }, exampleId, { timeout: 5000 });
    } catch {
      failures.push(`icons/${exampleId}: monochrome SVG previews were not tokenized`);
      continue;
    }
    try {
      await page.waitForFunction(id => {
        const frameDocument = document.querySelector(`[data-stacked-example="${CSS.escape(id)}"] iframe`)?.contentDocument;
        if (!frameDocument) return false;
        const probe = frameDocument.createElement('span');
        probe.style.cssText = 'transition:none;color:var(--icon-primary)';
        frameDocument.body.append(probe);
        const expected = getComputedStyle(probe).color;
        probe.remove();
        return [...frameDocument.querySelectorAll('.asset-card__icon_tokenized')].every(svg => {
          if (getComputedStyle(svg).color !== expected) return false;
          const fillsMatch = [...svg.querySelectorAll('[fill="currentColor"]')]
            .every(node => getComputedStyle(node).fill === expected);
          const strokesMatch = [...svg.querySelectorAll('[stroke="currentColor"]')]
            .every(node => getComputedStyle(node).stroke === expected);
          return fillsMatch && strokesMatch;
        });
      }, exampleId, { timeout: 5000 });
    } catch {
      failures.push(`icons/${exampleId}: token paint transition did not settle`);
    }

    const paintFailures = await frame.evaluate(element => {
      const document = element.contentDocument;
      const probe = document.createElement('span');
      probe.style.color = 'var(--icon-primary)';
      probe.style.transition = 'none';
      document.body.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();

      return [...document.querySelectorAll('.asset-card__icon_tokenized')].flatMap(svg => {
        const mismatches = [];
        if (getComputedStyle(svg).color !== expected
          || (svg.getAttribute('fill') === 'currentColor' && getComputedStyle(svg).fill !== expected)) {
          mismatches.push(svg.closest('.asset-card')?.querySelector('figcaption')?.textContent || 'unknown icon');
        }
        svg.querySelectorAll('[fill="currentColor"]').forEach(node => {
          if (getComputedStyle(node).fill !== expected) {
            mismatches.push(`${svg.closest('.asset-card')?.querySelector('figcaption')?.textContent || 'unknown icon'} fill`);
          }
        });
        svg.querySelectorAll('[stroke="currentColor"]').forEach(node => {
          if (getComputedStyle(node).stroke !== expected) {
            mismatches.push(`${svg.closest('.asset-card')?.querySelector('figcaption')?.textContent || 'unknown icon'} stroke`);
          }
        });
        return mismatches;
      });
    });
    if (paintFailures.length) failures.push(...paintFailures.map(name => `icons/${exampleId}: token paint mismatch in ${name}`));
  }

  await page.evaluate(() => { location.hash = 'field'; });
  await page.waitForFunction(() => document.querySelector('#raw-json')?.textContent.includes('"id": "field"'));
  const fieldFrame = page.locator('iframe[src*="components/field/input-inactive.html"]').first();
  await fieldFrame.waitFor({ state: 'visible' });
  for (const theme of ['dark', 'light']) {
    await page.locator(`[data-theme-value="${theme}"]`).click();
    await page.waitForFunction(expectedTheme => {
      const frame = document.querySelector('iframe[src*="components/field/input-inactive.html"]');
      return document.documentElement.dataset.theme === expectedTheme
        && frame?.contentDocument?.documentElement?.dataset.theme === expectedTheme;
    }, theme);
    await page.waitForTimeout(250);
    const disabledColors = await fieldFrame.evaluate(element => {
      const document = element.contentDocument;
      const input = document.querySelector('.tm-input-text-decorated__input:disabled');
      const probe = document.createElement('span');
      probe.style.cssText = 'transition:none;background-color:var(--background-secondary);color:var(--other-disabled-elements)';
      document.body.append(probe);
      const expected = getComputedStyle(probe);
      const actual = getComputedStyle(input);
      const result = {
        background: actual.backgroundColor,
        expectedBackground: expected.backgroundColor,
        color: actual.color,
        expectedColor: expected.color
      };
      probe.remove();
      return result;
    });
    if (disabledColors.background !== disabledColors.expectedBackground) {
      failures.push(`field: disabled background does not use --background-secondary in ${theme} theme`);
    }
    if (disabledColors.color !== disabledColors.expectedColor) {
      failures.push(`field: disabled text does not use --other-disabled-elements in ${theme} theme`);
    }
  }

  await page.evaluate(() => { location.hash = 'pagination'; });
  await page.waitForFunction(() => document.querySelector('#raw-json')?.textContent.includes('"id": "pagination"'));
  const paginationFrames = page.locator('iframe[src*="components/pagination/"]');
  if (await paginationFrames.count() !== 2) failures.push('pagination: both responsive examples are not rendered');
  for (let index = 0; index < await paginationFrames.count(); index += 1) {
    const frame = paginationFrames.nth(index);
    await frame.waitFor({ state: 'visible' });
    await page.waitForFunction(frameIndex => {
      const element = document.querySelectorAll('iframe[src*="components/pagination/"]')[frameIndex];
      return element?.contentDocument?.querySelector('.tm-pagination__page_current');
    }, index);
    const geometry = await frame.evaluate(element => {
      const document = element.contentDocument;
      const current = document.querySelector('.tm-pagination__page_current');
      const arrow = document.querySelector('.tm-pagination__arrow');
      const currentRect = current.getBoundingClientRect();
      const arrowRect = arrow.getBoundingClientRect();
      return {
        current: [currentRect.width, currentRect.height],
        currentBoxSizing: getComputedStyle(current).boxSizing,
        arrow: [arrowRect.width, arrowRect.height],
        arrowBoxSizing: getComputedStyle(arrow).boxSizing
      };
    });
    if (geometry.current.some(value => Math.abs(value - 32) > 0.5)
      || geometry.currentBoxSizing !== 'content-box') {
      failures.push(`pagination: current page is not a 32px content-box square in example ${index + 1}`);
    }
    if (geometry.arrowBoxSizing !== 'content-box') {
      failures.push(`pagination: arrow lost its content-box geometry in example ${index + 1}`);
    }
  }

  await page.evaluate(() => { location.hash = 'dialog'; });
  await page.waitForFunction(() => document.querySelector('#raw-json')?.textContent.includes('"id": "dialog"'));
  const drawerFrame = page.locator('[data-stacked-example="telefon-niznaa-storka-bottom-drawer-inner-s-ruck"] iframe');
  await drawerFrame.waitFor({ state: 'visible' });
  await drawerFrame.evaluate(element => { element.style.setProperty('width', '900px', 'important'); });
  await page.waitForFunction(() => {
    const frame = document.querySelector('[data-stacked-example="telefon-niznaa-storka-bottom-drawer-inner-s-ruck"] iframe');
    const header = frame?.contentDocument?.querySelector('.bottom-drawer-inner .header');
    return frame?.contentWindow?.innerWidth === 900
      && header
      && getComputedStyle(header).boxShadow !== 'none';
  });
  const drawerShadow = await drawerFrame.evaluate(element => {
    const document = element.contentDocument;
    const sheet = document.querySelector('.bottom-drawer-inner .sheet');
    const header = document.querySelector('.bottom-drawer-inner .header');
    const dragArea = document.querySelector('.bottom-drawer-inner .drag-area');
    return {
      sheet: getComputedStyle(sheet).boxShadow,
      header: getComputedStyle(header).boxShadow,
      headerTop: header.getBoundingClientRect().top,
      dragAreaTop: dragArea.getBoundingClientRect().top
    };
  });
  if (drawerShadow.sheet !== 'none' || drawerShadow.header === 'none'
    || drawerShadow.headerTop <= drawerShadow.dragAreaTop) {
    failures.push('dialog: bottom-drawer shadow must start at the content surface below the drag handle');
  }

  await page.evaluate(id => { location.hash = id; }, entries[entries.length - 1].id);
  await page.waitForFunction(id => document.querySelector('#raw-json')?.textContent.includes(`"id": "${id}"`), entries[entries.length - 1].id);

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
  if (!(await page.locator('.catalog-toggle').isVisible())) failures.push('mobile catalog toggle is hidden');
  if (await page.locator('#navigation').isVisible()) failures.push('mobile catalog must be collapsed initially');
  const mobileHeadingTop = await page.locator('#item-title').evaluate(element => element.getBoundingClientRect().top);
  if (mobileHeadingTop > 240) failures.push(`mobile content starts too low at ${mobileHeadingTop}px`);
  await page.locator('.catalog-toggle').click();
  await page.locator('#guide-search').fill('');
  if (await page.locator('.nav-section').count() < 2) failures.push('mobile navigation lost sections');
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (mobileOverflow) failures.push('viewer has horizontal overflow at 375px');
  if (runtimeErrors.length) failures.push(...runtimeErrors.map(error => `runtime: ${error}`));
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`OK: ${entries.length} viewer pages; global light/dark theme, tokenized icon paint, disabled field themes, pagination geometry, drawer shadow, persistence, intrinsic, viewport, notes, search and full-width shell verified`);
  }
} finally {
  await browser.close();
}
