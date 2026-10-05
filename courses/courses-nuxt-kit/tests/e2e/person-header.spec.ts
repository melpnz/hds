import { expect, test } from '@playwright/test'

for (const width of [320, 480, 767, 768, 1024, 1440]) {
  test(`PersonHeader follows production geometry at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.goto('/ui/preview?component=person-header')

    const header = page.locator('.crs-person-header')
    const portrait = page.locator('.crs-person-header__portrait')
    const title = header.locator('h1')
    const mobile = width < 768

    await expect(header).toHaveCSS('flex-direction', mobile ? 'column' : 'row')
    await expect(header).toHaveCSS('align-items', mobile ? 'flex-start' : 'center')
    await expect(header).toHaveCSS('padding', mobile ? '0px' : '24px')
    await expect(header).toHaveCSS('border-top-width', mobile ? '0px' : '1px')
    await expect(header).toHaveCSS('gap', '20px')
    await expect(portrait).toHaveCSS('width', '100px')
    await expect(portrait).toHaveCSS('height', '100px')
    const company = page.locator('.crs-person-header__company')
    await expect(company).toHaveAttribute('width', '40')
    await expect(company).toHaveAttribute('height', '40')
    await expect(company).toHaveCSS('width', '40px')
    await expect(company).toHaveCSS('height', '40px')
    await expect(title).toHaveCSS('font-size', '30px')
    await expect(title).toHaveCSS('line-height', '34px')
    await expect(header.locator('.crs-person-header__actions a')).toHaveCount(3)
    await expect(header.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', '#linkedin')
    await expect(header.getByRole('link', { name: 'Профиль на Хабр Карьере' })).toHaveAttribute('href', '#career')
    await expect(header.getByRole('link', { name: 'Электронная почта' })).toHaveAttribute('href', 'mailto:author@example.com')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  })
}
