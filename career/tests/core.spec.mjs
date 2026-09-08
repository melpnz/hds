import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test.beforeEach(async ({ page }) => {
  await page.goto('/showcase/components.html');
});

test('Menu: keyboard, disabled item, checkbox, Escape and outside dismiss', async ({ page }) => {
  const trigger = page.locator('[aria-controls="vacancy-actions"]');
  const menu = page.locator('#vacancy-actions');
  await trigger.focus(); await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Редактировать' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitemcheckbox')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menu.locator('[role="menuitemcheckbox"]')).toHaveAttribute('aria-checked', 'false');
  await expect(trigger).toBeFocused();
  await trigger.press('ArrowUp');
  await expect(menu.getByRole('menuitemcheckbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await trigger.click(); await page.locator('#r3-menu h4').click();
  await expect(menu).toBeHidden();
});

test('Popover, tooltip and accordion have actual open/close behavior', async ({ page }) => {
  const trigger = page.locator('[aria-controls="profile-popover"]');
  await trigger.click(); await expect(page.locator('#profile-popover')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  const tooltipTrigger = page.locator('[aria-describedby="salary-tooltip"]');
  await tooltipTrigger.focus(); await expect(page.locator('#salary-tooltip')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('#salary-tooltip')).toBeHidden();
  const accordion = page.locator('[aria-controls="accordion-panel-2"]');
  await accordion.press('Enter'); await expect(page.locator('#accordion-panel-2')).toBeVisible();
  await accordion.press('Space'); await expect(page.locator('#accordion-panel-2')).toBeHidden();
  await expect(page.locator('[aria-controls="accordion-panel-3"]')).toBeDisabled();
});

test('Calendar: full grid, roving focus, date selection, bounds and month navigation', async ({ page }) => {
  const trigger = page.locator('button[aria-controls="demo-calendar"]');
  await trigger.click();
  const grid = page.locator('#demo-calendar [role="grid"]');
  await expect(grid.getByRole('gridcell')).toHaveCount(42);
  await expect(grid.locator('[data-date="2026-09-12"]')).toBeFocused();
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
  await expect(page.locator('#demo-date')).toHaveValue('13.09.2026');
  await expect(trigger).toBeFocused(); await expect(page.locator('#demo-calendar')).toBeHidden();
  await trigger.click(); await page.keyboard.press('PageDown');
  await expect(grid.locator('[data-date="2026-10-13"]')).toBeFocused();
  await page.keyboard.press('PageUp');
  await expect(grid.locator('[data-date="2026-09-06"]')).toBeDisabled();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});

test('TimePicker: selected option, arrows and commit', async ({ page }) => {
  const trigger = page.locator('[aria-controls="demo-time-list"]');
  await trigger.click(); await expect(page.getByRole('option', { name: '14:30', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(trigger).toHaveText('15:00'); await expect(trigger).toBeFocused();
  await expect(page.locator('#demo-time-list')).toBeHidden();
});

test('FileUpload: invalid file, loading, failure, retry and remove', async ({ page }) => {
  const input = page.locator('#r3-upload input[type="file"]');
  const rows = page.locator('#r3-upload .file-upload');
  await input.setInputFiles({ name: 'archive.zip', mimeType: 'application/zip', buffer: Buffer.from('x') });
  await expect(rows.locator('[data-state="error"]')).toContainText('Нужен PDF');
  await page.locator('#upload-outcome').selectOption('error');
  await input.setInputFiles({ name: 'resume.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-demo') });
  const row = rows.locator('.file-upload__item').filter({ hasText: 'resume.pdf' });
  await expect(row).toHaveAttribute('aria-busy', 'true');
  await expect(row).toHaveAttribute('data-state', 'error');
  await page.locator('#upload-outcome').selectOption('success');
  await row.getByRole('button', { name: 'Повторить resume.pdf' }).click();
  await expect(row).toHaveAttribute('data-state', 'success');
  await row.getByRole('button', { name: 'Удалить resume.pdf' }).click(); await expect(row).toHaveCount(0);
});

test('FilterModal: shared draft, apply/cancel, inert background and focus trap', async ({ page }) => {
  const desktop = page.locator('#r4-filter-form-desktop');
  const modal = page.locator('#r4-filter-modal');
  const trigger = page.locator('[data-filter-modal-open]');
  await desktop.locator('[name="specialization"]').fill('Frontend');
  await desktop.locator('[name="salaryFrom"]').fill('200000');
  await trigger.click();
  await expect(modal.locator('[name="salaryFrom"]')).toHaveValue('200000');
  await expect(page.locator('#r3-menu')).toHaveJSProperty('inert', false); // ancestor is inert
  expect(await page.locator('#r3-menu').evaluate(el => !!el.closest('[inert]'))).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect(modal.getByRole('button', { name: 'Показать 1 272' })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(modal.locator('[data-filter-modal-close]')).toBeFocused();
  await modal.locator('[name="specialization"]').fill('Backend');
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  await expect(desktop.locator('[name="specialization"]')).toHaveValue('Frontend');
  await trigger.click(); await modal.locator('[name="specialization"]').fill('Backend');
  await modal.getByRole('button', { name: 'Показать 1 272' }).click();
  await expect(desktop.locator('[name="specialization"]')).toHaveValue('Backend');
  await expect(page.locator('[inert]')).toHaveCount(0);
});

test('PageHeader mobile menu: open and keyboard dismiss', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  // Образец контейнерный: ширину ему задают его собственные кнопки, а не окно.
  // Без этого оболочка остаётся 1100, и бургер скрыт как на десктопе.
  await page.locator('[aria-label="Ширина образца PageHeader"]')
    .getByRole('button', { name: '375', exact: true }).click();
  const trigger = page.locator('[data-page-header-toggle]');
  await trigger.click(); await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape'); await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('PageHeader and PageFooter previews switch at documented widths', async ({ page }) => {
  const headerControls = page.locator('[aria-label="Ширина образца PageHeader"]');
  const footerControls = page.locator('[aria-label="Ширина образца PageFooter"]');
  await headerControls.getByRole('button', { name: '375', exact: true }).click();
  await footerControls.getByRole('button', { name: '375', exact: true }).click();
  await expect(page.locator('#r4-header-preview .career-shell')).toHaveCSS('width', '375px');
  await expect(page.locator('#r4-page-header .page-header__menu-toggle')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('#r4-footer-preview .page-footer__inner')).toHaveCSS('flex-direction', 'column');
  await footerControls.getByRole('button', { name: '1024', exact: true }).click();
  await expect(page.locator('#r4-footer-preview .page-footer__inner')).toHaveCSS('flex-direction', 'row');
});

test('Overlays fit inside their specimen', async ({ page }) => {
  test.setTimeout(90_000);
  // .specimen режет содержимое по overflow:hidden ради скругления, и раскрытый
  // слой, не поместившийся в стенд, молча обрезается. За одну сессию это
  // всплывало трижды: tooltip, ContextMenu и listbox CustomSelect.
  const measure = () => page.evaluate(() => {
    const out = [];
    for (const specimen of document.querySelectorAll('.specimen')) {
      if (getComputedStyle(specimen).overflow === 'visible') continue;
      const box = specimen.getBoundingClientRect();
      for (const el of specimen.querySelectorAll('*')) {
        const style = getComputedStyle(el);
        if (style.position !== 'absolute') continue;   // fixed — модальный слой, он и должен покрывать экран
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (!rect.height) continue;
        const over = Math.max(rect.bottom - box.bottom, box.top - rect.top, rect.right - box.right, box.left - rect.left);
        if (over > 2) {
          const head = specimen.querySelector('h4');
          out.push(`${head ? head.textContent.trim() : specimen.id}: ${(el.className || el.tagName).toString().split(' ')[0]} на ${Math.round(over)}px`);
        }
      }
    }
    return out;
  });

  const clipped = new Set(await measure());

  // Tooltip раскрывается наведением и фокусом, а не кликом, и закрывается,
  // как только указатель уходит на следующий триггер. Поэтому замер идёт
  // внутри цикла: на замере в конце проверка один раз уже промолчала.
  // Этот проход идёт ПЕРВЫМ: раскрытые кликом меню перекрывают триггер тултипа,
  // и наведение на него молча не срабатывает.
  const probes = await page.evaluate(() => [...document.querySelectorAll('.specimen [aria-describedby]')]
    .filter(el => document.getElementById(el.getAttribute('aria-describedby'))?.getAttribute('role') === 'tooltip')
    .map((el, i) => { el.dataset.overlayProbe = String(i); return i; }));
  for (const i of probes) {
    const trigger = page.locator(`[data-overlay-probe="${i}"]`);
    await trigger.scrollIntoViewIfNeeded().catch(() => {});
    await trigger.hover({ timeout: 1000 }).catch(() => {});
    await page.waitForTimeout(80);
    (await measure()).forEach(x => clipped.add(x));
  }


  const triggers = page.locator('.specimen [aria-expanded="false"], .specimen [aria-haspopup]');
  for (let i = 0; i < await triggers.count(); i += 1) {
    const trigger = triggers.nth(i);
    if (!await trigger.isVisible().catch(() => false)) continue;
    await trigger.scrollIntoViewIfNeeded().catch(() => {});
    await trigger.click({ timeout: 2000 }).catch(() => {});
  }
  (await measure()).forEach(x => clipped.add(x));

  expect([...clipped]).toEqual([]);
});

test('Executable rule predicates hold', async ({ page }) => {
  // Часть правил композиции проверяется машинно: предикаты лежат
  // в machine/rules.overrides.json и попадают в machine/rules.json при сборке.
  // Правило без предиката остаётся manual — и это честно, а не пробел теста.
  const rules = JSON.parse(fs.readFileSync('machine/rules.json', 'utf8'))
    .filter(rule => rule.predicate?.type === 'computed');
  expect(rules.length).toBeGreaterThan(0);

  await page.setViewportSize({ width: 1500, height: 1000 });
  const failures = [];
  for (const rule of rules) {
    await page.goto('/' + rule.predicate.page);
    await page.waitForTimeout(300);
    const results = await page.evaluate(checks => checks.map(check => {
      const el = document.querySelector(check.selector);
      return { ...check, actual: el ? getComputedStyle(el)[check.property] : null };
    }), rule.predicate.checks);
    for (const r of results) {
      if (r.actual !== r.equals) {
        failures.push(`${rule.id}: ${r.selector} ${r.property} = ${r.actual}, ожидалось ${r.equals}`);
      }
    }
  }
  expect(failures).toEqual([]);
});

test('VacancyCard: data variants and presentational saved state', async ({ page }) => {
  const cards = page.locator('#c-vacancy-prod .vacancy-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toHaveAttribute('data-variant', 'salary-known');
  await expect(cards.nth(1)).toHaveAttribute('data-variant', 'salary-unknown compact-metadata');
  await expect(cards.nth(1)).toContainText('Зарплата не указана');
  const save = cards.nth(0).locator('[data-vacancy-save]');
  await expect(save).toHaveAttribute('aria-pressed', 'false');
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(save).toHaveAttribute('aria-label', 'Убрать вакансию из избранного');
  await cards.nth(0).locator('[data-vacancy-action]').click();
  await expect(cards.nth(0)).toContainText('Откликнуться');
});

test('VacancyCard: listing composition switches at the documented container width', async ({ page }) => {
  await page.goto('/showcase/pages.html');
  const controls = page.locator('.vp-bar[data-for="vp-listing"]');
  const frame = page.locator('#vp-listing .career-shell');
  const card = frame.locator('.vacancy-card').first();
  await controls.getByRole('button', { name: '320' }).click();
  await expect(card.locator('.vacancy-card__main')).toHaveCSS('display', 'block');
  expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await card.screenshot({ path: 'evidence/verification/vacancy-card-320.png' });
  await controls.getByRole('button', { name: '1100' }).click();
  await expect(card.locator('.vacancy-card__main')).toHaveCSS('display', 'flex');
  await card.screenshot({ path: 'evidence/verification/vacancy-card-1100.png' });
});

test('Direct file preview renders inline SVG icons', async ({ page }) => {
  await page.goto('file:///D:/work/guides/career/showcase/components.html');
  const icon = page.locator('#f-icons-sprite .icon-inline').first();
  await expect(icon).toBeVisible();
  await expect(icon).toHaveJSProperty('clientWidth', 24);
});

test('Notification attention keeps the danger icon outline unfilled', async ({ page }) => {
  const outline = page.locator('.notification--attention .notification__icon path').first();
  await expect(outline).toHaveAttribute('fill', 'none');
  await expect(outline).toHaveCSS('fill', 'none');
});

test('MultiSelect keeps its border on the outer tagged-field wrapper', async ({ page }) => {
  const picker = page.locator('#fo-multi .multi-select').first();
  await expect(picker.locator('.text-input--with-tags')).toHaveCSS('box-shadow', 'none');
  await expect(picker.locator('.suggestions-picker__wrapper--with-tags')).toHaveCSS('border-top-width', '1px');
  const invalid = page.locator('#fo-multi .multi-select.is-invalid');
  await expect(invalid.locator('.text-input--with-tags')).toHaveCSS('box-shadow', 'none');
  await expect(invalid.locator('.suggestions-picker__wrapper--with-tags')).toHaveCSS('border-top-color', 'rgb(248, 101, 27)');
});

for (const width of [375, 768, 1024, 1440]) {
  test(`Responsive ${width}: R3/R4 geometry, assets and snapshots`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const failedResponses = []; page.on('response', response => { if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:4178/')) failedResponses.push(response.url()); });
    await page.reload(); await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(img => {
        img.loading = 'eager';
        return img.decode().catch(() => {});
      }));
    });
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    fs.mkdirSync('evidence/verification', { recursive: true });
    for (const id of ['r3-menu', 'r3-calendar', 'r3-upload', 'r3-accordion', 'r4-page-header', 'r4-filters']) {
      const section = page.locator('#' + id);
      if (!await section.count()) continue;
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: `evidence/verification/${id}-${width}.png` });
    }
    await page.locator('button[aria-controls="demo-calendar"]').click();
    const calendar = page.locator('#demo-calendar');
    const rect = await calendar.boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0); expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    await calendar.screenshot({ path: `evidence/verification/calendar-open-${width}.png` });
    await page.keyboard.press('Escape');
    await page.locator('[data-filter-modal-open]').click();
    const closeIcon = page.locator('[data-filter-modal-close] .icon-inline');
    await expect(closeIcon).toBeVisible();
    expect(await closeIcon.evaluate(el => el.querySelector('path') !== null)).toBe(true);
    await page.locator('#r4-filter-modal').screenshot({ path: `evidence/verification/filter-modal-open-${width}.png` });
    expect(failedResponses).toEqual([]);
  });
}
