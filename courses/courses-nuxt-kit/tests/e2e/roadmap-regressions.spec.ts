import { expect, test } from '@playwright/test'

test('seven services use local assets and Payment has the confirmed destination', async ({ page }) => {
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  await page.getByRole('button', { name: 'Все сервисы', exact: true }).click()
  const panel = page.locator('.crs-header-dropdown__panel')
  await expect(panel.locator('.crs-header-dropdown__link')).toHaveCount(7)
  await expect(panel.getByRole('link')).toHaveCount(7)
  await expect(panel.getByRole('link', { name: 'Оплата', exact: true })).toHaveAttribute('href', 'https://payment.habr.com')
  expect(await panel.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0 && img.src.includes('/courses/services/')))).toBe(true)
})

test('embedded menu supports custom destinations, current service and container alignment', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 })
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const container = page.locator('.diagnostics__services-container')
  const trigger = container.getByRole('button', { name: 'Все сервисы Хабра' })
  await trigger.click()
  const panel = container.locator('.crs-header-dropdown__panel')
  expect(Math.abs((await panel.boundingBox())!.x - (await container.boundingBox())!.x)).toBeLessThan(1)
  await expect(trigger).toHaveCSS('opacity', '1')
  await expect(panel.getByRole('link', { name: 'Оплата' })).toHaveAttribute('aria-current', 'page')
  await expect(panel.getByRole('link', { name: 'Оплата' })).toHaveAttribute('href', '/ui?component=header-dropdown')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(panel).toHaveCount(0)
})

test('simple header does not clip the expanded seven-service menu on phones', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 })
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const header = page.locator('.crs-site-header').first()
  await header.getByRole('button', { name: 'Все сервисы Хабра' }).click()
  const panel = header.locator('.crs-header-dropdown__panel')
  await expect(panel.getByRole('link', { name: 'Курсы', exact: true })).toHaveAttribute('aria-current', 'page')
  expect((await panel.boundingBox())!.x).toBeGreaterThanOrEqual(0)
  expect(await panel.getByRole('link', { name: 'Бизнес' }).evaluate(link => {
    const rect = link.getBoundingClientRect()
    return link.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
  })).toBe(true)
})

async function hydrate(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
  await page.evaluate(() => document.fonts.ready)
}

