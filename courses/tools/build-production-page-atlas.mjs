// Production evidence renderer, NOT a component library or UI Kit implementation.
// Input: isolated guest captures made by capture-responsive-pages.mjs.
import { chromium } from 'playwright'
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncPageAnalysisMetadata } from './sync-page-analysis-metadata.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = resolve(root, '../.audits/courses-responsive-2026-10-01')
const destination = resolve(root, 'evidence/production-responsive-2026-10-01')
const source = JSON.parse(await readFile(resolve(root, 'machine/page-analysis/source.json'), 'utf8'))
const assets = new Map()
const failures = []
await mkdir(resolve(destination, 'assets'), { recursive: true })
// Reuse already fetched source bytes after an interrupted build (never touch kit assets).
const cached = await readdir(resolve(destination,'assets'))
const mimeExtensions = { 'text/css': '.css', 'image/svg+xml': '.svg', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/avif': '.avif', 'font/woff2': '.woff2', 'font/woff': '.woff' }

async function asset(address, base, css = false, allowMissingImage = false) {
  if (!address || address.startsWith('data:') || address.startsWith('#')) return address
  const url = new URL(address, base)
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`Unexpected asset protocol: ${url.protocol}`)
  const fragment = url.hash; url.hash = ''
  const key = url.href
  if (!assets.has(key)) assets.set(key, (async () => {
    const hash = createHash('sha256').update(key).digest('hex').slice(0,20)
    const existing = cached.find(name => name.startsWith(hash + '.'))
    if (existing) { const bytes = await readFile(resolve(destination,'assets',existing)); return {name:existing,url:key,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),missingOnSource:existing.endsWith('.missing')} }
    const response = await fetch(key, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) {
      if (!(allowMissingImage || (response.status === 404 && /\.(?:png|jpe?g|webp|avif|gif)$/i.test(url.pathname)))) throw new Error(`${response.status}: ${key}`)
      const name = hash + '.missing'; const bytes = Buffer.alloc(0)
      await writeFile(resolve(destination,'assets',name),bytes)
      return {name,url:key,bytes:0,sha256:createHash('sha256').update(bytes).digest('hex'),missingOnSource:true,status:response.status}
    }
    const mime = response.headers.get('content-type')?.split(';')[0]
    const suffix = mimeExtensions[mime] || (extname(url.pathname).match(/^\.[a-z0-9]{1,5}$/i)?.[0] ?? '.bin')
    const name = createHash('sha256').update(key).digest('hex').slice(0, 20) + suffix
    let bytes = Buffer.from(await response.arrayBuffer())
    if (suffix === '.css') bytes = Buffer.from(await localizeCss(bytes.toString('utf8'), key))
    await writeFile(resolve(destination, 'assets', name), bytes)
    return { name, url: key, mime, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
  })())
  try {
    const saved = await assets.get(key)
    return (css ? '' : '../assets/') + saved.name + fragment
  } catch (error) { failures.push(error.message); throw error }
}

