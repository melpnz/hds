import { expect, test } from '@playwright/test'

for (const width of [320, 480, 767, 768, 1024, 1440]) {
  test(`ReviewCard variants follow their responsive contracts at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 })
    await page.goto('/ui/preview?component=review-card')

    const compact = page.locator('.crs-review-card--compact')
    const wide = page.locator('.crs-review-card--wide')
    const full = page.locator('.crs-review-card--full')
    const mobile = width < 768

    await expect(page.locator('.crs-review-card')).toHaveCount(3)
    await expect(compact.locator('.crs-review-card__fade')).toHaveCount(1)
    await expect(compact.locator('.crs-review-card__more')).toHaveCount(1)
    await expect(wide.locator('.crs-review-card__fade')).toHaveCount(0)
    await expect(full.locator('.crs-review-card__fade')).toHaveCount(0)
    await expect(full.locator('.crs-review-card__link')).toHaveCount(0)
    await expect(wide.locator('.crs-review-card__link')).toHaveCount(1)

    await expect(full.locator('.crs-review-card__sections p')).toHaveCount(3)
    await expect(full.locator('.crs-review-card__avatar')).toHaveAttribute('src', '/courses/avatar-default-user.svg')
    await expect(compact.locator('.crs-review-card__course-logo img')).toHaveAttribute('width', '20')
    await expect(compact.locator('.crs-review-card__course-logo img')).toHaveAttribute('height', '20')
    await expect(compact.locator('.crs-review-card__course')).toHaveAttribute('href', '#course')
    await expect(compact.locator('.crs-review-card__more')).toHaveAttribute('href', '#review')

    const rating = wide.locator('.crs-review-card__rating')
    const fullRating = full.locator('.crs-review-card__rating')
    await expect(fullRating).toHaveCSS('flex-direction', mobile ? 'row' : 'column')
    const stars = (await fullRating.locator('.crs-rating').boundingBox())!
    const date = (await fullRating.locator('time').boundingBox())!
    if (mobile) {
      expect(date.x - stars.x - stars.width).toBeCloseTo(8, 1)
      expect(date.y + date.height / 2).toBeCloseTo(stars.y + stars.height / 2, 1)
      expect(stars.x).toBeCloseTo((await full.locator('.crs-review-card__avatar').boundingBox())!.x, 1)
    } else {
      expect(date.y).toBeGreaterThanOrEqual(stars.y + stars.height)
      expect(date.x + date.width).toBeCloseTo(stars.x + stars.width, 1)
    }
    await expect(rating).toHaveCSS('grid-column-start', mobile ? '1' : 'auto')
    await expect(wide.locator('.crs-review-card__body')).toHaveCSS('padding-left', mobile ? '0px' : '60px')
    await expect(wide).toHaveCSS('width', `${(await wide.boundingBox())!.width}px`)
    expect((await wide.boundingBox())!.width).toBeLessThanOrEqual(width - 48)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  })
}
