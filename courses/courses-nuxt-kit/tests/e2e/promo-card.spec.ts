import { expect, test } from '@playwright/test'

for (const width of [320, 480, 767, 768, 1024, 1440]) {
  test(`PromoCard actions and expired state work at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => { document.documentElement.dataset.copiedCode = text } } })
    })
    await page.goto('/ui/preview?component=promo-card')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown } | null)?.__vue_app__))

    const cards = page.locator('.crs-promo')
    const codeCard = cards.nth(0)
    const linkCard = cards.nth(1)
    const expiredCard = cards.nth(2)

    await expect(cards).toHaveCount(3)
    await expect(codeCard.locator('.crs-promo__code-tail')).toBeVisible()
    await expect(codeCard.locator('.crs-promo__code-preview')).toHaveText('R20')
    const buttonBox = (await codeCard.getByRole('button', { name: 'Открыть код', exact: true }).boundingBox())!
    const tailBox = (await codeCard.locator('.crs-promo__code-tail').boundingBox())!
    expect(tailBox.width).toBeCloseTo(44, 1)
    expect(tailBox.x + tailBox.width).toBeCloseTo(buttonBox.x + buttonBox.width - 1, 1)
    expect(buttonBox.height).toBe(40)
    await expect(codeCard.locator('.crs-promo__code-tail')).toHaveCSS('overflow', 'visible')
    await expect(codeCard.locator('.crs-promo__code-tail')).toHaveCSS('border-top-right-radius', '11px')
    await expect(codeCard.locator('.crs-promo__code-button')).toHaveCSS('overflow', 'hidden')
    await codeCard.getByRole('button', { name: 'Открыть код' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('code')).toHaveText('HABR20')
    await dialog.getByRole('link', { name: 'Скопировать и перейти', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-copied-code', 'HABR20')
    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(codeCard.getByRole('button', { name: 'Открыть код' })).toBeVisible()
    await codeCard.getByRole('button', { name: 'Открыть код' }).click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(linkCard.locator('.crs-promo__code-tail')).toHaveCount(0)
    await linkCard.getByRole('button', { name: 'Посмотреть', exact: true }).click()
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('code')).toHaveCount(0)
    await expect(dialog.getByRole('link', { name: 'Перейти на сайт' })).toHaveAttribute('href', '#offer')
    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(expiredCard.locator('.crs-promo__status')).toHaveText(/Завершено/)
    await expect(expiredCard.getByRole('button', { name: 'Посмотреть' })).toBeDisabled()
    await expect(expiredCard.locator('.crs-promo__offer')).toHaveCSS('background-color', 'rgb(241, 241, 241)')
    await expect(expiredCard.locator('.crs-promo__logo')).toHaveCSS('opacity', '0.45')

    if (width < 768) {
      const cardBox = await codeCard.boundingBox()
      expect(cardBox?.width).toBeGreaterThan(250)
      expect(cardBox?.width).toBeLessThanOrEqual(width)
    } else {
      await expect(codeCard).toHaveCSS('width', '260px')
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  })
}

test('production promo pages open the correct code and offer dialogs', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/promocodes')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    await expect(page.locator('.crs-promo--expired')).toHaveCount(2)
    await expect(page.locator('.crs-promo--expired .crs-promo__code-fold')).toHaveAttribute('src', '/courses/promo-code-fold-expired.svg')
    await page.locator('.crs-promo').first().getByRole('button', { name: 'Открыть код', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('code')).toHaveText('HABRCODE')
    await expect(dialog.getByRole('link', { name: 'Скопировать и перейти' })).toHaveAttribute('href', 'https://nadpo.ru/do/')
    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click()
    await page.goto('/ui/pages/promocode-detail')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    await expect(page.locator('.production-page__promo-search-header')).toHaveCSS('background-image', /linear-gradient/)
    await expect(page.locator('.production-page__promo-search-header .crs-site-header')).toHaveCSS('background-image', 'none')
    await expect(page.locator('.production-page__compact-search')).toHaveCSS('background-image', 'none')
    await expect(page.locator('.crs-promo:not(.crs-promo--expired) .crs-promo__code-button')).toHaveCount(2)
    for (const card of await page.locator('.crs-promo:not(.crs-promo--expired)').all()) {
      if (await card.locator('.crs-promo__code-button').count()) {
        await card.getByRole('button', { name: 'Открыть код', exact: true }).click()
        await expect(dialog.locator('code')).toContainText('DEMO')
        await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click()
        continue
      }
      await card.getByRole('button', { name: 'Посмотреть', exact: true }).click()
      await expect(dialog).toContainText('Яндекс Практикум')
      await expect(dialog.locator('code')).toHaveCount(0)
      await expect(dialog.getByRole('link', { name: 'Перейти на сайт' })).toHaveAttribute('href', 'https://practicum.yandex.ru/')
      await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click()
    }
    await expect(page.locator('.crs-promo--expired')).toHaveCount(2)
    for (const expired of await page.locator('.crs-promo--expired').all()) {
      await expect(expired.locator('button')).toBeDisabled()
      await expect(expired.locator('.crs-promo__status')).toContainText('Завершено')
    }
  }
})
