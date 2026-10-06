import { expect, test } from '@playwright/test'

const preview = '/ui/preview?component=site-footer'
const expectedHrefs = [
  'https://habr.com/', 'https://qna.habr.com/', 'https://career.habr.com/', '/ui',
  '/ui/pages', '/ui?footer=rating', '/ui?footer=promocodes', '/ui?footer=agreement',
  '/ui?footer=terms', '/ui?footer=sitemap', 'https://example.com/twitter',
  'https://example.com/facebook', 'https://example.com/vk', 'https://example.com/instagram',
  'https://example.com/telegram', 'https://example.com/bot', 'https://company.habr.com/'
]

// The six social icons can fit the viewport but still overlap the middle column.
// Cover both CSS breakpoints and the intrinsic single-row fit boundary (~632px).
for (const width of [320, 479, 480, 520, 600, 631, 632, 633, 640, 767, 768, 1023, 1024, 1440]) {
  test(`footer links stay in their columns without overlap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${preview}&variant=configured`)
    const footer = page.locator('footer')
    await expect(footer.locator('a')).toHaveCount(17)
    await page.evaluate(() => document.fonts.ready)
    await expect.poll(() => footer.evaluate(element => getComputedStyle(element.firstElementChild!).display)).toBe('grid')
    const geometry = await footer.evaluate(element => {
      const end = element.querySelector('.crs-footer__end')!.getBoundingClientRect()
      const links = Array.from(element.querySelectorAll('a')).map(link => ({
        label: link.textContent || link.getAttribute('aria-label'),
        rect: link.getBoundingClientRect()
      }))
      const collisions: string[] = []
      for (let index = 0; index < links.length; index++) {
        for (const other of links.slice(index + 1)) {
          const current = links[index]!
          if (Math.min(current.rect.right, other.rect.right) - Math.max(current.rect.left, other.rect.left) > 0.5 &&
              Math.min(current.rect.bottom, other.rect.bottom) - Math.max(current.rect.top, other.rect.top) > 0.5) {
            collisions.push(`${current.label} / ${other.label}`)
          }
        }
      }
      const socialLinks = Array.from(element.querySelectorAll('.crs-footer__socials a'))
      const escapedSocials = socialLinks.filter(link => {
        const rect = link.getBoundingClientRect()
        return rect.left < end.left - 0.5 || rect.right > end.right + 0.5
      }).map(link => link.getAttribute('aria-label'))
      const socialSizes = socialLinks.map(link => {
        const rect = link.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
      })
      return { collisions, escapedSocials, socialSizes }
    })
    expect(geometry.collisions).toEqual([])
    expect(geometry.escapedSocials).toEqual([])
    expect(geometry.socialSizes).toEqual(Array(6).fill({ width: 24, height: 24 }))
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if ([320, 480, 600, 640, 768, 1024, 1440].includes(width)) {
      await expect(footer).toHaveScreenshot(`site-footer-${width}.png`, { animations: 'disabled' })
    }
  })
}

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
