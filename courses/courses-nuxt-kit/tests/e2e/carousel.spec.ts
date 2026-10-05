import { expect, test, type Page } from '@playwright/test'

async function firstVisible(page: Page) {
  return page.locator('.crs-carousel').evaluate(element => {
    const engine = (element.querySelector('.swiper') as HTMLElement & { swiper?: { animating: boolean; destroyed: boolean } })?.swiper
    if (!engine || engine.animating || engine.destroyed) return undefined
    const edge = element.querySelector('.crs-carousel__track')!.getBoundingClientRect()
    return [...element.querySelectorAll('.crs-carousel__item')].find(slide => {
      const rect = slide.getBoundingClientRect()
      return Math.abs(rect.left - edge.left) <= 2
    })?.textContent?.match(/Курс \d+/)?.[0]
  })
}

for (const width of [320, 480, 767, 768, 1023, 1024, 1440]) {
  test(`ordinary Carousel loops in both directions at ${width}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', m => { if (m.type() === 'warning' && /Swiper|hydration/i.test(m.text())) errors.push(m.text()) })
    await page.setViewportSize({ width, height: 1100 })
    await page.goto('/ui/preview?component=carousel')
    await expect.poll(() => firstVisible(page)).toBe('Курс 1')
    const prev = page.getByRole('button', { name: 'Назад', exact: true })
    const next = page.getByRole('button', { name: 'Вперёд', exact: true })
    await expect(prev).toBeEnabled()
    for (const control of [prev, next]) {
      const button = (await control.boundingBox())!
      const track = (await page.locator('.crs-carousel__track').boundingBox())!
      expect(button.y + button.height / 2).toBeCloseTo(track.y + track.height / 2, 1)
    }
    for (let i = 0; i < 9; i++) {
      await next.click()
      await expect.poll(() => firstVisible(page)).toBe(`Курс ${(i + 1) % 8 + 1}`)
    }
    for (let i = 0; i < 10; i++) {
      await prev.click()
      await expect.poll(() => firstVisible(page)).toBe(`Курс ${((1 - i - 1) % 8 + 8) % 8 + 1}`)
    }
    expect(await page.locator('.crs-carousel__item').count()).toBe(8)
    const geometry = await page.locator('.crs-carousel').evaluate(el => {
      const rects = [...el.querySelectorAll('.crs-carousel__item')].map(s => s.getBoundingClientRect()).sort((a,b)=>a.left-b.left)
      return { gap: rects[1].left - rects[0].right, overflow: document.documentElement.scrollWidth - innerWidth }
    })
    expect(geometry.gap).toBeCloseTo(12, 1)
    expect(geometry.overflow).toBe(0)
    await page.setViewportSize({ width: width < 768 ? 1024 : 480, height: 1100 })
    await expect.poll(() => firstVisible(page)).toBe('Курс 8')
    await next.click()
    await expect.poll(() => firstVisible(page)).toBe('Курс 1')
    expect(errors).toEqual([])
  })
}

test('finite mode, empty/single/full tracks and slot updates', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1100 })
  await page.goto('/ui/preview?component=carousel')
  const prev = page.getByRole('button', { name: 'Назад', exact: true })
  const next = page.getByRole('button', { name: 'Вперёд', exact: true })
  await expect(prev).toBeEnabled()
  for (const count of ['0', '1', '4']) {
    await page.getByRole('group', { name: 'Количество карточек' }).getByRole('button', { name: count, exact: true }).click()
    await expect(page.locator('.crs-carousel__item')).toHaveCount(Number(count))
    await expect(prev).toHaveCount(0)
    await expect(next).toHaveCount(0)
  }
  await page.setViewportSize({ width: 768, height: 1100 })
  await expect(next).toBeVisible()
  await page.setViewportSize({ width: 1024, height: 1100 })
  await expect(next).toHaveCount(0)
  await page.getByRole('group', { name: 'Количество карточек' }).getByRole('button', { name: '8', exact: true }).click()
  await expect(next).toBeVisible()
  await expect(next).toBeEnabled()
  await page.getByRole('switch', { name: 'Зацикливание' }).click()
  await expect(prev).toBeDisabled()
  for (let i=0; i<4; i++) { await next.click(); await expect.poll(()=>firstVisible(page)).toBe(`Курс ${i+2}`) }
  await expect(next).toBeDisabled()
  await page.getByRole('switch', { name: 'Зацикливание' }).click()
  await expect.poll(() => page.locator('.crs-carousel').evaluate(element =>
    (element.querySelector('.swiper') as HTMLElement & { swiper?: { params: { loop: boolean } } })?.swiper?.params.loop
  )).toBe(true)
  await expect(next).toBeEnabled()
  await expect.poll(()=>firstVisible(page)).toBe('Курс 5')
  await page.locator('.crs-carousel').focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(()=>firstVisible(page)).toBe('Курс 6')
})

test('article carousel uses three/two/one fluid cards with 12px gaps', async ({ page }) => {
  await page.goto('/ui/preview?component=carousel')
  await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeEnabled()
  await page.getByRole('group', { name: 'Карточки карусели' }).getByRole('button', { name: 'Статьи', exact: true }).click()
  await expect.poll(()=>page.locator('.crs-carousel__item').evaluateAll(items=>items.filter(item=>!(item as HTMLElement).inert).length)).toBe(3)
  for (const [width, count] of [[320,1],[480,1],[768,2],[1024,3],[1440,3]]) {
    await page.setViewportSize({width, height:1100})
    await expect.poll(()=>page.locator('.crs-carousel').evaluate(el=>{
      const track=el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
      return [...el.querySelectorAll('.crs-article-card')].filter(card=>{const r=card.getBoundingClientRect();return r.left>=track.left-1&&r.right<=track.right+1}).length
    })).toBe(count)
    await expect.poll(() => page.locator('.crs-carousel').evaluate((el, columns) => {
      const track = el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
      const card = el.querySelector('.crs-article-card')!.getBoundingClientRect()
      return Math.abs(card.width - (track.width - 2 - 12 * (columns - 1)) / columns)
    }, count)).toBeLessThan(1)
    const geometry = await page.locator('.crs-carousel').evaluate(el => {
      const track = el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
      const cards = [...el.querySelectorAll('.crs-article-card')].map(card => card.getBoundingClientRect()).sort((a,b) => a.left - b.left)
      const visible = cards.filter(card => card.left >= track.left - 1 && card.right <= track.right + 1)
      return { width: visible[0]!.width, trackWidth: track.width - 2, gap: visible[1] ? visible[1].left - visible[0]!.right : null }
    })
    expect(geometry.width).toBeCloseTo((geometry.trackWidth - 12 * (count - 1)) / count, 0)
    if (geometry.gap !== null) expect(geometry.gap).toBeCloseTo(12, 0)
    const track = (await page.locator('.crs-carousel__track').boundingBox())!
    for (const control of await page.locator('.crs-carousel__control').all()) {
      const button = (await control.boundingBox())!
      expect(button.y + button.height / 2).toBeCloseTo(track.y + track.height / 2, 1)
    }
  }
  await expect(page.getByRole('button',{name:'Назад',exact:true})).toBeEnabled()
})

test('review carousel fills three/two/one columns with 12px gaps', async ({ page }) => {
  for (const [width, count] of [[320,1],[480,1],[768,2],[1024,3],[1440,3]]) {
    await page.setViewportSize({width, height:1100})
    await page.goto('/ui/pages/courses-listing')
    const carousel = page.locator('.crs-carousel[data-variant="review-card"]')
    await expect(carousel.locator('.crs-carousel__track')).toHaveClass(/swiper-initialized/)
    await expect.poll(() => carousel.locator('.crs-carousel__item').first().evaluate(item => getComputedStyle(item).marginRight)).toBe('12px')
    const track = (await carousel.locator('.crs-carousel__track').boundingBox())!
    for (const control of await carousel.locator('.crs-carousel__control').all()) {
      const button = (await control.boundingBox())!
      expect(button.y + button.height / 2).toBeCloseTo(track.y + track.height / 2, 1)
    }
    const geometry = await carousel.evaluate(el => {
      const track = el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
      const cards = [...el.querySelectorAll('.crs-review-card')].map(card => card.getBoundingClientRect()).sort((a,b)=>a.left-b.left)
      const visible = cards.filter(card => card.left >= track.left - 1 && card.right <= track.right + 1)
      return { count: visible.length, left: visible[0]?.left - track.left, width: visible[0]?.width, trackWidth: track.width - 2, gap: visible[1] ? visible[1].left - visible[0].right : null }
    })
    expect(geometry.count).toBe(count)
    expect(geometry.left).toBeCloseTo(1, 0)
    expect(geometry.width).toBeCloseTo((geometry.trackWidth - 12 * (count - 1)) / count, 0)
    if (geometry.gap !== null) expect(geometry.gap).toBeCloseTo(12, 0)
  }
})

test('review carousel preview preserves empty columns and hides redundant controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto('/ui/preview?component=carousel')
  await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeEnabled()
  await page.getByRole('group', { name: 'Карточки карусели' }).getByRole('button', { name: 'Отзывы', exact: true }).click()

  const carousel = page.locator('.crs-carousel[data-variant="review-card"]')
  await expect(carousel.locator('.crs-carousel__track')).toHaveClass(/swiper-initialized/)
  await expect.poll(() => carousel.locator('.crs-carousel__item').first().evaluate(item => getComputedStyle(item).marginRight)).toBe('12px')
  const geometry = await carousel.evaluate(el => {
    const track = el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
    const cards = [...el.querySelectorAll('.crs-review-card')].map(card => card.getBoundingClientRect()).sort((a,b)=>a.left-b.left)
    return { left: cards[0]!.left - track.left, width: cards[0]!.width, gap: cards[1]!.left - cards[0]!.right }
  })
  expect(geometry.left).toBeCloseTo(1, 0)
  const trackWidth = await carousel.locator('.crs-carousel__track').evaluate(el => el.clientWidth - 2)
  expect(geometry.width).toBeCloseTo((trackWidth - 24) / 3, 0)
  expect(geometry.gap).toBeCloseTo(12, 0)
  await expect(carousel.getByRole('button', { name: 'Назад', exact: true })).toBeVisible()

  for (const count of ['1', '2']) {
    await page.getByRole('group', { name: 'Количество карточек' }).getByRole('button', { name: count, exact: true }).click()
    await expect(carousel.locator('.crs-review-card')).toHaveCount(Number(count))
    await expect.poll(() => carousel.locator('.crs-review-card').first().evaluate(el => el.getBoundingClientRect().width)).toBeCloseTo((trackWidth - 24) / 3, 0)
    const left = await carousel.evaluate(el => el.querySelector('.crs-review-card')!.getBoundingClientRect().left - el.querySelector('.crs-carousel__track')!.getBoundingClientRect().left)
    expect(left).toBeCloseTo(1, 0)
  }
  await expect(carousel.getByRole('button', { name: 'Назад', exact: true })).toHaveCount(0)
  await expect(carousel.getByRole('button', { name: 'Вперёд', exact: true })).toHaveCount(0)

  await page.setViewportSize({ width: 480, height: 1100 })
  await expect(carousel.getByRole('button', { name: 'Назад', exact: true })).toBeVisible()
  const mobileGeometry = await carousel.evaluate(el => {
    const track = el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
    const cards = [...el.querySelectorAll('.crs-review-card')].map(card => card.getBoundingClientRect()).sort((a,b)=>a.left-b.left)
    return { left: cards[0]!.left - track.left, width: cards[0]!.width, gap: cards[1]!.left - cards[0]!.right }
  })
  expect(mobileGeometry.left).toBeCloseTo(1, 0)
  expect(mobileGeometry.width).toBeCloseTo(430, 0)
  expect(mobileGeometry.gap).toBeCloseTo(12, 0)
})

test('touch swipe advances one card without scrolling the page horizontally', async ({ browser }) => {
  const context = await browser.newContext({ viewport:{width:393,height:1000}, hasTouch:true, isMobile:true })
  const page=await context.newPage()
  await page.goto('/ui/preview?component=carousel')
  await expect.poll(()=>firstVisible(page)).toBe('Курс 1')
  await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeEnabled()
  const box=(await page.locator('.crs-carousel__track').boundingBox())!
  const cdp=await context.newCDPSession(page)
  const y=box.y+box.height/2
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-30,y}]})
  for(let i=1;i<=6;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-30-(box.width-60)*i/6,y}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await expect.poll(()=>firstVisible(page)).toBe('Курс 2')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0)
  await context.close()
})

test('Tab skips offscreen cards and never shifts the clipped track', async ({ page }) => {
  await page.setViewportSize({width:320,height:1100})
  await page.goto('/ui/preview?component=carousel')
  await expect(page.getByRole('button',{name:'Назад',exact:true})).toBeEnabled()
  await expect.poll(()=>page.locator('.crs-carousel__item').evaluateAll(items=>items.filter(item=>!(item as HTMLElement).inert).length)).toBe(1)
  await page.locator('.crs-carousel').focus()
  for(let i=0;i<4;i++) await page.keyboard.press('Tab')
  await expect(page.getByRole('button',{name:'Вперёд',exact:true})).toBeFocused()
  expect(await page.locator('.crs-carousel__track').evaluate(el=>el.scrollLeft)).toBe(0)
  await page.keyboard.press('Enter')
  await expect.poll(()=>firstVisible(page)).toBe('Курс 2')
})

test('horizontal wheel advances cards while vertical wheel remains page scrolling', async ({ page }) => {
  await page.setViewportSize({width:393,height:500})
  await page.goto('/ui/preview?component=carousel')
  await expect(page.getByRole('button',{name:'Назад',exact:true})).toBeEnabled()
  await page.locator('.crs-carousel__track').hover({position:{x:100,y:60}})
  await page.mouse.wheel(300,0)
  await expect.poll(()=>firstVisible(page)).toBe('Курс 2')
  await page.mouse.wheel(0,200)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0)
  await expect.poll(()=>firstVisible(page)).toBe('Курс 2')
})
