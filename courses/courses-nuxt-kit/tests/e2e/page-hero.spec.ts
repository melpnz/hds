import { expect, test } from '@playwright/test'

const preview = '/ui/preview?component=page-hero'

for (const width of [320, 480, 744, 768, 1024]) {
  test(`composes the production search hero at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(preview)

    const hero = page.locator('.crs-hero')
    const container = hero.locator('.crs-hero__inner')
    const title = hero.locator('h1')
    const switcher = hero.locator('.crs-hero__switcher')
    const search = hero.locator('.crs-hero__search')
    const form = hero.locator('.crs-search-form')
    const fields = hero.locator('.crs-search-form__field')

    await expect(hero).toHaveClass(/crs-hero--search/)
    await expect(fields).toHaveCount(3)

    const geometry = await Promise.all([container, title, switcher, search, form].map(async locator => {
      const box = await locator.boundingBox()
      if (!box) throw new Error('Expected visible hero element')
      return box
    }))
    const [containerBox, titleBox, switcherBox, searchBox, formBox] = geometry

    const titlePaddingTop = await title.evaluate(element => Number.parseFloat(getComputedStyle(element).paddingTop))
    const searchPadding = await search.evaluate(element => {
      const style = getComputedStyle(element)
      return { top: Number.parseFloat(style.paddingTop), bottom: Number.parseFloat(style.paddingBottom) }
    })
    const containerPadding = await container.evaluate(element => {
      const style = getComputedStyle(element)
      return Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight)
    })
    const contentWidth = containerBox.width - containerPadding
    expect(Math.round(titleBox.y - containerBox.y)).toBe(0)
    expect(Math.round(titlePaddingTop)).toBe(width < 768 ? 40 : 64)
    expect(Math.round(switcherBox.y - (titleBox.y + titleBox.height))).toBe(24)
    expect(Math.round(searchBox.y - (switcherBox.y + switcherBox.height))).toBe(0)
    expect(Math.round(searchPadding.top)).toBe(width < 768 ? 24 : 32)
    expect(Math.round(searchPadding.bottom)).toBe(width < 768 ? 24 : 40)
    expect(Math.round(containerBox.y + containerBox.height - searchBox.y - searchBox.height)).toBe(0)

    const fieldBoxes = await fields.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, height: box.height }
    }))
    if (width < 768) {
      expect(fieldBoxes[1].y).toBeGreaterThan(fieldBoxes[0].y)
      if (width < 480) expect(Math.round(switcherBox.width)).toBe(Math.round(contentWidth))
      else expect(switcherBox.width).toBeLessThan(contentWidth)
    } else {
      expect(fieldBoxes[1].y).toBe(fieldBoxes[0].y)
      expect(Math.round(searchBox.width)).toBe(Math.round(contentWidth))
    }
    expect(Math.round(containerBox.height)).toBe(width === 320 ? 496 : width < 768 ? 462 : 352)
  })
}
