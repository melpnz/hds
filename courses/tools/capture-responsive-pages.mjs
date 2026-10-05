import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const output = resolve(root, '.audits/courses-responsive-2026-10-01')
const routes = [
  ['courses-listing', '/courses'],
  ['course-category', '/courses/nejronnye-seti/gpt'],
  ['education-centers-listing', '/education_centers'],
  ['rating', '/education_centers/rating'],
  ['education-center', '/education_centers/36-skillbox'],
  ['reviews', '/education_centers/otzyvy'],
  ['review-detail', '/education_centers/otzyvy/10-netologiya/162-seo-specialist/15229'],
  ['promocodes', '/education/promocodes'],
  ['promocode-detail', '/education/promocodes/35-yandeks-praktikum'],
  ['authors', '/courses/authors'],
  ['editors', '/courses/editors'],
  ['author', '/courses/authors/11-nikolay-shirinkin']
]
const arg = name => process.argv[process.argv.indexOf(name) + 1]
const chosen = process.argv.includes('--page') ? routes.filter(([id]) => arg('--page').split(',').includes(id)) : routes
const widths = process.argv.includes('--width') ? arg('--width').split(',').map(Number) : [1440, 1024, 768, 744, 480, 393, 320]
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU', reducedMotion: 'reduce' })
await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort())

