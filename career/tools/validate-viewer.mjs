import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://127.0.0.1:4174';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const expectedViewportWidths = ['320', '480', '768', '1024', 'full'];
const runtimeErrors = [];
const forbiddenIsolatedSelectors = {
  avatar: ['.booster-gradient-wrapper'],
  calendar: ['.date-picker', '.time-picker'],
  'date-picker': ['.time-picker'],
  'time-picker': ['.date-picker', '.calendar'],
  dropzone: ['.file-upload__item'],
  'file-upload': ['.dropzone'],
  'inline-separator': ['.pretty-scroll__viewport'],
  'pretty-scroll': ['.inline-separator'],
  loader: ['.skeleton-pulse'],
  'text-length': ['.base-textarea']
};
page.on('pageerror', error => runtimeErrors.push(error.message));
page.on('response', response => { if (response.status() >= 400) runtimeErrors.push(`HTTP ${response.status()} ${response.url()}`); });

try {
  await page.goto(`${baseUrl}/viewer/`, { waitUntil: 'networkidle' });
  const entries = await page.evaluate(async () => {
    const index = await fetch('../machine/catalog.json').then(response => response.json());
    const files = index.sections.flatMap(section => section.file ? [section.file] : section.groups.map(group => group.file));
    return (await Promise.all(files.map(file => fetch(`../${file}`).then(response => response.json())))).flat();
  });
  const failures = [];
  let previews = 0;
  let previewExamples = 0;
  let markdownDocuments = 0;
  let sourceDataDocuments = 0;

  const shellRight = await page.locator('.shell').evaluate(element => element.getBoundingClientRect().right);
  const contentRight = await page.locator('.content').evaluate(element => element.getBoundingClientRect().right);
  if (Math.abs(shellRight - contentRight) > 1) failures.push('layout: content does not fill the available width');

  if (await page.locator('[data-item]').count() !== entries.length) failures.push(`navigation: expected ${entries.length} items`);
  for (const [group, title] of [['actions', 'Кнопки и действия'], ['forms', 'Поля и выбор'], ['cards', 'Карточки']]) {
    const heading = page.locator(`[data-nav-group="${group}"] > summary`);
    if (await heading.count() !== 1 || !(await heading.textContent()).includes(title)) failures.push(`navigation: group ${group} is missing`);
  }

  for (const entry of entries) {
    const item = await page.evaluate(file => fetch(`../${file}`).then(response => response.json()), entry.file);
    await page.evaluate(id => { location.hash = id; }, entry.id);
    try {
      await page.waitForFunction(id => document.querySelector('#raw-json')?.textContent.includes(`"id": "${id}"`), entry.id, { timeout: 5000 });
    } catch {
      failures.push(`${entry.id}: viewer did not render item`);
      continue;
    }

    const title = await page.locator('#item-title').textContent();
    if (title !== item.title) failures.push(`${entry.id}: title differs`);
    if ((await page.locator('#guide').innerText()).trim().length < 20) failures.push(`${entry.id}: readable guide is empty`);

    if (item.markdown) {
      markdownDocuments += 1;
      const markdown = page.locator('.markdown-body');
      if (await markdown.count() !== 1 || (await markdown.innerText()).trim().length < 20) failures.push(`${entry.id}: markdown is not rendered`);
    }

    if (item.sourceDataFile) {
      sourceDataDocuments += 1;
      const details = page.locator('.source-data');
      if (await details.count() !== 1) failures.push(`${entry.id}: source data control is missing`);
      else {
        await details.evaluate(element => { element.open = true; element.dispatchEvent(new Event('toggle')); });
        try { await page.waitForFunction(() => document.querySelector('.source-data')?.dataset.loaded === 'true', null, { timeout: 5000 }); }
        catch { failures.push(`${entry.id}: source data did not load`); }
      }
    }

    if (item.examples?.length) {
      previews += 1;
      const stacked = item.examples.length > 1 && item.examples.every(example => example.preview?.mode === 'intrinsic');
      const frame = page.locator('#preview');
      if (stacked) {
        if (await page.locator('#example-tabs').isVisible()) failures.push(`${entry.id}: intrinsic examples still use tabs`);
        if (await page.locator('#example-stack .stacked-example').count() !== item.examples.length) failures.push(`${entry.id}: stacked example count differs`);
        for (const example of item.examples) {
          previewExamples += 1;
          const section = page.locator(`[data-stacked-example="${example.id}"]`);
          const stackedFrame = section.locator('iframe');
          if ((await section.locator('h2').textContent()) !== example.title) failures.push(`${entry.id}/${example.id}: stacked heading differs`);
          try {
            await page.waitForFunction(({ id, file }) => {
              const iframe = document.querySelector(`[data-stacked-example="${CSS.escape(id)}"] iframe`);
              return iframe?.src.includes(file) && (iframe?.contentDocument?.body?.textContent?.trim().length > 0 || iframe?.contentDocument?.querySelector('svg,img,.career-shell'));
            }, { id: example.id, file: example.file }, { timeout: 5000 });
            await page.waitForFunction(id => {
              const iframe = document.querySelector(`[data-stacked-example="${CSS.escape(id)}"] iframe`);
              const body = iframe?.contentDocument?.body;
              return iframe?.getAttribute('scrolling') === 'no' && body && Math.abs(iframe.getBoundingClientRect().height - body.scrollHeight) <= 3;
            }, example.id, { timeout: 5000 });
          } catch { failures.push(`${entry.id}/${example.id}: stacked intrinsic preview is empty or does not fit`); }
          const background = await stackedFrame.evaluate(iframe => getComputedStyle(iframe.contentDocument.body).backgroundColor);
          if (!['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'].includes(background)) failures.push(`${entry.id}/${example.id}: intrinsic preview has decorative body background ${background}`);
          if (!(await stackedFrame.isVisible())) failures.push(`${entry.id}/${example.id}: stacked preview is hidden`);
        }
      } else if (!(await frame.isVisible())) failures.push(`${entry.id}: preview is hidden`);
      else {
        for (const [exampleIndex, example] of item.examples.entries()) {
          previewExamples += 1;
          if (item.examples.length > 1 || exampleIndex > 0) await page.locator(`[data-example="${example.id}"]`).click();
          try {
            await page.waitForFunction(file => {
              const iframe = document.querySelector('#preview');
              return iframe?.src.includes(file) && (iframe?.contentDocument?.body?.textContent?.trim().length > 0 || iframe?.contentDocument?.querySelector('svg,img,.career-shell'));
            }, example.file, { timeout: 5000 });
          } catch { failures.push(`${entry.id}/${example.id}: preview iframe is empty`); }
          if (example.preview.mode === 'intrinsic') {
            if (await page.locator('.preview-toolbar').isVisible()) failures.push(`${entry.id}/${example.id}: intrinsic preview shows viewport controls`);
            try {
              await page.waitForFunction(() => {
                const iframe = document.querySelector('#preview');
                const body = iframe?.contentDocument?.body;
                return iframe?.getAttribute('scrolling') === 'no' && body && Math.abs(iframe.getBoundingClientRect().height - body.scrollHeight) <= 3;
              }, null, { timeout: 5000 });
            } catch { failures.push(`${entry.id}/${example.id}: intrinsic preview did not fit its content`); }
            const background = await frame.evaluate(iframe => getComputedStyle(iframe.contentDocument.body).backgroundColor);
            if (!['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'].includes(background)) failures.push(`${entry.id}/${example.id}: intrinsic preview has decorative body background ${background}`);
          } else if (!(await page.locator('.preview-toolbar').isVisible())) {
            failures.push(`${entry.id}/${example.id}: viewport preview controls are hidden`);
          } else {
            const widths = await page.locator('#viewport-controls button').evaluateAll(buttons => buttons.map(button => button.dataset.width));
            if (JSON.stringify(widths) !== JSON.stringify(expectedViewportWidths)) failures.push(`${entry.id}/${example.id}: viewport controls differ from 320/480/768/1024/Auto`);
            await page.locator('#viewport-controls [data-width="full"]').click();
            const sizing = await page.locator('.preview-stage').evaluate(stage => {
              const frame = stage.querySelector('#preview');
              const style = getComputedStyle(stage);
              const available = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
              return { available, actual: frame.getBoundingClientRect().width };
            });
            if (Math.abs(sizing.available - sizing.actual) > 1) failures.push(`${entry.id}/${example.id}: Auto preview does not fill the stage`);
          }
          if (item.kind === 'pattern') {
            const legacyViewportVisible = await frame.evaluate(iframe => [...iframe.contentDocument.querySelectorAll('.vp-bar')]
              .some(element => getComputedStyle(element).display !== 'none'));
            if (legacyViewportVisible) failures.push(`${entry.id}/${example.id}: legacy viewport controls duplicate the viewer toolbar`);
            const embeddedNotes = await frame.evaluate(iframe => iframe.contentDocument.querySelectorAll('.note').length);
            if (embeddedNotes) failures.push(`${entry.id}/${example.id}: ${embeddedNotes} documentation notes remain inside the page preview`);
            const renderedNotes = await page.locator('#preview-notes li').count();
            if (renderedNotes !== item.previewNotes?.length) failures.push(`${entry.id}: expected ${item.previewNotes?.length || 0} preview notes outside the iframe, found ${renderedNotes}`);
            if (await page.locator('.preview-card #preview-notes').count()) failures.push(`${entry.id}: preview notes are nested inside the service preview`);
            const pageBackground = await frame.evaluate(iframe => getComputedStyle(iframe.contentDocument.body).backgroundColor);
            if (pageBackground !== 'rgb(255, 255, 255)') failures.push(`${entry.id}/${example.id}: page preview background is ${pageBackground}, expected white`);
            const wrapperPadding = await frame.evaluate(iframe => {
              const wrapper = iframe.contentDocument.querySelector('.pattern');
              return wrapper ? getComputedStyle(wrapper).padding : '0px';
            });
            if (wrapperPadding !== '0px') failures.push(`${entry.id}/${example.id}: page preview wrapper has padding ${wrapperPadding}`);
            for (const width of [320, 480, 768, 1024]) {
              await page.locator(`#viewport-controls [data-width="${width}"]`).click();
              await page.waitForTimeout(220);
              const layout = await frame.evaluate(iframe => {
                const documentElement = iframe.contentDocument.documentElement;
                const dashboard = iframe.contentDocument.querySelector('.dashboard-split');
                const pageLayout = iframe.contentDocument.querySelector('.page-layout');
                return {
                  clientWidth: documentElement.clientWidth,
                  scrollWidth: documentElement.scrollWidth,
                  dashboardColumns: dashboard ? getComputedStyle(dashboard).gridTemplateColumns.split(' ').length : null,
                  pageColumns: pageLayout ? getComputedStyle(pageLayout).gridTemplateColumns.split(' ').length : null
                };
              });
              if (layout.scrollWidth > layout.clientWidth) failures.push(`${entry.id}/${example.id}: page overflows horizontally at ${width}px (${layout.scrollWidth}px)`);
              if (entry.id === 'dashboard' && width === 480 && layout.dashboardColumns !== 1) failures.push('dashboard: mobile composition must remain single-column through 767px');
              if (entry.id === 'dashboard' && width === 768 && layout.dashboardColumns !== 2) failures.push('dashboard: tablet composition must start at 768px');
              if (entry.id === 'listing' && width === 768 && layout.pageColumns !== 1) failures.push('listing: tablet composition must remain single-column through 1023px');
              if (entry.id === 'listing' && width === 1024 && layout.pageColumns !== 2) failures.push('listing: desktop composition must start at 1024px');
            }
            await page.locator('#viewport-controls [data-width="full"]').click();
            await page.waitForTimeout(220);
            const container = await frame.evaluate(iframe => {
              const documentElement = iframe.contentDocument.documentElement;
              const widths = [...iframe.contentDocument.querySelectorAll('.page-width')].map(element => {
                const rect = element.getBoundingClientRect();
                return { width: rect.width, left: rect.left };
              });
              return { viewport: documentElement.clientWidth, widths };
            });
            if (container.viewport > 1100 && container.widths.some(value => value.width > 1100.5)) failures.push(`${entry.id}/${example.id}: page container grows beyond 1100px`);
            if (container.viewport > 1100 && container.widths.some(value => Math.abs(value.left - (container.viewport - value.width) / 2) > 1)) failures.push(`${entry.id}/${example.id}: capped page container is not centered`);
          }
          if (example.id === 'isolated-example' && forbiddenIsolatedSelectors[item.id]) {
            const leakedSelectors = await frame.evaluate((iframe, selectors) => selectors
              .filter(selector => iframe.contentDocument.querySelector(selector)), forbiddenIsolatedSelectors[item.id]);
            if (leakedSelectors.length) failures.push(`${entry.id}/${example.id}: leaked sibling components ${leakedSelectors.join(', ')}`);
          }
        }
        if (item.assetInventoryFile || item.inventoryFile) {
          const inventoryFile = item.assetInventoryFile || item.inventoryFile;
          const inventory = await page.evaluate(file => fetch(`../${file}`).then(response => response.json()), inventoryFile);
          const expected = inventory.total ?? inventory.totals?.standalone;
          try {
            await page.waitForFunction(value => document.querySelector('#preview')?.contentDocument?.querySelector('#summary')?.textContent.includes(`${value} из ${value}`), expected, { timeout: 5000 });
          } catch { failures.push(`${entry.id}: asset gallery does not show the complete inventory`); }
        }
      }
    } else if (item.previewMode !== 'none' && !(await page.locator('#preview-missing').isVisible())) {
      failures.push(`${entry.id}: missing-preview explanation is hidden`);
    }
  }

  await page.locator('#guide-search').fill('Storybook snapshots');
  if (await page.locator('[data-item]').count() === 0) failures.push('full-text search returned no results');

  const assetFailures = await page.evaluate(async () => {
    const inventoryFiles = ['../machine/assets/ui-assets.json', '../machine/assets/evidence-assets.json'];
    const inventories = await Promise.all(inventoryFiles.map(file => fetch(file).then(response => response.json())));
    const assets = inventories.flatMap(inventory => inventory.assets.filter(asset => asset.previewable));
    const failures = [];
    let cursor = 0;
    async function worker() {
      while (cursor < assets.length) {
        const asset = assets[cursor++];
        const ok = asset.type === 'svg'
          ? await fetch(`../${asset.path}`).then(response => response.ok ? response.text() : '').then(text => text.trimStart().startsWith('<svg')).catch(() => false)
          : await new Promise(resolve => {
              const image = new Image(); image.onload = () => resolve(true); image.onerror = () => resolve(false); image.src = `../${asset.path}`;
            });
        if (!ok) failures.push(asset.path);
      }
    }
    await Promise.all(Array.from({ length: 16 }, worker));
    return failures;
  });
  if (assetFailures.length) failures.push(...assetFailures.map(path => `asset did not decode: ${path}`));

  await page.setViewportSize({ width: 375, height: 812 });
  const mobileSamples = ['colors', 'hh-import-banner', 'listing', 'guide-research-system-audit', 'data-machine-index'];
  for (const id of mobileSamples) {
    await page.evaluate(value => { location.hash = value; }, id);
    try { await page.waitForFunction(value => document.querySelector('#raw-json')?.textContent.includes(`"id": "${value}"`), id, { timeout: 5000 }); }
    catch { failures.push(`${id}: mobile viewer did not render item`); }
    if ((await page.locator('#guide').innerText()).trim().length < 20) failures.push(`${id}: mobile readable guide is empty`);
  }

  if (runtimeErrors.length) failures.push(...runtimeErrors.map(error => `runtime: ${error}`));
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`OK: ${entries.length} viewer pages, ${markdownDocuments} markdown documents, ${sourceDataDocuments} JSON sources, ${previews} preview pages and ${previewExamples} examples rendered`);
  }
} finally {
  await browser.close();
}
