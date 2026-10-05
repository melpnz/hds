import { chromium } from 'playwright'

const guideUrl = process.argv[2] || 'http://127.0.0.1:4181'
const samples = [
  'button',
  'select',
  'pagination',
  'entity-logo',
  'course-card',
  'toast',
  'carousel',
  'site-header',
  'modal'
]
const productionPages = [
  'courses-listing', 'course-category', 'education-centers-listing', 'rating',
  'education-center', 'reviews', 'review-detail', 'promocodes', 'promocode-detail',
  'authors', 'editors', 'author'
]

const browserChannel = process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined)
const browser = await chromium.launch({ ...(browserChannel ? { channel: browserChannel } : {}), headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const failures = []
const runtimeErrors = []
page.on('pageerror', error => runtimeErrors.push(error.message))

try {
  for (const width of [393, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${guideUrl}/viewer/`, { waitUntil: 'domcontentloaded' })
    await page.locator('#ui-kit-link').click()
    await page.waitForURL('**/ui')
    const back = page.locator('.catalog-guide-link')
    if (!await back.isVisible()) failures.push(`cross-links ${width}: guide link is hidden`)
    await back.click()
    await page.waitForURL(`${guideUrl}/viewer/`)
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  for (const id of samples) {
    await page.goto(`${guideUrl}/viewer/?provider=local#${id}`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(expected => document.querySelector('#raw-json')?.textContent.includes(`"id": "${expected}"`), id)
    const switcher = page.locator('#preview-source')
    await switcher.waitFor()
    if (!await switcher.isVisible()) {
      failures.push(`${id}: provider preview switch is hidden`)
      continue
    }
    if (await switcher.locator('[data-preview-source="provider"]').getAttribute('aria-pressed') !== 'true') {
      failures.push(`${id}: integrated mode did not select provider preview`)
      continue
    }
    const frame = page.locator('#preview')
    try {
      await frame.contentFrame().locator('.catalog-demo').waitFor({ timeout: 15_000 })
    } catch {
      failures.push(`${id}: provider preview did not render`)
      continue
    }
    const source = await frame.getAttribute('src')
    if (!source?.includes(`/ui/preview?component=${id}`)) failures.push(`${id}: wrong provider preview ${source}`)
    if (await frame.contentFrame().locator('.catalog-demo').count() !== 1) failures.push(`${id}: provider preview did not render once`)
  }

  for (const id of productionPages) {
    await page.goto(`${guideUrl}/viewer/#production-${id}`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(expected => document.querySelector('#raw-json')?.textContent.includes(`"id": "production-${expected}"`), id)
    const tabs = page.locator('#example-tabs [data-example]')
    if (await tabs.count() !== 2) {
      failures.push(`${id}: component/reference preview tabs are absent`)
      continue
    }
    if ((await tabs.first().textContent())?.trim() !== 'Сборка из UI Kit') failures.push(`${id}: UI Kit composition is not the primary preview`)
    const frame = page.locator('#preview')
    try {
      await frame.contentFrame().locator(`[data-production-page="${id}"]`).waitFor({ timeout: 15_000 })
    } catch {
      failures.push(`${id}: component page preview did not render`)
      continue
    }
    const source = await frame.getAttribute('src')
    if (!source?.includes(`/ui/pages/${id}`)) failures.push(`${id}: wrong component page preview ${source}`)
  }

  await page.goto(`${guideUrl}/viewer/?provider=local#rubrication-bar`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#raw-json')?.textContent.includes('"id": "production-courses-listing"'))
  if ((await page.locator('#item-title').textContent()) !== 'Каталог курсов') failures.push('rubrication-bar: legacy URL does not resolve to the production Courses page')

  failures.push(...runtimeErrors.map(error => `runtime: ${error}`))
  if (failures.length) throw new Error(failures.join('\n'))
  console.log(`OK: ${samples.length} provider previews, ${productionPages.length} component pages and the production RubricationBar alias verified`)
} finally {
  await browser.close()
}
