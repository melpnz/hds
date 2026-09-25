import { chromium } from 'playwright'

const guideUrl = process.argv[2] || 'http://127.0.0.1:4173'
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

const browserChannel = process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined)
const browser = await chromium.launch({ ...(browserChannel ? { channel: browserChannel } : {}), headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const failures = []
const runtimeErrors = []
page.on('pageerror', error => runtimeErrors.push(error.message))

try {
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

  await page.goto(`${guideUrl}/viewer/?provider=local#rubrication-bar`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#raw-json')?.textContent.includes('"id": "courses-listing"'))
  if (await page.locator('#preview-source').isVisible()) failures.push('courses-listing: page-pattern exposes a component provider preview')

  failures.push(...runtimeErrors.map(error => `runtime: ${error}`))
  if (failures.length) throw new Error(failures.join('\n'))
  console.log(`OK: ${samples.length} provider previews and the retired RubricationBar alias verified`)
} finally {
  await browser.close()
}
