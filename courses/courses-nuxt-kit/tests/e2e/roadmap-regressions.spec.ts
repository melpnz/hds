import { expect, test } from '@playwright/test'

async function hydrate(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
  await page.evaluate(() => document.fonts.ready)
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
  await expect(page.locator('.crs-search')).toHaveCSS('border-color', 'rgb(232, 68, 68)')
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
