import { expect, test, type Locator, type Page } from '@playwright/test'

const widths = [320, 480, 768, 1024] as const
const cases = [
  { id: 'button', target: '.catalog-demo' },
  { id: 'course-card', target: '.crs-course-card' },
  { id: 'site-header', target: '.crs-site-header' },
  { id: 'catalog-menu', target: '.crs-catalog-menu' },
  { id: 'modal', target: '.crs-modal-content' },
  { id: 'filter-modal', target: '[role="dialog"]' }
] as const

async function settlePreview(page: Page, target: string): Promise<Locator> {
  await page.goto(`/ui/preview?component=${target}`)
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(Array.from(document.images, image => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => resolve(), { once: true })
    })))
  })
  const locator = page.locator(cases.find(item => item.id === target)!.target).first()
  await expect(locator).toBeVisible()
  return locator
}

test.describe('Courses UI visual regression', () => {
  for (const width of widths) {
    for (const visualCase of cases) {
      test(`${visualCase.id} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        const target = await settlePreview(page, visualCase.id)
        await expect(target).toHaveScreenshot(`${visualCase.id}-${width}.png`, {
          animations: 'disabled',
          caret: 'hide',
          maxDiffPixelRatio: 0.005,
          // Keep geometry and color comparisons strict while tolerating the
          // subpixel glyph rasterization used by GitHub's Windows runner.
          threshold: 0.35,
          scale: 'css'
        })
      })
    }
  }
})
