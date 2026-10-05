import { expect, test, type Locator, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const widths = [320, 480, 768, 1024] as const
const geometryMaskPath = fileURLToPath(new URL('./geometry-mask.css', import.meta.url))
type VisualCase = { id: string; target: string; component?: string; path?: string; action?: 'phone' | 'submit' }
const cases: VisualCase[] = [
  { id: 'button', target: '.catalog-demo' },
  { id: 'course-card', target: '.crs-course-card' },
  { id: 'site-header', target: '.crs-site-header' },
  { id: 'catalog-menu', target: '.crs-catalog-menu' },
  { id: 'modal', target: '.crs-modal-content' },
  { id: 'filter-modal', target: '[role="dialog"]' }
]
const extendedCases: VisualCase[] = [
  { id: 'header-dropdown', target: '.crs-header-dropdown__panel' },
  { id: 'price-sheet', target: '.crs-price-sheet' },
  { id: 'promo-code-modal', target: '[role="dialog"]' },
  { id: 'text-input', target: '.catalog-demo' },
  { id: 'filter-chip-switch', component: 'filter-chip', target: '.crs-filter-chip--switch' },
  { id: 'feedback-form', target: '.crs-feedback-form' },
  { id: 'feedback-phone', component: 'feedback-form', target: '.crs-feedback-form', action: 'phone' },
  { id: 'feedback-success', component: 'feedback-form', target: '.crs-feedback-form', action: 'submit' },
  { id: 'school-card', target: '.crs-school-card' },
  { id: 'review-card', target: '.crs-review-card' },
  { id: 'person-card', target: '.crs-person-card' },
  { id: 'checkbox-loading', path: '/ui/diagnostics', target: '.crs-check' },
  { id: 'button-group-loading', path: '/ui/diagnostics', target: '.crs-button-group' },
  { id: 'search-input-error', path: '/ui/diagnostics', target: '.crs-search[aria-invalid="true"]' }
]

async function settlePreview(page: Page, visualCase: VisualCase): Promise<Locator> {
  await page.goto(visualCase.path ?? `/ui/preview?component=${visualCase.component ?? visualCase.id}`)
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
  // Nuxt's development toolbar is not part of the component under review.
  await page.addStyleTag({ content: '#nuxt-devtools-container, nuxt-devtools-inspect-panel { display: none !important; }' })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(Array.from(document.images, image => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => resolve(), { once: true })
    })))
  })
  if (visualCase.action === 'phone') await page.getByRole('button', { name: 'Телефон', exact: true }).click()
  if (visualCase.action === 'submit') await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  const locator = page.locator(visualCase.target).first()
  await expect(locator).toBeVisible()
  if (visualCase.id === 'button-group-loading') await expect(locator.locator('.crs-button-group__loader').first()).toBeVisible()
  if (visualCase.id === 'checkbox-loading') await expect(locator.locator('.crs-check__loader')).toBeVisible()
  if (visualCase.id === 'feedback-success') await expect(locator.locator('.crs-feedback-form__success-icon')).toHaveCSS('width', '112px')
  return locator
}

for (const group of [
  { name: 'Courses UI visual regression', cases },
  { name: 'Courses UI extended visual regression', cases: extendedCases }
]) test.describe(group.name, () => {
  for (const width of widths) {
    for (const visualCase of group.cases) {
      test(`${visualCase.id} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        const target = await settlePreview(page, visualCase)
        await expect(target).toHaveScreenshot(`${visualCase.id}-${width}.png`, {
          animations: 'disabled',
          caret: 'hide',
          maxDiffPixelRatio: 0.05,
          // Preserve a full-color signal while tolerating the subpixel glyph
          // rasterization used by GitHub's Windows runner. Geometry is checked
          // separately below with the strict baseline.
          threshold: 0.35,
          scale: 'css'
        })
        await expect(target).toHaveScreenshot(`${visualCase.id}-${width}-geometry.png`, {
          animations: 'disabled',
          caret: 'hide',
          maxDiffPixelRatio: 0.015,
          scale: 'css',
          stylePath: geometryMaskPath
        })
      })
    }
  }
})