try {
  await mkdir(output, { recursive: true })
  for (const [id, path] of chosen) {
    const directory = resolve(output, id)
    await mkdir(directory, { recursive: true })
    for (const width of widths) {
      const resultPath = resolve(directory, width + '.json')
      if (process.argv.includes('--resume')) {
        try { const result = JSON.parse(await readFile(resultPath, 'utf8')); if (result.status === 200 && result.nodes.length && result.topology && result.carousels) { console.log(`SKIP ${id} ${width}`); continue } } catch {}
      }
      const page = await context.newPage()
      await page.setViewportSize({ width, height: 900 })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      let response
      try {
        response = await page.goto('https://career.habr.com' + path, { waitUntil: 'domcontentloaded', timeout: 45000 })
        await page.evaluate(async () => { await document.fonts.ready })
        await page.waitForTimeout(1200)
        const scrollStates = []
        const readScroll = async state => scrollStates.push(await page.evaluate(state => ({
          state, scrollY, header: [...document.querySelectorAll('header,[class*="sticky"]')].slice(0, 12).map(el => {
            const rect = el.getBoundingClientRect(), css = getComputedStyle(el)
            return { classes: el.getAttribute('class'), y: rect.y, height: rect.height, position: css.position, top: css.top, display: css.display }
          })
        }), state))
        await readScroll('cold-top')
        await page.screenshot({ path: resolve(directory, width + '-cold.png'), animations: 'disabled' })
        // Load guest-page lazy content without opening forms or changing filters.
        let lastHeight = 0
        for (let y = 0; y < Math.min(await page.evaluate(() => document.body.scrollHeight), 50000); y += 800) {
          await page.evaluate(y => window.scrollTo(0, y), y)
          await page.waitForTimeout(50)
          lastHeight = y
          if (y === 800) await readScroll('scroll-800')
        }
        await readScroll('end')
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(400)
        await readScroll('returned-top')
        const capture = await page.evaluate(() => {
          const round = value => Math.round(value * 100) / 100
          const selector = el => {
            const parts = []
            while (el && el !== document.body) {
              const tag = el.tagName.toLowerCase()
              const siblings = [...(el.parentElement?.children ?? [])].filter(s => s.tagName === el.tagName)
              parts.unshift(tag + (siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(el) + 1})` : ''))
              el = el.parentElement
            }
            return 'body > ' + parts.join(' > ')
          }
          const measure = el => {
            const rect = el.getBoundingClientRect(), css = getComputedStyle(el)
            return { selector: selector(el), tag: el.tagName.toLowerCase(), classes: el.getAttribute('class') ?? '',
              text: (el.innerText ?? '').trim().replace(/\s+/g, ' ').slice(0, 140),
              rect: { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) },
              css: Object.fromEntries(['display', 'position', 'top', 'bottom', 'maxWidth', 'minWidth', 'width', 'height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'gap', 'rowGap', 'columnGap', 'gridTemplateColumns', 'gridTemplateRows', 'flexDirection', 'flexWrap', 'alignItems', 'justifyContent', 'overflowX', 'overflowY', 'fontFamily', 'fontSize', 'lineHeight', 'fontWeight', 'color', 'backgroundColor', 'borderRadius'].map(key => [key, css[key]])) }
          }
          const elements = [...document.body.querySelectorAll('*')].filter(el => !['SCRIPT','STYLE','SVG','PATH','USE','META','LINK'].includes(el.tagName))
          const nodes = elements.filter(el => {
            const rect = el.getBoundingClientRect(), css = getComputedStyle(el)
            return ['HEADER', 'MAIN', 'FOOTER', 'SECTION', 'H1', 'H2', 'H3', 'NAV'].includes(el.tagName)
              || css.position === 'sticky' || css.position === 'fixed'
              || (rect.width > innerWidth * .55 && rect.height > 24 && rect.height < 1800)
              || (css.display.includes('grid') && rect.width > 100)
              || (rect.width > 160 && rect.height > 70 && rect.height < 900
                && (parseFloat(css.borderRadius) > 0 || el.classList.contains('swiper-slide')))
          }).map(measure)
          return { title: document.title, url: location.href, viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
            document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
            headings: [...document.querySelectorAll('h1,h2,h3')].map(measure), nodes,
            topology: [...document.querySelectorAll('.app-content > *, .app-content > * > *, section, .gap-12, .gap-10')]
              .filter(el => el.getBoundingClientRect().width > 100 && el.getBoundingClientRect().height > 0)
              .map(el => ({ ...measure(el), children: [...el.children].map(measure) })),
            carousels: [...document.querySelectorAll('.swiper')].map(el => {
              const swiper = el.swiper
              const keys = ['slidesPerView','spaceBetween','centeredSlides','loop','slidesPerGroup','speed','initialSlide','breakpoints','autoplay']
              return { ...measure(el), params: swiper ? Object.fromEntries(keys.map(key => [key, swiper.params[key]])) : null,
                activeIndex: swiper?.activeIndex, realIndex: swiper?.realIndex,
                slides: [...el.querySelectorAll('.swiper-slide')].map(measure),
                children: [...el.children].map(measure) }
            }),
            stylesheets: [...document.styleSheets].map(s => s.href).filter(Boolean),
            inlineStyles: [...document.querySelectorAll('style')].map(s => s.textContent),
            images: [...document.images].map(img => ({ src: img.currentSrc || img.src, alt: img.alt, loaded: img.complete && img.naturalWidth > 0 })),
            mediaQueries: [...document.styleSheets].flatMap(sheet => { try { return [...sheet.cssRules].filter(rule => rule.type === CSSRule.MEDIA_RULE).map(rule => rule.conditionText) } catch { return [] } }) }
        })
        capture.status = response?.status()
        capture.capturedAt = new Date().toISOString()
        capture.errors = errors
        capture.scrollStates = scrollStates
        await writeFile(resultPath, JSON.stringify(capture, null, 2) + '\n')
        const serializable = await page.evaluate(() => {
          const clone = document.documentElement.cloneNode(true)
          const originals = [...document.querySelectorAll('input,textarea,select')]
          ;[...clone.querySelectorAll('input,textarea,select')].forEach((el,i) => {
            const original=originals[i]
            if(el.tagName==='INPUT') {el.setAttribute('value',original.value);if(original.checked)el.setAttribute('checked','');else el.removeAttribute('checked')}
            if(el.tagName==='TEXTAREA')el.textContent=original.value
            if(el.tagName==='SELECT')[...el.options].forEach((option,j)=>option.toggleAttribute('selected',original.options[j].selected))
          })
          return '<!doctype html>'+clone.outerHTML
        })
        await writeFile(resolve(directory, width + '.html'), serializable)
        await page.screenshot({ path: resolve(directory, width + '.png'), animations: 'disabled' })
        if ([1440, 768, 393].includes(width) && !process.argv.includes('--no-full')) await page.screenshot({ path: resolve(directory, width + '-full.jpg'), fullPage: true, type: 'jpeg', quality: 70, animations: 'disabled' })
        console.log(`OK ${id} ${width}: HTTP ${capture.status}, ${capture.nodes.length} nodes, ${capture.headings.length} headings, ${capture.document.height}px, lazy-scroll ${lastHeight}`)
      } catch (error) {
        console.log(`ERROR ${id} ${width}: ${error.message}`)
        await writeFile(resultPath, JSON.stringify({ status: response?.status(), error: error.message, url: page.url() }, null, 2))
        await page.screenshot({ path: resolve(directory, width + '-error.png') }).catch(() => {})
      } finally { await page.close() }
    }
  }
} finally { await browser.close() }
