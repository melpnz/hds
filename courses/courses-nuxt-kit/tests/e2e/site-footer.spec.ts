import { expect, test } from '@playwright/test'

const preview = '/ui/preview?component=site-footer'
const expectedHrefs = [
  'https://habr.com/', 'https://qna.habr.com/', 'https://career.habr.com/', '/ui',
  '/ui/pages', '/ui?footer=rating', '/ui?footer=promocodes', '/ui?footer=agreement',
  '/ui?footer=terms', '/ui?footer=sitemap', 'https://example.com/twitter',
  'https://example.com/facebook', 'https://example.com/vk', 'https://example.com/instagram',
  'https://example.com/telegram', 'https://example.com/bot', 'https://company.habr.com/'
]

for (const width of [320, 480, 768, 1024, 1440]) {
  test(`configures all footer links without changing composition at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(preview)
    const footer = page.locator('footer')
    await expect(footer.locator('a')).toHaveCount(17)
    await page.evaluate(() => document.fonts.ready)
    await expect.poll(() => footer.evaluate(element => getComputedStyle(element.firstElementChild!).display)).toBe('grid')
    const before = await footer.evaluate(element => ({
      text: element.textContent,
      height: element.getBoundingClientRect().height,
      columns: getComputedStyle(element.firstElementChild!).gridTemplateColumns,
      labels: Array.from(element.querySelectorAll('a')).map(a => a.textContent || a.getAttribute('aria-label'))
    }))
    await expect(footer.locator('a')).toHaveCount(17)
    await page.evaluate(() => document.fonts.ready)
    expect(await footer.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href')))).toEqual(Array(17).fill('#'))

    await page.goto(`${preview}&variant=configured`)
    await expect(footer.getByRole('link', { name: 'Хабр', exact: true })).toHaveAttribute('href', expectedHrefs[0])
    await page.evaluate(() => document.fonts.ready)
    await expect.poll(() => footer.evaluate(element => getComputedStyle(element.firstElementChild!).display)).toBe('grid')
    expect(await footer.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href')))).toEqual(expectedHrefs)
    const after = await footer.evaluate(element => ({
      text: element.textContent,
      height: element.getBoundingClientRect().height,
      columns: getComputedStyle(element.firstElementChild!).gridTemplateColumns,
      labels: Array.from(element.querySelectorAll('a')).map(a => a.textContent || a.getAttribute('aria-label'))
    }))
    expect(after).toEqual(before)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await footer.getByRole('link', { name: 'Список онлайн-школ', exact: true }).click()
    await expect(page).toHaveURL(/\/ui\/pages$/)
  })
}

test('partial configuration preserves other links and keyboard navigation', async ({ page }) => {
  await page.goto(`${preview}&variant=partial`)
  const links = page.locator('footer a')
  await expect(links).toHaveCount(17)
  await expect(links.nth(4)).toHaveAttribute('href', '/ui/pages')
  const hrefs = await links.evaluateAll(elements => elements.map(a => a.getAttribute('href')))
  expect(hrefs.filter(href => href === '#')).toHaveLength(16)
  await links.first().focus()
  for (let index = 0; index < 17; index++) {
    await expect(links.nth(index)).toBeFocused()
    if (index < 16) await page.keyboard.press('Tab')
  }
  await links.nth(4).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/ui\/pages$/)
})