async function localizeCss(text, base) {
  const matches = [...text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)]
  for (const match of matches) {
    const address = match[2]
    if (!address || address.startsWith('data:') || address.startsWith('#')) continue
    text = text.replace(match[0], `url("${await asset(address, base, true)}")`)
  }
  return text
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
// The DOM parser must never execute downloaded application/analytics scripts.
await context.route('**/*', route => route.abort())
const contracts = []
try {
  for (const definition of source.pages) {
    const directory = resolve(destination, definition.id)
    await mkdir(directory, { recursive: true })
    const variants = {}
    const samples = []
    for (const width of source.widths) {
      const capture = JSON.parse(await readFile(resolve(input, definition.id, width + '.json'), 'utf8'))
      if (capture.status !== 200) throw new Error(`Missing successful capture: ${definition.id}/${width}`)
      const shown = node => node.rect.width > 0 && node.rect.height > 0 && node.css.display !== 'none'
      const stack = (capture.topology ?? []).find(n =>
        /(?:^| )gap-(?:12|10)(?: |$)/.test(n.classes) && !n.classes.startsWith('-mx-6')
        && n.rect.width <= Math.min(width, 1124) && n.rect.width >= Math.min(width, 1124) - 49)
      const grids = capture.nodes.filter(n => shown(n) && n.css.display === 'grid'
        && /grid-cols-(?:4|3|2|\[1fr_120px)/.test(n.classes)
        && !n.classes.includes('grid-cols-[28px') && !n.classes.includes('grid-cols-[50px'))
      const unique = [...new Map(grids.map(n => [n.classes, n])).values()]
      const project = n => ({ selector: n.selector, classes: n.classes, rect: n.rect,
        css: Object.fromEntries(['display','position','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom','rowGap','columnGap','gridTemplateColumns','fontSize','lineHeight','fontWeight','borderRadius','overflowX'].map(k => [k,n.css[k]])) })
      samples.push({ width, capturedAt: capture.capturedAt, status: capture.status,
        overflow: capture.document.width - width,
        header: project(capture.nodes.find(n => n.tag === 'header')),
        positionedLayers: capture.nodes.filter(n=>shown(n) && ['fixed','sticky'].includes(n.css.position)).map(project),
        footer: capture.nodes.find(n => n.tag === 'footer') ? project(capture.nodes.find(n => n.tag === 'footer')) : null,
        stack: stack ? { ...project(stack), children: stack.children.filter(shown).map(n => ({ ...project(n), label: n.text })) } : null,
        grids: unique.map(project), headings: capture.headings.filter(shown).map(n => ({ ...project(n), label: n.text })),
        carousels: (capture.carousels ?? []).map(n => ({ ...project(n), params: n.params, activeIndex: n.activeIndex, realIndex: n.realIndex,
          slides: n.slides.map(s => ({ rect: s.rect, classes: s.classes })) })), scrollStates: capture.scrollStates,
        completeness: capture.nodes.length === 700 && !capture.topology ? 'legacy-node-cap; headings-complete' : 'complete-selected-geometry' })
      if (![1440, 768, 393].includes(width)) continue
      if (!capture.topology || !capture.carousels) throw new Error(`Recapture enhanced geometry: ${definition.id}/${width}`)
      const page = await context.newPage()
      const original = await readFile(resolve(input, definition.id, width + '.html'), 'utf8')
      const inert = original.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '').replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, '')
      await page.setContent(inert, { waitUntil: 'domcontentloaded' })
      await page.evaluate(carousels => {
        for (const carousel of carousels) {
          const el = document.querySelector(carousel.selector)
          if (el) el.dataset.referenceCarousel = JSON.stringify({ params: carousel.params, index: carousel.activeIndex })
        }
        document.querySelectorAll('script,noscript,iframe,object,embed,base,link:not([rel="stylesheet"]),meta:not([charset]):not([name="viewport"])').forEach(el => el.remove())
        document.querySelectorAll('[id*="adfox"],[id*="yandex_rtb"],.swiper-notification').forEach(el => el.remove())
        // Floating back-to-top is a transient post-scroll control, not a cold layout node.
        document.querySelectorAll('body *').forEach(el => {
          for (const attr of [...el.attributes]) if (/^on/i.test(attr.name) || ['nonce','integrity','crossorigin','srcset','data-src','data-srcset'].includes(attr.name)) el.removeAttribute(attr.name)
          if (el.tagName === 'IMG') { el.loading = 'eager'; el.removeAttribute('decoding') }
          if (el.tagName === 'FORM') { el.removeAttribute('action'); el.removeAttribute('method') }
          if (el.tagName === 'BUTTON') el.type = 'button'
          if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('javascript:')) el.removeAttribute('href')
        })
      }, capture.carousels)
      const resources = await page.evaluate(() => [...document.querySelectorAll('img[src],use,link[rel="stylesheet"],*[style],style')].flatMap(el => {
        if (el.tagName === 'STYLE') return [{ type:'style',value:el.textContent }]
        if (el.tagName === 'IMG') return [{ type:'src',value:el.getAttribute('src') }]
        if (el.tagName.toLowerCase() === 'use') return [{ type:'use',value:el.getAttribute('xlink:href') || el.getAttribute('href') }]
        if (el.tagName === 'LINK') return [{ type:'href',value:el.getAttribute('href') }]
        return [{type:'inline',value:el.getAttribute('style')}]
      }))
      const replacements = []
      for (const entry of resources) {
        if (['style','inline'].includes(entry.type)) {
          // Inline declarations are stored in HTML, their URLs need the HTML-relative prefix.
          let value = entry.value
          for (const match of [...value.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)]) {
            if (!match[2] || match[2].startsWith('data:') || match[2].startsWith('#')) continue
            value = value.replace(match[0], `url("${await asset(match[2],capture.url)}")`)
          }
          replacements.push({ ...entry, replacement: value })
        } else replacements.push({ ...entry, replacement: await asset(entry.value, capture.url, false,
          entry.type === 'src' && capture.images.some(img => !img.loaded && new URL(img.src,capture.url).href === new URL(entry.value,capture.url).href)) })
      }
      const documentPart = await page.evaluate(replacements => {
        const lookup = new Map(replacements.map(r => [r.type + ':' + r.value, r.replacement]))
        for (const el of document.querySelectorAll('img[src],use,link[rel="stylesheet"],*[style],style')) {
          if (el.tagName === 'STYLE') el.textContent = lookup.get('style:' + el.textContent) ?? el.textContent
          else if (el.tagName === 'IMG') el.setAttribute('src',lookup.get('src:' + el.getAttribute('src')))
          else if (el.tagName.toLowerCase() === 'use') { const old=el.getAttribute('xlink:href') || el.getAttribute('href'); el.removeAttribute('xlink:href'); el.setAttribute('href',lookup.get('use:' + old)) }
          else if (el.tagName === 'LINK') el.setAttribute('href',lookup.get('href:' + el.getAttribute('href')))
          else { const old=el.getAttribute('style');el.setAttribute('style',lookup.get('inline:' + old) ?? old) }
        }
        return { head: document.head.innerHTML, body: document.body.innerHTML }
      }, replacements)
      variants[width === 393 ? 'phone' : width === 768 ? 'tablet' : 'desktop'] = documentPart
      await page.close()
    }
    await writeFile(resolve(directory, 'data.json'), JSON.stringify(variants) + '\n')
    await writeFile(resolve(directory, 'index.html'), `<!doctype html>\n<!-- GENERATED production reference; rebuild with tools/build-production-page-atlas.mjs. Not UI Kit code. -->\n<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'self'"><title>${definition.title} — production reference</title></head><body><script src="../runtime.js" data-reference="data.json"></script></body></html>\n`)
    const boundaries = []
    for (const width of [767,1023]) {
      try {
        const capture = JSON.parse(await readFile(resolve(input,definition.id,width+'.json'),'utf8'))
        boundaries.push({width,status:capture.status,capturedAt:capture.capturedAt,header: capture.nodes.find(n=>n.tag==='header')?.rect,
          grids: capture.nodes.filter(n=>n.rect.height>0 && /(?:^| )grid-cols-4(?: |$)/.test(n.classes)).map(n=>({classes:n.classes,columns:n.css.gridTemplateColumns,gap:n.css.gap})),overflow:capture.document.width-width})
      } catch (error) { if (error.code !== 'ENOENT') throw error }
    }
    const accepted = new Set((source.ownerDecisions || []).filter(d=>['implemented-local','approved-page-composition'].includes(d.status)).map(d=>d.id))
    contracts.push({ ...definition, approvalGaps:definition.approvalGaps.filter(id=>!accepted.has(id)), ownerDecisions:(source.ownerDecisions || []).filter(d=>definition.approvalGaps.includes(d.id) || d.pages?.includes(definition.id)), reference: `evidence/production-responsive-2026-10-01/${definition.id}/index.html`, measurements: samples, boundaryMeasurements:boundaries })
    console.log(`BUILT ${definition.id}: ${samples.length} measurements, 3 responsive DOM families`)
  }
} finally { await browser.close() }
const manifest = []
for (const result of assets.values()) manifest.push(await result)
await writeFile(resolve(destination,'assets/manifest.json'),JSON.stringify({generatedBy:'tools/build-production-page-atlas.mjs',assets:manifest},null,2)+'\n')
await mkdir(resolve(root,'machine/page-analysis/pages'),{recursive:true})
for(const page of contracts) await writeFile(resolve(root,`machine/page-analysis/pages/${page.id}.json`),JSON.stringify(page,null,2)+'\n')
await writeFile(resolve(root,'machine/page-analysis/atlas.json'),JSON.stringify({ schemaVersion:1, generatedBy:'tools/build-production-page-atlas.mjs', authority:'production', scope:'public-guest', evidenceRoot:'evidence/production-responsive-2026-10-01', capturedOn:'2026-10-01', providerChanges:'local approved CardGrid, ordinary/advertising Carousel, responsive PersonHeader, ReviewCard variants, PromoCard actions/states and SiteHeader category context; three optional page compositions remain', ownerDecisions:source.ownerDecisions || [], widths:source.widths, previewWidths:source.previewWidths, rules:source.rules, pages:contracts.map(({measurements,boundaryMeasurements,...page})=>({...page,file:`machine/page-analysis/pages/${page.id}.json`})), limits:source.limits },null,2)+'\n')
const report = ['# Замеры адаптивных страниц Хабр Курсов','',
  'Срез 1 октября 2026 года. Генерируется `tools/build-production-page-atlas.mjs` из гостевых captures. Это evidence, а не API UI Kit. Геометрия в CSS px; координаты относительно верхнего края документа после возврата наверх.', '',
  'Контрольные ширины: '+source.widths.join(', ')+'. Отдельные граничные замеры: 767 и 1023 для шести представителей семейств.', '',
  'Живые локальные эталоны: [атлас страниц](../../viewer/pages.html). Правила: [сборка страниц](../guide/production-pages.md).', '']
