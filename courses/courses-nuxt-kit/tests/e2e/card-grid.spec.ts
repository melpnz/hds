import { expect, test } from '@playwright/test'

for (const width of [320, 480, 767, 768, 1023, 1024, 1440]) {
  test(`CardGrid preserves defaults and supports three tablet columns at ${width}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/preview?component=card-grid')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    for (const [id, desktop, tablet, count] of [['default', 4, 2, 4], ['cards', 4, 3, 6], ['three', 3, 3, 3]] as const) {
      const grid = page.locator(`[data-grid="${id}"]`)
      await expect(grid.locator(':scope > .demo-card')).toHaveCount(count)
      const expected = width < 768 ? 1 : width < 1024 ? tablet : desktop
      await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(/\s+/).length)).toBe(expected)
      expect(await grid.evaluate(element => {
        const css = getComputedStyle(element)
        return [css.columnGap, css.rowGap]
      })).toEqual(['12px', '12px'])
      if (width === 768) expect(await grid.evaluate(element => element.getBoundingClientRect().width)).toBe(720)
    }
    await expect(page.locator('[data-grid="empty"] > *')).toHaveCount(0)
    expect(await page.locator('[data-grid="empty"]').evaluate(element => element.getBoundingClientRect().height)).toBe(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
    expect(errors).toEqual([])
    await page.setViewportSize({ width: width < 768 ? 1024 : 480, height: 900 })
    await expect.poll(() => page.locator('[data-grid="cards"]').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(/\s+/).length)).toBe(width < 768 ? 4 : 1)
  })
}
