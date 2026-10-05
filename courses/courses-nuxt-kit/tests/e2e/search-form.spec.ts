import { expect, test } from '@playwright/test'

for (const width of [320, 480, 767, 768, 1024]) {
  test(`SearchForm follows compound and selected-summary layouts at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 })
    await page.goto('/ui/preview?component=search-form')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown } | null)?.__vue_app__))

    const modules = page.locator('.crs-search-module')
    const regular = modules.nth(0)
    const selected = modules.nth(1)
    const regularFields = regular.locator('.crs-select__trigger')
    const selectedForm = selected.locator('.crs-search-form')
    const summary = selected.locator('.crs-search-form__summary')

    await expect(modules).toHaveCount(2)
    await expect(regularFields).toHaveCount(3)

    if (width < 768) {
      await expect(regular.locator('.crs-search-form')).toBeVisible()
      await expect(selectedForm).toBeHidden()
      await expect(summary).toBeVisible()
      await expect(summary).toContainText('Яндекс Практикум')
      await expect(summary).toContainText('Все темы')
      await expect(summary).toContainText('Все типы')
      await expect(summary).toHaveCSS('padding', '12px 24px')
      await expect(summary).toHaveCSS('font-size', '16px')
      await expect(summary.locator('.crs-search-form__summary-details')).toHaveCSS('font-size', '14px')
      expect((await summary.boundingBox())?.height).toBeCloseTo(64.8, 0)
      expect((await regularFields.first().boundingBox())?.width).toBe((await regularFields.nth(1).boundingBox())?.width)
      expect((await regularFields.first().boundingBox())?.y).toBeLessThan((await regularFields.nth(1).boundingBox())?.y || 0)
    } else {
      await expect(selectedForm).toBeVisible()
      await expect(summary).toBeHidden()
      await expect(selected.locator('.crs-search-form__submit')).toHaveText('Найти промокоды')
      await expect(selected.locator('.crs-select__trigger').first()).toContainText('Яндекс Практикум')
      const first = await selected.locator('.crs-select__trigger').first().boundingBox()
      const second = await selected.locator('.crs-select__trigger').nth(1).boundingBox()
      expect(first?.height).toBe(56)
      expect(second?.x).toBeCloseTo((first?.x || 0) + (first?.width || 0) + 1, 0)
    }
  })
}

test('SearchForm selects values with the shared Select behavior', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 760 })
  await page.goto('/ui/preview?component=search-form')
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown } | null)?.__vue_app__))
  const organization = page.locator('.crs-search-module').first().locator('.crs-select').first()
  await organization.locator('.crs-select__trigger').click()
  await expect(organization.locator('.crs-option-list')).toBeVisible()
  await organization.getByRole('option', { name: 'Нетология' }).click()
  await expect(organization.locator('.crs-select__trigger')).toContainText('Нетология')
})
