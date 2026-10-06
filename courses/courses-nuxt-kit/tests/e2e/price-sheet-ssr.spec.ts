import { test, expect } from '@playwright/test'

for (const suffix of ['', '?kind=unknown']) {
  test(`visual fixture has a safe default for ${suffix || 'missing kind'}`, async ({ page }) => {
    const response = await page.goto(`/ui/accessibility-visual-fixtures${suffix}`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('.visual-target').getByText('Python', { exact: true })).toBeVisible()
  })
}

for (const width of [320, 768, 1440]) {
  test(`initially open PriceSheet renders its chevron without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } })
    try {
      const page = await context.newPage()
      const response = await page.goto(`${baseURL}/ui/ssr-fixtures`)
      expect(response?.status()).toBe(200)
      const price = page.getByRole('dialog', { name: 'Цена' })
      await expect(price).toBeVisible()
      await expect(price.getByRole('textbox', { name: 'Цена от' })).toHaveValue('100')
      const chevron = price.locator('.crs-select__chevron')
      await expect(chevron).toBeVisible()
      const size = await chevron.boundingBox()
      expect(size?.width).toBe(20)
      expect(size?.height).toBe(20)
    } finally {
      await context.close()
    }
  })

  test(`PriceSheet hydrates without mismatches and retains controls at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('console', message => { if (/hydration/i.test(message.text())) errors.push(message.text()) })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/ui/ssr-fixtures')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const price = page.getByRole('dialog', { name: 'Цена' })
    await expect(price.getByRole('textbox', { name: 'Цена от' })).toBeFocused()
    await expect(price.locator('.crs-select__chevron')).toHaveCount(1)
    await price.getByRole('button', { name: 'Валюта' }).click()
    const menu = price.getByRole('listbox')
    await expect(menu).toBeVisible()
    await expect.poll(async () => {
      const bounds = await menu.boundingBox()
      const viewport = page.viewportSize()!
      return Boolean(bounds && bounds.y >= 0 && bounds.y + bounds.height <= viewport.height)
    }).toBe(true)
    await price.getByRole('option', { name: '€', exact: true }).click()
    await expect(price.getByRole('button', { name: 'Валюта' })).toHaveText('€')
    await price.getByRole('button', { name: 'Сбросить' }).click()
    await expect(price.getByRole('textbox', { name: 'Цена от' })).toHaveValue('')
    await expect(price.getByRole('textbox', { name: 'Цена до' })).toHaveValue('')
    await price.getByRole('button', { name: 'Готово' }).click()
    await expect(price).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
