import { expect, test } from '@playwright/test'

for (const width of [320, 480, 768, 1024, 1440]) {
  test(`AdSlot matches centered production carousel geometry at ${width}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'warning' && /Swiper|hydration/i.test(message.text())) errors.push(message.text()) })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/preview?component=ad-slot')
    const carousel = page.locator('.crs-carousel[data-variant="ad-slot"]')
    const track = carousel.locator('.swiper')
    const active = carousel.locator('.swiper-slide-active')
    await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeEnabled()
    await expect(carousel.locator('.crs-carousel__pagination i')).toHaveCount(3)
    for (const control of await carousel.locator('.crs-carousel__control').all()) {
      const button = (await control.boundingBox())!
      const banner = (await track.boundingBox())!
      expect(button.y + button.height / 2).toBeCloseTo(banner.y + banner.height / 2, 1)
    }
    await expect.poll(() => active.evaluate(element => element.getBoundingClientRect().width)).toBeCloseTo(width < 768 ? width - 48 : 568, 0)
    const geometry = await carousel.evaluate(element => {
      const track = element.querySelector('.swiper') as HTMLElement & { swiper: { params: { loop: boolean; centeredSlides: boolean; spaceBetween: number } } }
      const active = element.querySelector('.swiper-slide-active')!.getBoundingClientRect()
      const frame = track.getBoundingClientRect()
      const neighbours = [...element.querySelectorAll('.swiper-slide-prev,.swiper-slide-next')].map(slide => ({
        rect: slide.getBoundingClientRect().toJSON(),
        opacity: getComputedStyle(slide).opacity
      }))
      return { active: active.toJSON(), frame: frame.toJSON(), neighbours, params: track.swiper.params }
    })
    expect(Math.abs((geometry.active.left + geometry.active.width / 2) - (geometry.frame.left + geometry.frame.width / 2))).toBeLessThan(1)
    if (width < 768) {
      expect(geometry.active.width).toBeCloseTo(geometry.frame.width, 0)
      expect(geometry.active.height / geometry.active.width).toBeCloseTo(280 / 272, 2)
      expect(geometry.params.spaceBetween).toBe(0)
    } else {
      expect(geometry.active.width).toBeCloseTo(568, 0)
      expect(geometry.active.height).toBeCloseTo(232, 0)
      expect(geometry.params.spaceBetween).toBe(-26)
      expect(geometry.neighbours).toHaveLength(2)
      for (const neighbour of geometry.neighbours) {
        expect(neighbour.rect.width).toBeCloseTo(568 * .87, 0)
        expect(neighbour.rect.height).toBeCloseTo(232 * .87, 0)
        expect(neighbour.opacity).toBe('0.65')
      }
    }
    expect(geometry.params.loop).toBe(true)
    expect(geometry.params.centeredSlides).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
    expect(errors).toEqual([])
  })
}

test('AdSlot loops, updates pagination and hides redundant navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/ui/preview?component=ad-slot')
  const carousel = page.locator('.crs-carousel[data-variant="ad-slot"]')
  const activeTitle = () => carousel.locator('.swiper-slide-active img').getAttribute('alt')
  const prev = page.getByRole('button', { name: 'Назад', exact: true })
  const next = page.getByRole('button', { name: 'Вперёд', exact: true })
  const waitForTransition = () => expect.poll(() => carousel.locator('.swiper').evaluate((element: HTMLElement & { swiper: { animating: boolean } }) => element.swiper.animating)).toBe(false)
  await expect(prev).toBeEnabled()
  await expect.poll(activeTitle).toBe('Рекламное предложение 1')
  await prev.click()
  await expect.poll(activeTitle).toBe('Рекламное предложение 3')
  await waitForTransition()
  await expect(carousel.locator('.crs-carousel__pagination i').nth(2)).toHaveClass(/current/)
  for (const title of ['Рекламное предложение 1', 'Рекламное предложение 2', 'Рекламное предложение 3', 'Рекламное предложение 1']) {
    await next.click()
    await expect.poll(activeTitle).toBe(title)
    await waitForTransition()
  }
  await page.getByRole('group', { name: 'Количество рекламных баннеров' }).getByRole('button', { name: '1', exact: true }).click()
  await expect(carousel.locator('.swiper-slide')).toHaveCount(1)
  await expect(prev).toHaveCount(0)
  await expect(next).toHaveCount(0)
  await expect(carousel.locator('.crs-carousel__pagination')).toHaveCount(0)
  await page.setViewportSize({ width: 320, height: 700 })
  await expect(prev).toHaveCount(0)
  await expect(next).toHaveCount(0)
})

test('AdSlot advances by one banner on a drag gesture', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 700 })
  await page.goto('/ui/preview?component=ad-slot')
  const carousel = page.locator('.crs-carousel[data-variant="ad-slot"]')
  await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeEnabled()
  const box = (await carousel.locator('.swiper').boundingBox())!
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width - 24, y)
  await page.mouse.down()
  await page.mouse.move(box.x + 24, y, { steps: 8 })
  await page.mouse.up()
  await expect.poll(() => carousel.locator('.swiper-slide-active img').getAttribute('alt')).toBe('Рекламное предложение 2')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
})
