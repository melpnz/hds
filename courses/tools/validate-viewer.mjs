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

async function readIntrinsicGeometry(frame) {
  const bodyLocator = frame.contentFrame().locator('body');
  await bodyLocator.locator('.example-root').waitFor();
  return bodyLocator.evaluate(body => {
    const root = body.querySelector('.example-root');
    const child = root.firstElementChild;
    const frameElement = body.ownerDocument.defaultView.frameElement;
    const rect = target => {
      const value = target.getBoundingClientRect();
      return { x: value.x, y: value.y, width: value.width, height: value.height };
    };
    const style = getComputedStyle(body);
    return {
      bodyWidth: body.clientWidth,
      frameHeight: frameElement.getBoundingClientRect().height,
      padding: parseFloat(style.paddingLeft),
      paddingBottom: parseFloat(style.paddingBottom),
      root: rect(root),
      child: rect(child),
    };
  });
}

function validateIntrinsicGeometry(owner, example, geometry) {
  const presentation = example.presentation;
  if (!presentation) failures.push(`${owner}: intrinsic preview has no presentation contract`);
  if (presentation?.layout === 'fit-content' && geometry.root.width >= geometry.bodyWidth - geometry.padding * 2 - 1) {
    failures.push(`${owner}: fit-content example stretches across the preview`);
  }
  if (['constrained', 'canvas', 'context'].includes(presentation?.layout) && geometry.root.width > presentation.width + 1) {
    failures.push(`${owner}: presentation exceeds its ${presentation.width}px width`);
  }
  if (presentation?.layout !== 'context' && (Math.abs(geometry.root.x - geometry.padding) > 1 || Math.abs(geometry.root.y - geometry.padding) > 1)) {
    failures.push(`${owner}: example root is not aligned to the preview padding`);
  }
  if (presentation?.layout !== 'context' && Math.abs(geometry.frameHeight - geometry.root.y - geometry.root.height - geometry.paddingBottom) > 1) {
    failures.push(`${owner}: intrinsic preview bottom padding differs from the other edges`);
  }
}