report.push('## Решения владельца для новой сборки','',...(source.ownerDecisions || []).map(d=>'- '+d.rule),'')
for (const page of contracts) {
  report.push(`## ${page.title}`,'',`Источник: [production](${page.url}). [Локальный эталон](../../${page.reference}).`, '',
    'Порядок: '+page.sequence.map(s=>'`'+s+'`').join(' → ')+'.','',
    '| Viewport | Header | X контента | Ширина контента | Gap стека | Верх | Низ | Footer | Overflow body |','|---|---|---|---|---|---|---|---|---|')
  for (const m of page.measurements) report.push(`| ${m.width} | ${m.header.rect.height} | ${m.stack?.rect.x ?? '—'} | ${m.stack?.rect.width ?? '—'} | ${m.stack?.css.rowGap ?? '—'} | ${m.stack?.css.paddingTop ?? '—'} | ${m.stack?.css.paddingBottom ?? '—'} | ${m.footer?.rect.height ?? '—'} | ${m.overflow} |`)
  report.push('',...page.notes.map(n=>'- '+n),'', 'Требующие решения варианты: '+page.approvalGaps.map(s=>'`'+s+'`').join(', ')+'.','',
    'Заголовки секций в текущем DOM: '+(page.measurements[0].headings.filter(n=>n.selector.endsWith('h2') || /h2:nth/.test(n.selector)).map(n=>n.label).join('; ') || 'семантических h2 нет; разделы профиля размечены div')+'.','')
}
report.push('## Границы измерений','',...source.limits.map(n=>'- '+n),'',
  'Недоступные при локализации исходные изображения: '+manifest.filter(a=>a.missingOnSource).length+'. В manifest они помечены missingOnSource и не подменяются выдуманными аватарами.','')
await mkdir(resolve(root,'docs/reference'),{recursive:true})
await writeFile(resolve(root,'docs/reference/production-responsive-pages.md'),report.join('\n'))
console.log(`Saved ${contracts.length} page contracts and ${manifest.length} local source assets. Failures: ${failures.length}`)
await syncPageAnalysisMetadata()