test('dropdown chips forward accessible labels and match icon/chevron colors', async ({ page }) => {
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const controls = page.locator('.diagnostics__chip-controls')
  const trigger = controls.getByRole('button', { name: 'Действия сортировки', exact: true })
  await expect(trigger).toHaveAccessibleName('Действия сортировки')
  for (const name of ['Действия сортировки', 'Недоступная сортировка']) {
    const chip = controls.getByRole('button', { name, exact: true })
    expect(await chip.locator('.crs-filter-chip__chevron').evaluate(el => getComputedStyle(el).color))
      .toEqual(await chip.locator('.crs-filter-chip__icon').evaluate(el => getComputedStyle(el).color))
  }
  await expect(controls.getByRole('button', { name: 'Недоступная сортировка' })).toBeDisabled()
  await trigger.click()
  await expect(page.getByRole('menu', { name: 'Действия', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('chip counts hide zero and expose descriptive names with and without aria-label', async ({ page }) => {
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const controls = page.locator('.diagnostics__chip-controls')
  await expect(controls.getByRole('button', { name: 'Без фильтров', exact: true }).locator('.crs-filter-chip__badge')).toHaveCount(0)
  await expect(controls.getByRole('button', { name: 'Фильтры (выбрано 2)', exact: true })).toHaveAccessibleName('Фильтры (выбрано 2)')
  await expect(controls.getByRole('button', { name: 'Счётчик действий (выбрано 2)', exact: true })).toHaveAccessibleName('Счётчик действий (выбрано 2)')
  await expect(controls.getByRole('button', { name: 'Курсы (найдено 3)', exact: true })).toHaveAccessibleName('Курсы (найдено 3)')
})

test('OptionList fit is opt-in and stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const normal = (await page.locator('.diagnostics__options-default').boundingBox())!
  const fit = (await page.locator('.diagnostics__options-fit').boundingBox())!
  expect(normal.width).toBe(290)
  expect(fit.width).toBeLessThan(normal.width)
  expect(fit.x + fit.width).toBeLessThanOrEqual(320)
})

for (const width of [320, 480, 768, 1024]) {
  test(`header filter events and sort handle geometry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/diagnostics')
    await hydrate(page)
    const controls = page.locator('.diagnostics__filter-controls')
    let filters = controls.getByRole('button', { name: 'Открыть фильтры (выбрано 2)', exact: true })
    await filters.click()
    await expect(controls.getByTestId('filters-opened')).toHaveText('1')
    await controls.getByRole('button', { name: 'Переключить счётчик' }).click()
    filters = controls.getByRole('button', { name: 'Открыть фильтры', exact: true })
    await expect(filters.locator('.crs-filter-chip__badge')).toHaveCount(0)
    await controls.getByRole('button', { name: 'Переключить счётчик' }).click()
    await expect(controls.getByRole('button', { name: 'Открыть фильтры (выбрано 2)', exact: true })).toBeVisible()
    const sort = controls.getByRole('button', { name: 'Сортировка', exact: true })
    await sort.click()
    await expect(controls.getByTestId('sort-opened')).toHaveText('1')
    const sheet = page.getByRole('dialog', { name: 'Сортировка', exact: true })
    const handle = sheet.locator('.crs-sort-sheet__handle')
    if (width < 768) {
      await expect(handle).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      const rect = (await handle.boundingBox())!
      const parent = (await sheet.boundingBox())!
      expect(rect.width).toBe(64)
      expect(rect.height).toBe(4)
      expect(Math.abs(parent.y - rect.y - rect.height - 8)).toBeLessThan(1)
      expect(Math.abs(rect.x + rect.width / 2 - width / 2)).toBeLessThan(1)
      if (width === 320) await page.screenshot({ path: 'test-results/sort-sheet-mobile.png', clip: { x: 0, y: parent.y - 20, width, height: 900 - parent.y + 20 } })
    } else await expect(handle).toBeHidden()
    await sheet.getByRole('option', { name: 'Сначала новые' }).click()
    await expect(sheet).toHaveCount(0)
    await expect(controls.getByTestId('sort-value')).toHaveText('new')
    await expect(sort).toBeFocused()
  })
}

test('dropdown closes outside, on Escape with focus return, and on a service link', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const trigger = page.getByRole('button', { name: 'Все сервисы', exact: true })
  const panel = page.locator('.crs-header-dropdown__panel')
  await expect(panel).toHaveCount(0)
  await trigger.click()
  expect((await panel.boundingBox())!.x).toBeGreaterThanOrEqual(0)
  await page.locator('.diagnostics__icon').click()
  await expect(panel).toHaveCount(0)
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await panel.locator('a').first().evaluate((link: HTMLAnchorElement) => link.href = '#service')
  await panel.locator('a').first().click()
  await expect(panel).toHaveCount(0)
})

test('FAQ padding is clickable, answer is independent, empty icon is full size', async ({ page }) => {
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  const faq = page.locator('.crs-faq-item')
  await faq.locator('summary').click({ position: { x: 8, y: 8 } })
  await expect(faq).toHaveAttribute('open', '')
  await faq.locator('p').click()
  await expect(faq).toHaveAttribute('open', '')
  await expect(page.locator('.crs-empty__icon')).toHaveCSS('width', '48px')
})

for (const kind of ['link', 'button']) {
  test(`internal ${kind} preserves the current document`, async ({ page }) => {
    await page.goto('/ui/diagnostics')
    await hydrate(page)
    await page.evaluate(() => (window as any).__navigationMarker = 'same-document')
    await page.locator(`.diagnostics__${kind}`).click()
    await expect(page).toHaveURL(/component=/)
    expect(await page.evaluate(() => (window as any).__navigationMarker)).toBe('same-document')
  })
}

test('guide loading states block interaction and search exposes its error', async ({ page }) => {
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  await expect(page.locator('.crs-check')).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByRole('checkbox', { name: 'Загрузка выбора' })).toBeDisabled()
  await expect(page.locator('.crs-check__loader')).toHaveCSS('width', '24px')
  const group = page.getByRole('group', { name: 'Загрузка группы' })
  await expect(group).toHaveAttribute('aria-busy', 'true')
  await expect(group.getByRole('button').first()).toBeDisabled()
  await expect(group.locator('.crs-button-group__loader')).toHaveCount(2)
  await expect(page.getByRole('searchbox', { name: 'Поиск с ошибкой' })).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('.crs-search[aria-invalid="true"]')).toHaveCSS('border-color', 'rgb(232, 68, 68)')
})

test('parent control styles are identical before and after hydration', async ({ browser, page, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const serverPage = await context.newPage()
  const url = new URL('/ui/diagnostics', baseURL).href
  await serverPage.goto(url)
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  for (const selector of ['.diagnostics__link', '.diagnostics__button', '.diagnostics__icon']) {
    const read = (element: Element) => {
      const css = getComputedStyle(element)
      return [css.fontSize, css.fontWeight, css.color, css.paddingLeft, css.width, css.height, css.fontFamily]
    }
    expect(await page.locator(selector).evaluate(read)).toEqual(await serverPage.locator(selector).evaluate(read))
  }
  await expect(page.locator('.diagnostics__button')).toHaveCSS('font-size', '18px')
  expect(await page.locator('.diagnostics__button').evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/^"Inter Variable"/)
  await context.close()
})

test('mobile modal is anchored to the viewport in compiled output', async ({ page }) => {
  for (const width of [320, 393]) {
    await page.setViewportSize({ width, height: 851 })
    await page.goto('/ui/preview?component=modal')
    await hydrate(page)
    const modal = page.locator('.crs-modal-content')
    await expect(modal).toBeVisible()
    await expect(modal).toHaveCSS('translate', '0px')
    const rect = (await modal.boundingBox())!
    expect(Math.abs(rect.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(rect.width - width)).toBeLessThanOrEqual(1)
    expect(Math.abs(rect.y + rect.height - 851)).toBeLessThanOrEqual(1)
  }
})

test('icons render locally across client navigation without an external API', async ({ page, baseURL }) => {
  const external: string[] = []
  await page.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== new URL(baseURL!).origin) {
      // Windows antivirus injects this script into Edge independently of the site.
      if (!new URL(route.request().url()).hostname.endsWith('.kaspersky-labs.com')) external.push(route.request().url())
      await route.abort()
    } else await route.continue()
  })
  await page.goto('/ui/diagnostics')
  await hydrate(page)
  await page.locator('.diagnostics__link').click()
  await expect(page).toHaveURL(/component=button/)
  await page.goto('/ui/preview?component=empty-state')
  await hydrate(page)
  expect(await page.locator('.crs-empty__icon').evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
  expect(external).toEqual([])
})