try {
  await page.goto(`${baseUrl}/viewer/`, { waitUntil: 'networkidle' });
  const entries = await page.evaluate(() => fetch('../machine/catalog.json').then(response => response.json()));
  const sectionTitles = await page.locator('.nav-section__title > span').allTextContents();
  if (JSON.stringify(sectionTitles) !== JSON.stringify(['Основы', 'Элементы', 'Блоки', 'Страницы'])) failures.push(`navigation: unexpected section hierarchy ${sectionTitles.join(', ')}`);
  if (!(await page.locator('#guide-version').textContent()).includes('в разработке')) failures.push('navigation: guide development status is hidden');
  if (entries.filter(entry => entry.kind === 'foundation').length !== 6) failures.push('navigation: expected six foundation pages');
  const fontExamples = [];
  const shellRight = await page.locator('.shell').evaluate(element => element.getBoundingClientRect().right);
  const contentRight = await page.locator('.content').evaluate(element => element.getBoundingClientRect().right);
  if (Math.abs(shellRight - contentRight) > 1) failures.push('layout: content does not fill available width');

  for (const entry of entries) {
    const item = await page.evaluate(file => fetch(`../${file}`).then(response => response.json()), entry.file);
    fontExamples.push(...item.examples.map(example => ({ owner: `${entry.id}/${example.id}`, file: example.file })));
    await page.evaluate(id => { location.hash = id; }, entry.id);
    await page.waitForFunction(id => document.querySelector('#raw-json')?.textContent.includes(`"id": "${id}"`), entry.id);
    if (item.examples.length === 1) {
      await page.waitForFunction(expected => decodeURIComponent(document.querySelector('#preview')?.src || '').includes(expected), item.examples[0].file);
      await page.locator('#preview').contentFrame().locator('body').waitFor({ state: 'attached' });
    }

    if (item.examples.length > 1 && item.examples.every(example => example.preview.mode === 'intrinsic')) {
      if (await page.locator('#example-tabs').isVisible()) failures.push(`${entry.id}: intrinsic examples use tabs`);
      if (await page.locator('.preview-toolbar').isVisible()) failures.push(`${entry.id}: intrinsic examples show viewport toolbar`);
      if (await page.locator('.stacked-example').count() !== item.examples.length) failures.push(`${entry.id}: not all intrinsic examples are stacked`);
      for (const [index, frame] of (await page.locator('.stacked-example iframe').all()).entries()) {
        await frame.waitFor({ state: 'visible' });
        await page.waitForFunction(position => document.querySelectorAll('.stacked-example iframe')[position]?.contentDocument?.body, index);
        const dimensions = await frame.evaluate(element => ({ frame: element.clientHeight, body: element.contentDocument.body.scrollHeight }));
        if (Math.abs(dimensions.frame - dimensions.body) > 3) failures.push(`${entry.id}: intrinsic iframe does not fit content height`);
        validateIntrinsicGeometry(`${entry.id}/${item.examples[index].id}`, item.examples[index], await readIntrinsicGeometry(frame));
      }
    }

    if (entry.id === 'button') {
      const frame = page.locator('#preview');
      const preview = frame.contentFrame();
      const button = preview.locator('.crs-button-target');
      await button.waitFor();
      if (await button.count() !== 1) failures.push('button: playground must render exactly one working Button');
      const presets = preview.locator('.crs-button-preset');
      if (await presets.count() !== 6) failures.push('button: playground must render six tone presets');
      const mainPreset = preview.locator('.crs-button-preset[data-tone="main"]');
      const restingBackground = await mainPreset.evaluate(element => getComputedStyle(element).backgroundColor);
      await mainPreset.hover();
      await page.waitForTimeout(180);
      const hoverBackground = await mainPreset.evaluate(element => getComputedStyle(element).backgroundColor);
      if (hoverBackground === restingBackground) failures.push('button: tone presets do not expose real hover feedback');
      await preview.locator('.crs-button-preset[data-tone="danger"]').click();
      if (await preview.locator('#button-tone').inputValue() !== 'danger' || !(await preview.locator('#button-icon').isChecked()) || await button.getAttribute('data-tone') !== 'danger') {
        failures.push('button: tone preset does not update the playground selection');
      }
      await preview.locator('#button-icon').check();
      const expectedIconGeometry = {
        m: { edge: 8, gap: 4 },
        l: { edge: 12, gap: 6 },
        xl: { edge: 16, gap: 8 },
      };
      for (const [size, expected] of Object.entries(expectedIconGeometry)) {
        await preview.locator('#button-size').selectOption(size);
        const actual = await button.evaluate(element => {
          const icon = element.querySelector('.crs-button-icon');
          const label = icon.nextElementSibling;
          const buttonRect = element.getBoundingClientRect();
          const iconRect = icon.getBoundingClientRect();
          const labelRect = label.getBoundingClientRect();
          const border = parseFloat(getComputedStyle(element).borderLeftWidth);
          return {
            width: iconRect.width,
            height: iconRect.height,
            viewBox: icon.getAttribute('viewBox'),
            edge: iconRect.left - buttonRect.left - border,
            gap: labelRect.left - iconRect.right,
          };
        });
        if (Math.abs(actual.width - 24) > 0.1 || Math.abs(actual.height - 24) > 0.1 || actual.viewBox !== '0 0 24 24') {
          failures.push(`button/${size}: leading icon is not 24x24 with a 24x24 viewBox`);
        }
        if (Math.abs(actual.edge - expected.edge) > 0.1 || Math.abs(actual.gap - expected.gap) > 0.1) {
          failures.push(`button/${size}: icon spacing is ${actual.edge}/${actual.gap}, expected ${expected.edge}/${expected.gap}`);
        }
      }
      await preview.locator('#button-size').selectOption('m');
      await preview.locator('#button-tone').selectOption('danger');
      if (!(await preview.locator('#button-source').textContent()).includes('Figma-only')) failures.push('button: Figma-only selection is not disclosed');
      await preview.locator('#button-state').selectOption('loading');
      if (await button.getAttribute('aria-busy') !== 'true') failures.push('button: loading control does not set aria-busy');
      await preview.locator('#button-state').selectOption('default');
      await preview.locator('#button-tone').selectOption('main');
      const naturalWidth = await button.evaluate(element => element.getBoundingClientRect().width);
      await preview.locator('#button-stretch').check();
      const stretched = await preview.locator('.crs-button-slot').evaluate(element => ({ slot: element.getBoundingClientRect().width, button: element.firstElementChild.getBoundingClientRect().width }));
      if (Math.abs(stretched.slot - stretched.button) > 1 || stretched.button <= naturalWidth) failures.push('button: contextual stretch control does not fill its slot');
      await preview.locator('#button-size').selectOption('xl');
      const xlToneState = await preview.locator('#button-tone').evaluate(element => ({ value: element.value, dangerDisabled: element.querySelector('[value="danger"]').disabled }));
      if (xlToneState.value !== 'main' || !xlToneState.dangerDisabled) failures.push('button: XL exposes Figma-unconfirmed status tones');
      await preview.locator('#button-size').selectOption('m');
      await preview.locator('#button-stretch').uncheck();
      await page.waitForTimeout(50);
      const layoutRuleSection = page.locator('.spec-section').filter({ has: page.getByRole('heading', { name: 'Поведение в раскладке' }) });
      if (await layoutRuleSection.locator('li').count() !== 5) failures.push('button: contextual layout rules are not visible in the guide');
    }

    if (entry.id === 'icon-button') {
      await page.locator('#preview').waitFor({ state: 'visible' });
      const preview = page.locator('#preview').contentFrame();
      const buttons = preview.locator('.crs-icon-button');
      await buttons.first().waitFor();
      await page.waitForTimeout(80);
      if (await buttons.count() !== 5) failures.push('icon-button: five Figma states are not visible');
      const geometry = await buttons.evaluateAll(elements => elements.map(element => {
        const button = element.getBoundingClientRect();
        const icon = element.querySelector('svg');
        const iconStyle = getComputedStyle(icon);
        return { button: [button.width, button.height], icon: [parseFloat(iconStyle.width), parseFloat(iconStyle.height)], viewBox: icon.getAttribute('viewBox') };
      }));
      if (!geometry.every(value => value.button.every(size => Math.abs(size - 36) < .1))) failures.push('icon-button: every control must be 36×36');
      if (!geometry.every(value => value.icon.every(size => Math.abs(size - 24) < .1) && value.viewBox === '0 0 24 24')) failures.push('icon-button: every icon must be 24×24 with a 24×24 viewBox');
      const defaultButton = preview.locator('[data-state="default"]');
      const restColor = await defaultButton.evaluate(element => getComputedStyle(element).color);
      await defaultButton.hover();
      await page.waitForTimeout(180);
      const hoverColor = await defaultButton.evaluate(element => getComputedStyle(element).color);
      if (hoverColor === restColor) failures.push('icon-button: default control has no real hover state');
      await defaultButton.focus();
      await page.waitForTimeout(180);
      const focusShadow = await defaultButton.evaluate(element => getComputedStyle(element).boxShadow);
      if (!focusShadow.includes('166, 167, 169')) failures.push('icon-button: focus-visible ring is absent');
      if (!(await preview.locator('[data-state="disabled"]').isDisabled())) failures.push('icon-button: disabled state is not native');
      if (await preview.locator('[data-state="loading"]').getAttribute('aria-busy') !== 'true') failures.push('icon-button: loading state misses aria-busy');
    }

    if (entry.id === 'rubrication-bar') {
      const preview = page.locator('#preview').contentFrame();
      const stage = preview.locator('.crs-rubrication-demo');
      const bar = preview.locator('.rubrication-header');
      await stage.waitFor();
      if (!(await page.locator('.preview-toolbar').isVisible())) failures.push('rubrication-bar: responsive viewport controls are absent');
      await page.locator('#viewport-controls [data-width="320"]').click();
      await page.waitForTimeout(240);
      const mobile = await stage.evaluate(element => {
        const bar = element.querySelector('.rubrication-header');
        const firstLink = bar.querySelector('a');
        const stageStyle = getComputedStyle(element);
        return {
          height: element.getBoundingClientRect().height,
          backgroundImage: stageStyle.backgroundImage,
          links: bar.querySelectorAll('a').length,
          linkColor: getComputedStyle(firstLink).color,
          barOverflow: bar.scrollWidth - bar.clientWidth,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      if (Math.abs(mobile.height - 40) > .1 || mobile.backgroundImage === 'none') failures.push('rubrication-bar: visible production background or 40px geometry is absent');
      if (mobile.links !== 4 || mobile.linkColor !== 'rgb(255, 255, 255)') failures.push('rubrication-bar: four white rubric links are not visible');
      if (mobile.barOverflow < 1 || mobile.pageOverflow > 1) failures.push('rubrication-bar: mobile links do not scroll inside the bar');
      await bar.evaluate(element => { element.scrollLeft = element.scrollWidth; });
      if (await bar.evaluate(element => element.scrollLeft) < 1) failures.push('rubrication-bar: horizontal scrolling is not functional');
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (entry.id === 'search-form') {
      const preview = page.locator('#preview').contentFrame();
      const form = preview.locator('.crs-search-form');
      const fields = preview.locator('.crs-search-form__select');
      const group = preview.locator('.crs-search-form__fields');
      const submit = preview.locator('.crs-search-form__submit');
      await form.waitFor();
      await page.locator('#viewport-controls [data-width="1024"]').click();
      await page.waitForTimeout(240);
      const desktop = await form.evaluate(element => {
        const controls = [...element.querySelectorAll('.crs-search-form__select')];
        const rects = controls.map(control => control.getBoundingClientRect());
        const group = element.querySelector('.crs-search-form__fields').getBoundingClientRect();
        const submit = element.querySelector('.crs-search-form__submit').getBoundingClientRect();
        const style = getComputedStyle(controls[0]);
        return {
          count: controls.length,
          heights: rects.map(rect => rect.height),
          joins: [rects[1].left - rects[0].right, rects[2].left - rects[1].right],
          actionGap: submit.left - group.right,
          font: [style.fontSize, style.lineHeight],
          padding: [style.paddingLeft, style.paddingRight],
          rows: getComputedStyle(element).gridTemplateRows.split(' ').length,
        };
      });
      if (desktop.count !== 3 || desktop.heights.some(height => Math.abs(height - 56) > .1)) failures.push('search-form: fields are not three Select XL controls');
      if (desktop.joins.some(gap => Math.abs(gap + 1) > .1)) failures.push(`search-form: desktop borders do not overlap into 1px separators (${desktop.joins.join(', ')})`);
      if (Math.abs(desktop.actionGap - 8) > .1 || desktop.rows !== 1) failures.push('search-form: desktop group and action layout is incorrect');
      if (JSON.stringify(desktop.font) !== JSON.stringify(['16px', '22px']) || JSON.stringify(desktop.padding) !== JSON.stringify(['16px', '12px'])) failures.push('search-form: Select XL typography or padding is incorrect');

      await page.locator('#viewport-controls [data-width="320"]').click();
      await page.waitForTimeout(240);
      const mobile = await form.evaluate(element => {
        const controls = [...element.querySelectorAll('.crs-search-form__select')].map(control => control.getBoundingClientRect());
        const group = element.querySelector('.crs-search-form__fields').getBoundingClientRect();
        const submit = element.querySelector('.crs-search-form__submit').getBoundingClientRect();
        return {
          joins: [controls[1].top - controls[0].bottom, controls[2].top - controls[1].bottom],
          actionGap: submit.top - group.bottom,
          widths: [group.width, submit.width],
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      if (mobile.joins.some(gap => Math.abs(gap + 1) > .1)) failures.push(`search-form: mobile borders do not overlap into 1px separators (${mobile.joins.join(', ')})`);
      if (Math.abs(mobile.actionGap - 16) > .1 || Math.abs(mobile.widths[0] - mobile.widths[1]) > .1) failures.push('search-form: mobile action is not a full-width control with a 16px gap');
      if (mobile.pageOverflow > 1) failures.push('search-form: mobile layout overflows horizontally');
      if (await fields.count() !== 3 || await group.count() !== 1 || await submit.count() !== 1) failures.push('search-form: composed controls are incomplete');
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (entry.id === 'modal') {
      if (!(await page.locator('.preview-toolbar').isVisible())) failures.push('modal: responsive playground must expose viewport controls');
      const preview = page.locator('#preview').contentFrame();
      const modal = preview.locator('#modal-target');
      const body = preview.locator('.crs-modal__body');
      const wrap = preview.locator('#modal-wrap');
      await page.locator('#viewport-controls [data-width="1024"]').click();
      await page.waitForTimeout(240);
      await modal.waitFor();
      const desktop = await modal.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const image = element.querySelector('.crs-modal__image').getBoundingClientRect();
        const body = element.querySelector('.crs-modal__body');
        return { width: rect.width, height: rect.height, radius: getComputedStyle(element).borderRadius, imageHeight: image.height, overflowY: getComputedStyle(body).overflowY, scrollRange: body.scrollHeight - body.clientHeight };
      });
      if (Math.abs(desktop.width - 320) > .1 || Math.abs(desktop.height - 470) > .1 || desktop.radius !== '24px') failures.push('modal: desktop shell geometry is incorrect');
      if (Math.abs(desktop.imageHeight - 140) > .1 || desktop.overflowY !== 'auto' || desktop.scrollRange < 100) failures.push('modal: media or independently scrollable body is incorrect');
      const fixedBefore = await modal.evaluate(element => ({ header: element.querySelector('.crs-modal__header').getBoundingClientRect().top, footer: element.querySelector('.crs-modal__footer').getBoundingClientRect().top }));
      await body.evaluate(element => { element.scrollTop = 500; });
      const fixedAfter = await modal.evaluate(element => ({ header: element.querySelector('.crs-modal__header').getBoundingClientRect().top, footer: element.querySelector('.crs-modal__footer').getBoundingClientRect().top, scrollTop: element.querySelector('.crs-modal__body').scrollTop }));
      if (fixedAfter.scrollTop < 100 || Math.abs(fixedBefore.header - fixedAfter.header) > .1 || Math.abs(fixedBefore.footer - fixedAfter.footer) > .1) failures.push('modal: body scrolling moves the header or footer');

      if (await preview.locator('.crs-modal-preset').count()) failures.push('modal: internal device presets must be absent');
      await page.locator('#viewport-controls [data-width="320"]').click();
      await page.waitForTimeout(240);
      const mobile = await modal.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const stage = element.closest('.crs-modal-stage').getBoundingClientRect();
        const footerStyle = getComputedStyle(element.querySelector('.crs-modal__footer'));
        return { width: rect.width, height: rect.height, bottomGap: stage.bottom - rect.bottom, radius: getComputedStyle(element).borderRadius, footerPadding: [footerStyle.paddingTop, footerStyle.paddingRight, footerStyle.paddingBottom, footerStyle.paddingLeft] };
      });
      if (Math.abs(mobile.width - 320) > .1 || Math.abs(mobile.height - 454) > .1 || Math.abs(mobile.bottomGap) > .1 || mobile.radius !== '24px 24px 0px 0px') failures.push('modal: mobile bottom-sheet geometry is incorrect');
      if (JSON.stringify(mobile.footerPadding) !== JSON.stringify(['16px', '24px', '16px', '24px']) || !(await preview.locator('#modal-handle').isVisible())) failures.push('modal: mobile footer or handle is incorrect');

      await preview.locator('[data-part="image"]').uncheck();
      const imageOff = await modal.evaluate(element => {
        const shell = element.getBoundingClientRect();
        const footer = element.querySelector('.crs-modal__footer').getBoundingClientRect();
        const buttons = [...element.querySelectorAll('.crs-modal__footer .crs-modal__button')].map(button => button.getBoundingClientRect());
        return { height: shell.height, footerInside: footer.top >= shell.top && footer.bottom <= shell.bottom + .1, buttonsVisible: buttons.every(button => button.width > 0 && button.height > 0 && button.bottom <= shell.bottom + .1) };
      });
      if (Math.abs(imageOff.height - 314) > .1 || await preview.locator('.crs-modal__image').isVisible() || !imageOff.footerInside || !imageOff.buttonsVisible) failures.push('modal: optional image toggle hides or displaces the footer');
      await preview.locator('[data-part="image"]').check();
      await preview.locator('[data-part="scroll"]').uncheck();
      if (await body.evaluate(element => getComputedStyle(element).overflowY) !== 'hidden') failures.push('modal: scroll toggle is broken');
      await preview.locator('[data-part="scroll"]').check();

      await preview.locator('#modal-done').click();
      if (!(await wrap.isHidden()) || !(await preview.locator('#modal-open').evaluate(element => element === document.activeElement))) failures.push('modal: Done does not close and restore focus');
      await preview.locator('#modal-open').click();
      await preview.locator(':focus').press('Escape');
      if (!(await wrap.isHidden()) || !(await preview.locator('#modal-open').evaluate(element => element === document.activeElement))) failures.push('modal: Escape does not close and restore focus');
      await preview.locator('#modal-open').click();
      await preview.locator('#modal-stage').click({ position: { x: 8, y: 8 } });
      if (!(await wrap.isHidden())) failures.push('modal: overlay click does not close the dialog');
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (entry.id === 'promo-code-modal') {
      if (!(await page.locator('.preview-toolbar').isVisible())) failures.push('promo-code-modal: responsive variants must expose viewport controls');
      const preview = page.locator('#preview').contentFrame();
      const variants = preview.locator('.crs-promo-code-modal');
      await variants.first().waitFor();
      if (await variants.count() !== 2) failures.push('promo-code-modal: promo-code and promotion variants are not both available');
      await preview.locator('.variant-switch [data-variant="action"]').click();
      if (!(await variants.nth(1).isVisible()) || await variants.nth(0).isVisible()) failures.push('promo-code-modal: promotion variant cannot be selected');
      if (await preview.locator('.device-switch').count()) failures.push('promo-code-modal: internal device switch must be absent');
      for (const width of [320, 480, 768, 1024]) {
        await page.locator(`#viewport-controls [data-width="${width}"]`).click();
        await page.waitForTimeout(240);
        const geometry = await preview.locator('.crs-promo-code-modal:not([hidden])').evaluate(element => ({
          radius: getComputedStyle(element).borderRadius,
          bottom: element.getBoundingClientRect().bottom,
          stageBottom: element.closest('.promo-stage').getBoundingClientRect().bottom,
        }));
        if (width <= 480 && (geometry.radius !== '24px 24px 0px 0px' || Math.abs(geometry.bottom - geometry.stageBottom) > .1)) failures.push(`promo-code-modal: ${width}px does not use mobile presentation`);
        if (width >= 768 && geometry.radius !== '24px') failures.push(`promo-code-modal: ${width}px does not use tablet/desktop presentation`);
      }
      const overflow = await preview.locator('html').evaluate(element => element.scrollWidth - element.clientWidth);
      if (overflow > 1) failures.push('promo-code-modal: responsive variants overflow the preview');
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (entry.id === 'filter-modal') {
      const preview = page.locator('#preview').contentFrame();
      const modal = preview.locator('#filter-modal-target');
      const body = preview.locator('#filter-modal-body');
      await modal.waitFor();
      await page.locator('#viewport-controls [data-width="320"]').click();
      await page.waitForTimeout(240);
      const mobile = await modal.evaluate(element => {
        const header = element.querySelector('.crs-filter-modal__header');
        const body = element.querySelector('.crs-filter-modal__body');
        const footer = element.querySelector('.crs-filter-modal__footer');
        const main = footer.querySelector('.crs-filter-modal__button--main').getBoundingClientRect();
        const secondary = footer.querySelector('.crs-filter-modal__button--secondary').getBoundingClientRect();
        const recommendation = element.querySelector('.crs-filter-modal__recommendation-image').getBoundingClientRect();
        const box = target => target.getBoundingClientRect();
        return {
          modal: box(element), header: box(header), footer: box(footer),
          overflowY: getComputedStyle(body).overflowY,
          bodyScroll: body.scrollHeight - body.clientHeight,
          bodyPadding: [getComputedStyle(body).paddingLeft, getComputedStyle(body).paddingRight],
          footerDirection: getComputedStyle(footer).flexDirection,
          mainY: main.y, secondaryY: secondary.y,
          recommendation: [recommendation.width, recommendation.height],
          horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      if (Math.abs(mobile.modal.width - 320) > .1 || Math.abs(mobile.modal.height - 620) > .1) failures.push(`filter-modal: mobile shell is ${mobile.modal.width}x${mobile.modal.height}, expected 320x620`);
      if (Math.abs(mobile.header.height - 72) > .1 || Math.abs(mobile.footer.height - 136) > .1) failures.push('filter-modal: mobile header/footer heights are incorrect');
      if (mobile.overflowY !== 'auto' || mobile.bodyScroll < 100) failures.push('filter-modal: mobile body is not independently scrollable');
      if (mobile.bodyPadding.some(value => value !== '24px')) failures.push('filter-modal: mobile body must keep 24px side padding');
      if (mobile.footerDirection !== 'column' || mobile.mainY >= mobile.secondaryY) failures.push('filter-modal: mobile actions are not full-width primary-first stack');
      if (mobile.recommendation.some(value => Math.abs(value - 84) > .1)) failures.push('filter-modal: mobile recommendation card is not 84x84');
      if (mobile.horizontalOverflow > 1) failures.push('filter-modal: mobile preview overflows horizontally');
      const fixedBefore = await modal.evaluate(element => ({ header: element.querySelector('.crs-filter-modal__header').getBoundingClientRect().top, footer: element.querySelector('.crs-filter-modal__footer').getBoundingClientRect().top }));
      await body.evaluate(element => { element.scrollTop = 500; });
      await page.waitForTimeout(80);
      const fixedAfter = await modal.evaluate(element => ({ header: element.querySelector('.crs-filter-modal__header').getBoundingClientRect().top, footer: element.querySelector('.crs-filter-modal__footer').getBoundingClientRect().top, scrollTop: element.querySelector('.crs-filter-modal__body').scrollTop }));
      if (fixedAfter.scrollTop < 400 || Math.abs(fixedBefore.header - fixedAfter.header) > .1 || Math.abs(fixedBefore.footer - fixedAfter.footer) > .1) failures.push('filter-modal: scrolling the body moves the modal header or footer');
      await preview.locator('#filter-modal-close').click();
      if (!(await modal.isHidden()) || !(await preview.locator('#filter-modal-open').isVisible())) failures.push('filter-modal: close state is broken');
      await preview.locator('#filter-modal-open').click();
      if (!(await modal.isVisible())) failures.push('filter-modal: reopen state is broken');

      await page.locator('#viewport-controls [data-width="1024"]').click();
      await page.waitForTimeout(240);
      const desktop = await modal.evaluate(element => {
        const footer = element.querySelector('.crs-filter-modal__footer');
        const recommendation = element.querySelector('.crs-filter-modal__recommendation-image').getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height, footerHeight: footer.getBoundingClientRect().height, footerDirection: getComputedStyle(footer).flexDirection, recommendation: [recommendation.width, recommendation.height] };
      });
      if (Math.abs(desktop.width - 568) > .1 || Math.abs(desktop.height - 620) > .1 || Math.abs(desktop.footerHeight - 96) > .1) failures.push('filter-modal: desktop shell geometry is incorrect');
      if (desktop.footerDirection !== 'row' || desktop.recommendation.some(value => Math.abs(value - 124) > .1)) failures.push('filter-modal: desktop actions or recommendation geometry is incorrect');
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (entry.id === 'sort-sheet' || entry.id === 'price-sheet') {
      const isSort = entry.id === 'sort-sheet';
      if (!(await page.locator('.preview-toolbar').isVisible())) failures.push(`${entry.id}: responsive sheet must expose viewport controls`);
      const preview = page.locator('#preview').contentFrame();
      const stage = preview.locator('.sheet-stage');
      const panel = preview.locator(isSort ? '.crs-sort-sheet__panel' : '.crs-price-sheet__panel');
      await stage.waitFor();
      if (isSort) {
        if (await preview.locator('.device-switch').count()) failures.push('sort-sheet: internal device switch must be absent');
        for (const width of [320, 480, 768, 1024]) {
          await page.locator(`#viewport-controls [data-width="${width}"]`).click();
          await page.waitForTimeout(240);
          const geometry = await panel.evaluate(element => ({
            width: element.getBoundingClientRect().width,
            bottom: element.getBoundingClientRect().bottom,
            stageBottom: element.closest('.sheet-stage').getBoundingClientRect().bottom,
            radius: getComputedStyle(element).borderRadius,
            handle: getComputedStyle(element.querySelector('.crs-sort-sheet__handle')).display,
            overflow: getComputedStyle(element).overflow,
          }));
          if (width <= 480) {
            if (width === 320 && Math.abs(geometry.width - 320) > .1) failures.push('sort-sheet: mobile panel is not 320px wide');
            if (Math.abs(geometry.bottom - geometry.stageBottom) > .1 || geometry.radius !== '24px 24px 0px 0px' || geometry.handle === 'none') failures.push(`sort-sheet: ${width}px does not use mobile presentation`);
          } else if (Math.abs(geometry.width - 320) > .1 || geometry.radius !== '12px' || geometry.handle !== 'none') {
            failures.push(`sort-sheet: ${width}px does not use tablet/desktop presentation`);
          }
          if (geometry.overflow !== 'hidden') failures.push('sort-sheet: panel does not clip hover backgrounds inside its rounded corners');
        }
        const options = preview.locator('.crs-sort-sheet__option');
        if (await options.count() !== 6) failures.push('sort-sheet: expected six sorting options');
        await options.nth(2).click();
        if (await options.nth(2).getAttribute('aria-selected') !== 'true') failures.push('sort-sheet: selected value is not preserved');
        await options.nth(0).hover();
        const hover = await options.nth(0).evaluate(element => getComputedStyle(element).backgroundColor);
        if (hover === 'rgba(0, 0, 0, 0)') failures.push('sort-sheet: hover state is absent');
        await page.locator('#viewport-controls [data-width="full"]').click();
      } else {
        if (await preview.locator('.device-switch').count()) failures.push('price-sheet: internal device switch must be absent');
        for (const width of [320, 480, 768, 1024]) {
          await page.locator(`#viewport-controls [data-width="${width}"]`).click();
          await page.waitForTimeout(240);
          const geometry = await panel.evaluate(element => ({
            padding: getComputedStyle(element).padding,
            title: getComputedStyle(element.querySelector('.crs-price-sheet__title')).display,
            width: element.getBoundingClientRect().width,
            bottom: element.getBoundingClientRect().bottom,
            stageBottom: element.closest('.sheet-stage').getBoundingClientRect().bottom,
            bodyBottom: document.body.getBoundingClientRect().bottom,
          }));
          if (width <= 480) {
            if (geometry.padding !== '24px 24px 16px' || geometry.title === 'none') failures.push(`price-sheet: ${width}px does not use Mobile presentation`);
            if (width === 320 && Math.abs(geometry.width - 320) > .1) failures.push('price-sheet: mobile panel is not 320px wide');
            if (Math.abs(geometry.bottom - geometry.stageBottom) > .1 || Math.abs(geometry.stageBottom - geometry.bodyBottom) > .1) failures.push(`price-sheet: ${width}px leaves whitespace below the mobile panel`);
          } else if (geometry.padding !== '16px' || geometry.title !== 'none') {
            failures.push(`price-sheet: ${width}px does not use tablet/desktop presentation`);
          }
        }
        const inputs = preview.locator('.crs-price-sheet__input');
        await inputs.nth(0).fill('1000');
        await inputs.nth(1).fill('5000');
        await preview.locator('.crs-price-sheet__reset').click();
        if ((await inputs.nth(0).inputValue()) || (await inputs.nth(1).inputValue())) failures.push('price-sheet: reset must clear fields');
        await inputs.nth(0).focus();
        const focus = await inputs.nth(0).evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, parentBorder: getComputedStyle(element.parentElement).borderColor }));
        if (focus.outline !== 'none') failures.push('price-sheet: input draws an inner focus outline');
      }
    }

    if (entry.id === 'site-header') {
      await page.waitForFunction(() => decodeURIComponent(document.querySelector('#preview')?.src || '').includes('examples/components/site-header/index.html'));
      const preview = page.locator('#preview').contentFrame();
      const header = preview.locator('#site-header-target');
      await header.waitFor();
      const expectedHeights = {
        320: { listing: { hero: 744, page: 216, sticky: 172 }, courses: { hero: 142, page: 306, sticky: 172 }, simple: 56 },
        480: { listing: { hero: 464, page: 200, sticky: 156 }, courses: { hero: 110, page: 266, sticky: 124 }, simple: 56 },
        768: { listing: { hero: 464, page: 200, sticky: 156 }, courses: { hero: 110, page: 266, sticky: 124 }, simple: 56 },
        1024: { listing: { hero: 472, page: 208, sticky: 156 }, courses: { hero: 110, page: 266, sticky: 124 }, simple: 64 },
      };
      for (const width of [320, 480, 768, 1024]) {
        await page.locator(`#viewport-controls [data-width="${width}"]`).click();
        // The viewer animates preview width for 180 ms; wait for the iframe's
        // layout viewport to settle before checking responsive breakpoints.
        await page.waitForTimeout(240);
        for (const family of ['listing', 'courses']) {
          await preview.locator('#site-header-family').selectOption(family);
          for (const level of ['hero', 'page']) {
            await preview.locator('#site-header-level').selectOption(level);
            for (const sticky of level === 'page' ? [false, true] : [false]) {
              const stickyControl = preview.locator('#site-header-sticky');
              if (sticky) await stickyControl.check(); else if (await stickyControl.isChecked()) await stickyControl.uncheck();
              const geometry = await header.evaluate(element => {
                const box = element.getBoundingClientRect();
                const blue = element.querySelector('.crs-site-header__blue');
                const style = getComputedStyle(element);
                return { height: box.height, position: style.position, top: style.top, overflow: blue.scrollWidth - blue.clientWidth };
              });
              const expected = sticky ? expectedHeights[width][family].sticky : expectedHeights[width][family][level];
              if (Math.abs(geometry.height - expected) > .1) failures.push(`site-header: ${family}/${level}/${sticky ? 'sticky' : 'static'} is ${geometry.height}px at ${width}, expected ${expected}px`);
              if (geometry.overflow > 1) failures.push(`site-header: ${family}/${level} overflows horizontally at ${width}px`);
              if (sticky && (geometry.position !== 'sticky' || geometry.top !== '0px')) failures.push(`site-header: ${family}/page sticky behavior is absent at ${width}px`);
            }
          }
        }
        await preview.locator('#site-header-family').selectOption('simple');
        const simple = await header.evaluate(element => ({ height: element.getBoundingClientRect().height, overflow: element.querySelector('.crs-site-header__blue').scrollWidth - element.querySelector('.crs-site-header__blue').clientWidth }));
        if (Math.abs(simple.height - expectedHeights[width].simple) > .1 || simple.overflow > 1) failures.push(`site-header: SimplePageHeader geometry is incorrect at ${width}px`);
        if (!(await preview.locator('#site-header-level').isDisabled()) || !(await preview.locator('#site-header-sticky').isDisabled())) failures.push('site-header: invalid SimplePageHeader controls remain enabled');
        const navLabelVisible = await preview.locator('.crs-site-header__simple .crs-site-header__nav span').first().isVisible();
        if (navLabelVisible !== (width >= 1024)) failures.push(`site-header: navigation label breakpoint is incorrect at ${width}px`);
        const pageOverflow = await preview.locator('html').evaluate(element => element.scrollWidth - element.clientWidth);
        if (pageOverflow > 1) failures.push(`site-header: document overflows horizontally at ${width}px`);
      }
      await page.locator('#viewport-controls [data-width="1024"]').click();
      await page.waitForTimeout(240);
      await preview.locator('#site-header-family').selectOption('listing');
      await preview.locator('#site-header-level').selectOption('hero');
      const reuse = await header.evaluate(element => {
        const group = element.querySelector('.crs-tabs-group--hero');
        const tabs = [...element.querySelectorAll('.crs-context-tab')];
        const filters = element.querySelector('.crs-site-header__filters-inner');
        const filterRect = filters.getBoundingClientRect();
        return {
          groupBackground: getComputedStyle(group).backgroundColor,
          tabs: tabs.map(tab => ({ height: tab.getBoundingClientRect().height, radius: getComputedStyle(tab).borderTopLeftRadius })),
          filters: { width: filterRect.width, maxWidth: getComputedStyle(filters).maxWidth },
        };
      });
      if (reuse.groupBackground !== 'rgba(0, 0, 0, 0.12)' || reuse.tabs.length !== 2 || reuse.tabs.some(tab => Math.abs(tab.height - 40) > .1 || tab.radius !== '12px')) {
        failures.push('site-header: HeroTabs component geometry is not reused');
      }
      if (reuse.filters.maxWidth !== '1124px' || reuse.filters.width > 1124.1) failures.push('site-header: filter row exceeds the page container');
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (entry.id === 'tab') {
      const preview = page.locator('#preview').contentFrame();
      const chips = preview.locator('.crs-filter-chip');
      await chips.first().waitFor();
      if (await chips.count() !== 15) failures.push('tab: expected fifteen FilterChip samples');
      if (await preview.locator('.crs-filter-chip-matrix__row').count() !== 6) failures.push('tab: expected six FilterChip state rows');
      const geometry = await preview.locator('.crs-filter-chip-variants .crs-filter-chip--menu').evaluate(element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const icon = element.querySelector('.crs-filter-chip__icon');
        const iconRect = icon.getBoundingClientRect();
        return { height: rect.height, radius: style.borderTopLeftRadius, left: style.paddingLeft, right: style.paddingRight, fontSize: style.fontSize, lineHeight: style.lineHeight, icon: [iconRect.width, iconRect.height] };
      });
      if (Math.abs(geometry.height - 36) > .1 || geometry.radius !== '200px' || geometry.left !== '12px' || geometry.right !== '12px') failures.push('tab: FilterChip shell geometry is incorrect');
      if (geometry.fontSize !== '14px' || geometry.lineHeight !== '20px' || geometry.icon.some(value => Math.abs(value - 20) > .1)) failures.push('tab: FilterChip typography or icon geometry is incorrect');
      const switchGeometry = await preview.locator('.crs-filter-chip-variants .crs-filter-chip__switch').evaluate(element => {
        const rect = element.getBoundingClientRect();
        const track = element.querySelector('.crs-filter-chip__switch-track').getBoundingClientRect();
        return { shell: [rect.width, rect.height], track: [track.width, track.height] };
      });
      if (switchGeometry.shell[0] !== 32 || switchGeometry.shell[1] !== 20 || switchGeometry.track[0] !== 28 || switchGeometry.track[1] !== 16) failures.push('tab: FilterChipSwitch geometry is not 32x20 / 28x16');
      const defaultChip = preview.locator('.crs-filter-chip-variants .crs-filter-chip--menu');
      await page.mouse.move(0, 0);
      await page.waitForTimeout(80);
      const restBorder = await defaultChip.evaluate(element => getComputedStyle(element).borderColor);
      await defaultChip.hover();
      const hoverBorder = await defaultChip.evaluate(element => getComputedStyle(element).borderColor);
      if (hoverBorder === restBorder) failures.push('tab: FilterChip has no real hover state');
      await defaultChip.focus();
      const focusShadow = await defaultChip.evaluate(element => getComputedStyle(element).boxShadow);
      if (!focusShadow.includes('166, 167, 169')) failures.push('tab: FilterChip focus ring is absent');
      if (await preview.locator('.crs-filter-chip[data-state="disabled"]').filter({ hasText: 'Фильтр' }).isDisabled() !== true) failures.push('tab: disabled FilterChip is not native');
      const loadingChips = preview.locator('.crs-filter-chip[data-state="loading"]');
      if (await loadingChips.count() !== 2 || !(await loadingChips.evaluateAll(elements => elements.every(element => element.disabled && element.getAttribute('aria-busy') === 'true')))) failures.push('tab: loading FilterChip semantics are incomplete');
      const openChip = preview.locator('.crs-filter-chip[data-state="open"]');
      const dropdown = preview.locator('.crs-filter-chip-dropdown');
      if (await openChip.getAttribute('aria-expanded') !== 'true') failures.push('tab: open FilterChip is not exposed as expanded');
      const openGeometry = await dropdown.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const trigger = element.previousElementSibling.getBoundingClientRect();
        return { width: rect.width, height: rect.height, gap: rect.top - trigger.bottom };
      });
      if (Math.abs(openGeometry.width - 182) > .1 || Math.abs(openGeometry.height - 216) > .1 || Math.abs(openGeometry.gap - 3) > .1) failures.push('tab: open FilterChip dropdown geometry is incorrect');
      const imageGeometry = await preview.locator('.crs-filter-chip img').evaluateAll(elements => elements.map(element => [element.naturalWidth, element.naturalHeight]));
      if (!imageGeometry.every(([width, height]) => width === 20 && height === 20)) failures.push('tab: local Figma SVG assets are not 20x20');
    }

    if (['segmented-control', 'button-group'].includes(entry.id)) {
      const preview = page.locator('#preview').contentFrame();
      const contextClass = entry.id === 'segmented-control' ? 'hero' : 'page';
      const context = preview.locator(`.crs-tabs-context--${contextClass}`).first();
      await context.waitFor();
      const background = await context.evaluate(element => getComputedStyle(element).backgroundColor);
      const expectedBackground = entry.id === 'segmented-control' ? 'rgb(52, 110, 244)' : 'rgb(255, 255, 255)';
      if (background !== expectedBackground) failures.push(`${entry.id}: wrong tab context background ${background}`);
      const tabs = preview.locator('.crs-context-tab');
      if (await tabs.count() !== 9 || await preview.locator('.crs-tabs-sample').count() !== 6) failures.push(`${entry.id}: complete tab group/state shelf is absent`);
      if (entry.id === 'segmented-control') {
        const groupStyle = await preview.locator('.crs-tabs-group').first().evaluate(element => {
          const style = getComputedStyle(element);
          return { background: style.backgroundColor, radius: style.borderTopLeftRadius, padding: style.padding };
        });
        if (groupStyle.background !== 'rgba(0, 0, 0, 0.12)' || groupStyle.radius !== '12px' || groupStyle.padding !== '0px') failures.push('segmented-control: shared HeroTabs group background is incorrect');
      } else {
        const groupStyle = await preview.locator('.crs-tabs-group').first().evaluate(element => {
          const style = getComputedStyle(element);
          return { background: style.backgroundColor, radius: style.borderTopLeftRadius, padding: style.padding };
        });
        if (groupStyle.background !== 'rgb(241, 241, 241)' || groupStyle.radius !== '16px' || groupStyle.padding !== '4px') failures.push('button-group: shared PageTabs group background is incorrect');
      }
      const geometry = await tabs.first().evaluate(element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { height: rect.height, left: style.paddingLeft, right: style.paddingRight, radius: style.borderTopLeftRadius, fontSize: style.fontSize, lineHeight: style.lineHeight };
      });
      if (Math.abs(geometry.height - 40) > .1 || geometry.left !== '16px' || geometry.right !== '16px' || geometry.radius !== '12px' || geometry.fontSize !== '14px' || geometry.lineHeight !== '20px') failures.push(`${entry.id}: tab geometry is incorrect`);
      const defaultTab = preview.locator('.crs-tabs-group [data-state="default"]').first();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(80);
      const restColor = await defaultTab.evaluate(element => getComputedStyle(element).backgroundColor);
      await defaultTab.hover();
      const hoverColor = await defaultTab.evaluate(element => getComputedStyle(element).backgroundColor);
      if (hoverColor === restColor) failures.push(`${entry.id}: tab has no real hover state`);
      await defaultTab.focus();
      const focus = await defaultTab.evaluate(element => {
        const style = getComputedStyle(element);
        return { width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset };
      });
      const expectedFocus = entry.id === 'segmented-control' ? 'rgb(255, 255, 255)' : 'rgb(44, 46, 52)';
      if (focus.width !== '2px' || focus.color !== expectedFocus || focus.offset !== '1px') failures.push(`${entry.id}: focus-visible ring is incorrect`);
      const selectedColor = await preview.locator('.crs-tabs-states [data-state="selected"]').evaluate(element => getComputedStyle(element).backgroundColor);
      const expectedSelected = entry.id === 'segmented-control' ? 'rgb(44, 46, 52)' : 'rgb(255, 255, 255)';
      if (selectedColor !== expectedSelected) failures.push(`${entry.id}: selected tab color is incorrect`);
      if (!(await preview.locator('.crs-tabs-states [data-state="disabled"]').isDisabled())) failures.push(`${entry.id}: disabled tab is not native`);
      const loadingTab = preview.locator('.crs-tabs-states [data-state="loading"]');
      const loadingGeometry = await loadingTab.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const icon = element.querySelector('svg');
        const iconRect = icon.getBoundingClientRect();
        return { width: rect.width, icon: [iconRect.width, iconRect.height], viewBox: icon.getAttribute('viewBox'), busy: element.getAttribute('aria-busy'), disabled: element.disabled };
      });
      if (Math.abs(loadingGeometry.width - 56) > .1 || loadingGeometry.icon.some(value => Math.abs(value - 24) > .1) || loadingGeometry.viewBox !== '0 0 24 24' || loadingGeometry.busy !== 'true' || !loadingGeometry.disabled) failures.push(`${entry.id}: loading tab geometry or semantics are incorrect`);
    }

    if (['select', 'multi-select', 'search-input', 'text-input', 'textarea'].includes(entry.id)) {
      await page.locator('#preview').waitFor({ state: 'visible' });
      const preview = page.locator('#preview').contentFrame();
      const fields = preview.locator('.crs-field');
      await fields.first().waitFor();
      await page.waitForTimeout(80);
      const expectedCount = entry.id === 'textarea' ? 10 : ['select', 'multi-select'].includes(entry.id) ? 13 : entry.id === 'text-input' ? 14 : 12;
      if (await fields.count() !== expectedCount) failures.push(`${entry.id}: expected ${expectedCount} field samples`);
      const expectedRows = entry.id === 'text-input' ? 6 : 5;
      if (await preview.locator('.crs-field-matrix__row').count() !== expectedRows) failures.push(`${entry.id}: expected ${expectedRows} state rows`);

      if (entry.id === 'textarea') {
        const heights = await fields.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
        if (!heights.every(height => Math.abs(height - 82) < .1)) failures.push('textarea: state samples must be 82px high');
      } else {
        const sizeFields = preview.locator('.crs-field-sizes .crs-field');
        const geometry = await sizeFields.evaluateAll(elements => elements.map(element => {
          const shell = element.getBoundingClientRect();
          const text = element.matches('.crs-field--select') ? element.querySelector('.crs-field__text') : element.querySelector('input');
          const textRect = text.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            height: shell.height,
            textInset: textRect.left - shell.left - parseFloat(style.borderLeftWidth) + parseFloat(getComputedStyle(text).paddingLeft),
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
          };
        }));
        if (Math.abs(geometry[0].height - 40) > .1 || Math.abs(geometry[1].height - 56) > .1) failures.push(`${entry.id}: M/XL heights are not 40/56`);
        if (Math.abs(geometry[0].textInset - 12) > .1 || Math.abs(geometry[1].textInset - 16) > .1) failures.push(`${entry.id}: M/XL text insets are not 12/16`);
        if (!geometry.every(value => value.fontSize === '16px' && value.lineHeight === '22px')) failures.push(`${entry.id}: M/XL typography is not 16/22`);
      }

      if (['select', 'multi-select'].includes(entry.id)) {
        const openTrigger = preview.locator('.crs-field-dropdown-demo .crs-field');
        const dropdown = preview.locator('.crs-field-dropdown');
        const row = dropdown.locator('.crs-field-dropdown__row').first();
        const dropdownGeometry = await dropdown.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const trigger = element.previousElementSibling.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { height: rect.height, gap: rect.top - trigger.bottom, radius: style.borderTopLeftRadius, border: style.borderColor };
        });
        const rowGeometry = await row.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { height: rect.height, left: style.paddingLeft, right: style.paddingRight, fontSize: style.fontSize, lineHeight: style.lineHeight };
        });
        if (Math.abs(dropdownGeometry.height - 216) > .1 || Math.abs(dropdownGeometry.gap - 4) > .1) failures.push(`${entry.id}: dropdown height/gap are not 216/4`);
        if (dropdownGeometry.radius !== '12px' || dropdownGeometry.border !== 'rgb(233, 233, 234)') failures.push(`${entry.id}: dropdown shell geometry is incorrect`);
        if (Math.abs(rowGeometry.height - 40) > .1 || rowGeometry.left !== '16px' || rowGeometry.right !== '24px' || rowGeometry.fontSize !== '14px' || rowGeometry.lineHeight !== '20px') failures.push(`${entry.id}: dropdown row geometry is incorrect`);
        const expanded = entry.id === 'select' ? await openTrigger.getAttribute('aria-expanded') : await openTrigger.locator('input').getAttribute('aria-expanded');
        if (expanded !== 'true') failures.push(`${entry.id}: dropdown trigger is not exposed as expanded`);
        const rowRest = await row.evaluate(element => getComputedStyle(element).backgroundColor);
        await row.hover();
        const rowHover = await row.evaluate(element => getComputedStyle(element).backgroundColor);
        if (rowHover === rowRest) failures.push(`${entry.id}: dropdown row hover is absent`);
      }

      const defaultField = preview.locator('.crs-field-matrix__row').first().locator('.crs-field').first();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(180);
      const restBorder = await defaultField.evaluate(element => getComputedStyle(element).borderColor);
      await defaultField.hover();
      await page.waitForTimeout(180);
      const hoverBorder = await defaultField.evaluate(element => getComputedStyle(element).borderColor);
      if (hoverBorder === restBorder) failures.push(`${entry.id}: real hover feedback is absent`);
      const focusTarget = await defaultField.evaluate(element => element.matches('button')) ? defaultField : defaultField.locator('input,textarea').first();
      await focusTarget.focus();
      await page.waitForTimeout(180);
      const focusBorder = await defaultField.evaluate(element => getComputedStyle(element).borderColor);
      if (focusBorder !== 'rgb(44, 46, 52)') failures.push(`${entry.id}: real focus feedback is absent`);
      const errorBorder = await preview.locator('[data-state="error"]').first().evaluate(element => getComputedStyle(element).borderColor);
      if (errorBorder !== 'rgb(232, 68, 68)') failures.push(`${entry.id}: error border is incorrect`);
      const disabledField = preview.locator('[data-state="disabled"]').first();
      const disabledControl = await disabledField.evaluate(element => element.matches('button')) ? disabledField : disabledField.locator('input,textarea').first();
      if (!(await disabledControl.isDisabled())) failures.push(`${entry.id}: disabled state is not native`);
      const icons = preview.locator('.crs-field svg');
      if (await icons.count()) {
        const iconGeometry = await icons.evaluateAll(elements => elements.map(element => [element.getBoundingClientRect().width, element.getBoundingClientRect().height, element.getAttribute('viewBox')]));
        if (!iconGeometry.every(([width, height, viewBox]) => Math.abs(width - (entry.id === 'multi-select' ? 20 : 24)) < .1 && Math.abs(height - (entry.id === 'multi-select' ? 20 : 24)) < .1 && viewBox === '0 0 24 24')) failures.push(`${entry.id}: field icons have invalid geometry`);
      }
    }

    if (['checkbox', 'radio-button', 'switch'].includes(entry.id)) {
      const preview = page.locator('#preview').contentFrame();
      const matrix = preview.locator('.crs-control-matrix');
      await matrix.waitFor();
      const controls = matrix.locator('.crs-control');
      const expectedControls = entry.id === 'checkbox' ? 11 : 10;
      if (await controls.count() !== expectedControls) failures.push(`${entry.id}: state matrix must contain ${expectedControls} controls`);
      const expectedRows = entry.id === 'checkbox' ? 6 : 5;
      if (await matrix.locator('.crs-control-matrix__row').count() !== expectedRows) failures.push(`${entry.id}: state matrix must contain ${expectedRows} rows`);
      const baseGeometry = await controls.first().evaluate(element => {
        const control = element.getBoundingClientRect();
        const visual = element.querySelector('.crs-control__visual').getBoundingClientRect();
        const label = element.querySelector('.crs-control__label').getBoundingClientRect();
        const style = getComputedStyle(element);
        const labelStyle = getComputedStyle(element.querySelector('.crs-control__label'));
        return { height: control.height, visual: [visual.width, visual.height], gap: label.left - visual.right, labelTop: label.top - control.top, fontSize: style.fontSize, lineHeight: style.lineHeight, labelPadding: labelStyle.paddingTop };
      });
      const expectedVisualWidth = entry.id === 'switch' ? 40 : 24;
      if (Math.abs(baseGeometry.height - 26) > .1 || Math.abs(baseGeometry.visual[0] - expectedVisualWidth) > .1 || Math.abs(baseGeometry.visual[1] - 24) > .1) failures.push(`${entry.id}: control slot geometry is incorrect`);
      if (Math.abs(baseGeometry.gap - 8) > .1 || Math.abs(baseGeometry.labelTop) > .1 || baseGeometry.labelPadding !== '1px' || baseGeometry.fontSize !== '16px' || baseGeometry.lineHeight !== '22px') failures.push(`${entry.id}: control label geometry is incorrect`);

      const surface = controls.first().locator('.crs-control__surface');
      const surfaceGeometry = await surface.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height, radius: getComputedStyle(element).borderRadius };
      });
      const expectedSurface = entry.id === 'checkbox' ? [20, 20, '6px'] : entry.id === 'radio-button' ? [22, 22, '200px'] : [38, 22, '200px'];
      if (Math.abs(surfaceGeometry.width - expectedSurface[0]) > .1 || Math.abs(surfaceGeometry.height - expectedSurface[1]) > .1 || surfaceGeometry.radius !== expectedSurface[2]) failures.push(`${entry.id}: control surface geometry is incorrect`);

      const defaultOff = matrix.locator('[data-state="default"]').first();
      await page.mouse.move(0, 0);
      const restFill = await defaultOff.locator('.crs-control__surface').evaluate(element => getComputedStyle(element).backgroundColor);
      await defaultOff.hover();
      const hoverFill = await defaultOff.locator('.crs-control__surface').evaluate(element => getComputedStyle(element).backgroundColor);
      if (restFill === hoverFill) failures.push(`${entry.id}: real hover state is absent`);
      const defaultInput = defaultOff.locator('input');
      await defaultInput.focus();
      const focusOutline = await defaultOff.locator('.crs-control__visual').evaluate(element => getComputedStyle(element).outlineColor);
      if (focusOutline !== 'rgb(166, 167, 169)') failures.push(`${entry.id}: real focus-visible ring is absent`);
      const staticFocusRadius = await matrix.locator('[data-state="focus"]').first().locator('.crs-control__visual').evaluate(element => getComputedStyle(element).borderRadius);
      const expectedFocusRadius = entry.id === 'checkbox' ? '8px' : '200px';
      if (staticFocusRadius !== expectedFocusRadius) failures.push(`${entry.id}: focus ring radius is incorrect`);
      const checkedInput = matrix.locator('[data-state="default"] input:checked');
      if (await checkedInput.count() !== 1) failures.push(`${entry.id}: default checked state is absent`);
      if (await matrix.locator('[data-state="disabled"] input:disabled').count() !== 2) failures.push(`${entry.id}: disabled pair is not native`);
      if (await matrix.locator('[data-state="loading"][aria-busy="true"]').count() !== 2) failures.push(`${entry.id}: loading pair misses aria-busy`);
      if (entry.id === 'checkbox') {
        const mixed = matrix.locator('[data-state="indeterminate"] input');
        if (await mixed.count() !== 1 || !(await mixed.evaluate(element => element.indeterminate && element.getAttribute('aria-checked') === 'mixed'))) failures.push('checkbox: native indeterminate state is absent');
      }
      if (entry.id === 'radio-button' && await matrix.locator('input[type="radio"]').count() !== 10) failures.push('radio-button: matrix is not built from native radio inputs');
      if (entry.id === 'switch' && await matrix.locator('input[role="switch"]').count() !== 10) failures.push('switch: native checkbox switch semantics are absent');

      const assets = preview.locator('.crs-control__asset');
      if (await assets.count()) {
        await assets.first().evaluate(asset => asset.decode?.().catch(() => undefined));
        if (!(await assets.evaluateAll(elements => elements.every(element => element.complete && element.naturalWidth === 24 && element.naturalHeight === 24)))) failures.push(`${entry.id}: exported Figma assets failed to load at 24×24`);
      }
      if (['checkbox', 'radio-button'].includes(entry.id)) {
        const vertical = preview.locator('.crs-control-list--vertical');
        const horizontal = preview.locator('.crs-control-list--horizontal');
        const verticalGap = await vertical.evaluate(element => getComputedStyle(element).gap);
        const horizontalGap = await horizontal.evaluate(element => getComputedStyle(element).gap);
        if (verticalGap !== '16px' || horizontalGap !== '24px') failures.push(`${entry.id}: list gaps are not 16/24`);
      }
    }

    if (entry.id === 'avatar' || entry.id === 'entity-logo') {
      const sizeFrame = page.locator('.stacked-example').first().locator('iframe').contentFrame();
      const images = sizeFrame.locator('.crs-avatar-default');
      await images.first().waitFor();
      await images.first().evaluate(image => image.decode?.().catch(() => undefined));
      const actual = await images.evaluateAll(elements => elements.map(element => {
        const rect = element.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          radius: parseFloat(getComputedStyle(element).borderTopLeftRadius),
          loaded: element.complete && element.naturalWidth > 0,
          source: element.getAttribute('src'),
        };
      }));
      const expectedSizes = [100, 68, 56, 48, 40, 36, 32, 24];
      const expectedRadii = entry.id === 'avatar' ? expectedSizes.map(() => 200) : [24, 16, 12, 12, 12, 12, 8, 6];
      if (actual.length !== 8) failures.push(`${entry.id}: default scale does not render eight sizes`);
      actual.forEach((value, index) => {
        if (Math.abs(value.width - expectedSizes[index]) > 0.1 || Math.abs(value.height - expectedSizes[index]) > 0.1) failures.push(`${entry.id}: invalid ${expectedSizes[index]}px geometry`);
        if (Math.abs(value.radius - expectedRadii[index]) > 0.1) failures.push(`${entry.id}: invalid ${expectedSizes[index]}px radius`);
        if (!value.loaded) failures.push(`${entry.id}: default asset failed to load`);
      });
      const expectedAsset = entry.id === 'avatar' ? 'avatar-default-user.svg' : 'avatar-default-company.svg';
      if (!actual.every(value => value.source.endsWith(expectedAsset))) failures.push(`${entry.id}: wrong default asset source`);
    }

    if (entry.id === 'colors' || entry.id === 'iconography') {
      const foundationPreview = page.locator('#preview').contentFrame();
      await foundationPreview.locator('.foundation-preview').waitFor();
      if (entry.id === 'colors' && await foundationPreview.locator('.foundation-swatch').count() !== 41) failures.push('colors: token overview is incomplete');
      if (entry.id === 'iconography' && await foundationPreview.locator('.foundation-icon').count() !== 13) failures.push('iconography: production-confirmed sprite overview is incomplete');
    }

    if (entry.id === 'responsive-layout') {
      const preview = page.locator('#preview').contentFrame();
      for (const width of expectedWidths.slice(0, -1)) {
        await page.locator(`#viewport-controls [data-width="${width}"]`).click();
        await page.waitForTimeout(120);
        const geometry = await preview.locator('.doc-layout-demo').evaluate(element => {
          const main = element.querySelector('.doc-layout-demo__main');
          const sections = [...element.querySelectorAll('.doc-layout-demo__section')];
          const mainRect = main.getBoundingClientRect();
          const mainStyle = getComputedStyle(main);
          const first = sections[0].getBoundingClientRect();
          const second = sections[1].getBoundingClientRect();
          return {
            viewport: document.documentElement.clientWidth,
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            shellHeight: element.getBoundingClientRect().height,
            bodyHeight: document.body.getBoundingClientRect().height,
            container: { x: mainRect.x, width: mainRect.width },
            padding: [parseFloat(mainStyle.paddingLeft), parseFloat(mainStyle.paddingRight)],
            sectionGap: second.top - first.bottom,
          };
        });
        const expectedContainerWidth = Math.min(geometry.viewport, 1124);
        const expectedContainerX = (geometry.viewport - expectedContainerWidth) / 2;
        if (geometry.pageOverflow > 1) failures.push(`responsive-layout: horizontal overflow at ${width}px`);
        if (Math.abs(geometry.container.width - expectedContainerWidth) > 1 || Math.abs(geometry.container.x - expectedContainerX) > 1) {
          failures.push(`responsive-layout: invalid container at ${width}px`);
        }
        if (geometry.padding.some(value => Math.abs(value - 24) > .1)) failures.push(`responsive-layout: gutter is not 24px at ${width}px`);
        if (Math.abs(geometry.sectionGap - 48) > .1) failures.push(`responsive-layout: section gap is not 48px at ${width}px`);
        if (geometry.shellHeight + 1 < geometry.bodyHeight) failures.push(`responsive-layout: shell does not cover the page at ${width}px`);
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
        if (entry.category === 'pages') {
          const preview = page.locator('#preview').contentFrame();
          const pageGeometry = await preview.locator('.app-container').evaluate(element => {
            const container = element.querySelector('.max-w-\\[1124px\\]');
            const containerRect = container?.getBoundingClientRect();
            const containerStyle = container ? getComputedStyle(container) : null;
            return {
              hasContent: Boolean(element.querySelector('.app-content')),
              pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              viewport: document.documentElement.clientWidth,
              container: containerRect ? { x: containerRect.x, width: containerRect.width } : null,
              padding: containerStyle ? [parseFloat(containerStyle.paddingLeft), parseFloat(containerStyle.paddingRight)] : null,
            };
          });
          if (!pageGeometry.hasContent || !pageGeometry.container) failures.push(`${entry.id}: canonical page shell is absent at ${width}px`);
          if (pageGeometry.pageOverflow > 1) failures.push(`${entry.id}: horizontal page overflow at ${width}px`);
          if (pageGeometry.container) {
            const expectedContainerWidth = Math.min(pageGeometry.viewport, 1124);
            const expectedContainerX = (pageGeometry.viewport - expectedContainerWidth) / 2;
            if (Math.abs(pageGeometry.container.width - expectedContainerWidth) > 1 || Math.abs(pageGeometry.container.x - expectedContainerX) > 1) {
              failures.push(`${entry.id}: container geometry differs at ${width}px`);
            }
            if (pageGeometry.padding.some(value => Math.abs(value - 24) > .1)) failures.push(`${entry.id}: container gutter differs at ${width}px`);
          }
        }
      }
      await page.locator('#viewport-controls [data-width="full"]').click();
    }

    if (item.examples.length === 1 && item.examples[0].preview.mode === 'intrinsic') {
      const example = item.examples[0];
      const previewBody = page.locator('#preview').contentFrame().locator('body');
      await previewBody.locator('.example-root').waitFor();
      validateIntrinsicGeometry(entry.id, example, await readIntrinsicGeometry(page.locator('#preview')));
    }

    if (item.previewNotes?.length && !(await page.locator('#preview-notes').isVisible())) failures.push(`${entry.id}: preview notes are hidden`);
  }

  const fontPage = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  for (const example of fontExamples) {
      await fontPage.goto(`${baseUrl}/${example.file}`, { waitUntil: 'networkidle' });
      const audit = await fontPage.evaluate(async () => {
        await document.fonts.ready;
        const semanticMonospace = new Set(['CODE', 'PRE', 'KBD', 'SAMP']);
        const violations = [];
        for (const element of document.body.querySelectorAll('*')) {
          if (semanticMonospace.has(element.tagName)) continue;
          if (![...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) continue;
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const family = getComputedStyle(element).fontFamily;
          if (!family.toLowerCase().includes('inter')) violations.push(`${element.tagName.toLowerCase()}.${element.className || ''}: ${family}`);
        }
        return { loaded: document.fonts.check('16px Inter'), violations: violations.slice(0, 5) };
      });
      if (!audit.loaded) failures.push(`${example.owner}: Inter failed to load`);
      if (audit.violations.length) failures.push(`${example.owner}: non-Inter text: ${audit.violations.join(', ')}`);
  }
  await fontPage.close();

  await page.locator('#guide-search').fill('button');
  if (await page.locator('[data-item]').count() === 0) failures.push('search returned no results');
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
    console.log(`OK: ${entries.length} viewer pages; intrinsic, viewport, notes, search and full-width shell verified`);
  }
} finally {
  await browser.close();
}
