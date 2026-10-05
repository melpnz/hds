import { expect, test } from '@playwright/test'

const widths = [320, 480, 768, 1024]
const pageIds = [
  'courses-listing', 'course-category', 'education-centers-listing', 'rating',
  'education-center', 'reviews', 'review-detail', 'promocodes', 'promocode-detail',
  'authors', 'editors', 'author'
]

test('profile history matches production sizes and spacing', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/author')
    const history = page.locator('.crs-profile-history')
    await expect(history).toHaveCSS('column-gap', width < 768 ? '40px' : '16px')
    const logos = history.locator('.crs-logo')
    await expect(logos).toHaveCount(14)
    await expect.poll(() => logos.evaluateAll(items => items.every(item => (item as HTMLImageElement).complete && (item as HTMLImageElement).naturalWidth > 0))).toBe(true)
    for (const logo of await logos.all()) {
      await expect(logo).toHaveCSS('width', '48px')
      await expect(logo).toHaveCSS('height', '48px')
    }
    for (const group of await history.locator(':scope > div').all()) {
      const title = (await group.locator('h2').boundingBox())!
      const list = (await group.locator('ul').boundingBox())!
      expect(list.y - title.y - title.height).toBeCloseTo(24, 1)
      await expect(group.locator('ul')).toHaveCSS('row-gap', '24px')
      for (const row of await group.locator('li').all()) {
        await expect(row).toHaveCSS('column-gap', '12px')
        await expect(row.locator('strong')).toHaveCSS('font-size', '16px')
        await expect(row.locator('strong')).toHaveCSS('font-weight', '600')
        await expect(row.locator('strong')).toHaveCSS('-webkit-line-clamp', '2')
        await expect(row.locator('time')).toHaveCSS('font-size', '14px')
        await expect(row.locator('time')).toHaveCSS('line-height', '20px')
        const logo = (await row.locator('.crs-logo').boundingBox())!
        const text = (await row.locator('strong').boundingBox())!
        expect(text.x - logo.x - logo.width).toBeCloseTo(12, 1)
        expect(text.y).toBeCloseTo(logo.y, 1)
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  }
})

test('author biography and facts share the content edges without an extra history heading', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/author')
    const bio = (await page.locator('.crs-prose').boundingBox())!
    const container = (await page.locator('main').boundingBox())!
    expect(bio.x).toBeCloseTo(container.x + 24, 1)
    expect(bio.width).toBeCloseTo(container.width - 48, 1)
    for (const title of ['В чем эксперт?', 'Регалии и квалификации']) {
      const heading = (await page.getByRole('heading', { name: title, exact: true }).boundingBox())!
      expect(heading.x).toBeCloseTo(bio.x, 1)
    }
    await expect(page.getByRole('heading', { name: 'Опыт и образование', exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Опыт работы', exact: true })).toBeVisible()
    const headingGaps = await page.locator('main').evaluate(main => {
      const bio = main.querySelector('.crs-prose')!.getBoundingClientRect()
      const facts = [...main.querySelectorAll('.production-page__facts')]
      const sections = facts.map(list => list.closest('section')!)
      const expertise = sections[0].getBoundingClientRect()
      const qualifications = sections[1].getBoundingClientRect()
      const history = main.querySelector('.crs-profile-history')!.getBoundingClientRect()
      return [expertise.top - bio.bottom, qualifications.top - expertise.bottom, history.top - qualifications.bottom]
    })
    for (const gap of headingGaps) expect(gap).toBeCloseTo(40, 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  }
})

test('people cards use company logos and captured career, email and LinkedIn contacts', async ({ page }) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const id of ['authors', 'editors']) {
      await page.goto(`/ui/pages/${id}`)
      const logos = page.locator('.crs-person-card__company img')
      await expect(logos).toHaveCount(id === 'authors' ? 8 : 6)
      await expect.poll(() => logos.evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
      const logoSources = await logos.evaluateAll(images => images.map(image => image.getAttribute('src')))
      expect(new Set(logoSources).size).toBeGreaterThan(1)
      const contacts = page.locator('.crs-person-card__contacts a')
      expect(await contacts.locator('img[src="/courses/services/career.svg"]').count()).toBeGreaterThan(0)
      expect(await contacts.locator('img[src="/courses/email.svg"]').count()).toBeGreaterThan(0)
      expect(await contacts.locator('img[src="/courses/linkedin.svg"]').count()).toBeGreaterThan(0)
      for (const href of await contacts.evaluateAll(links => links.map(link => link.getAttribute('href')))) expect(href).toMatch(/^(https:\/\/|mailto:)/)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
    }
    const daria = page.locator('.crs-person-card').filter({ has: page.getByRole('heading', { name: 'Дарья Гуляева', exact: true }) })
    await expect(daria.getByRole('link', { name: 'Хабр Карьера', exact: true })).toHaveAttribute('href', 'https://career.habr.com/gulyaevads')
    await expect(daria.getByRole('link', { name: 'Почта: gulaeva@habr.team', exact: true })).toHaveAttribute('href', 'mailto:gulaeva@habr.team')
  }
})

test('person card names wrap within the padded content area', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/editors')
    const name = page.locator('.crs-person-card h3').filter({ hasText: 'Анастасия Сичкаренко' })
    await expect(name).toHaveCSS('white-space', 'normal')
    const geometry = await name.evaluate(el => {
      const card = el.closest('.crs-person-card')!
      const box = card.getBoundingClientRect()
      const padding = parseFloat(getComputedStyle(card).paddingRight)
      const range = document.createRange()
      range.selectNodeContents(el)
      return { right: box.right - padding - 1, lines: [...range.getClientRects()].map(rect => ({ right: rect.right, top: rect.top })) }
    })
    for (const line of geometry.lines) expect(line.right).toBeLessThanOrEqual(geometry.right + 1)
    if (width === 1024) expect(new Set(geometry.lines.map(line => line.top)).size).toBeGreaterThan(1)
  }
})

test('expert and editor introductions keep illustrations on the right and show feature icons', async ({ page }) => {
  for (const id of ['authors', 'editors']) {
    for (const width of [320, 480, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1100 })
      await page.goto(`/ui/pages/${id}`)
      await expect(page.locator('.production-page')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      const intro = page.locator('.production-page__expert-intro')
      const steps = page.locator('.production-page__expert-panel > .crs-section')
      const introBox = (await intro.boundingBox())!
      const titleBox = (await steps.locator('h2').boundingBox())!
      const gridBox = (await steps.locator('.crs-grid').boundingBox())!
      expect(titleBox.y - introBox.y - introBox.height).toBeCloseTo(40, 1)
      expect(gridBox.y - titleBox.y - titleBox.height).toBeCloseTo(24, 1)
      const picture = intro.locator('.production-page__expert-shield')
      if (width < 768) {
        await expect(picture).toBeHidden()
      } else {
        const text = (await intro.locator(':scope > div').first().boundingBox())!
        const image = (await picture.boundingBox())!
        const frame = (await intro.boundingBox())!
        expect(image.x).toBeGreaterThanOrEqual(text.x + text.width)
        expect(image.x + image.width).toBeCloseTo(frame.x + frame.width, 1)
        expect(image.y).toBeCloseTo(text.y, 1)
      }
      if (id === 'authors') {
        const circles = intro.locator('.production-page__expert-feature-icon')
        await expect(circles).toHaveCount(3)
        for (const circle of await circles.all()) {
          await expect(circle).toHaveCSS('width', '32px')
          await expect(circle).toHaveCSS('height', '32px')
          await expect(circle.locator('.iconify')).toBeVisible()
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
    }
  }
})

test('promocode pages have selectable organization, topic and type options', async ({ page }) => {
  for (const id of ['promocodes', 'promocode-detail']) {
    for (const width of [320, 1024]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`/ui/pages/${id}`)
      await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
      if (id === 'promocode-detail' && width < 768) {
        await page.locator('.crs-search-form__summary').click()
      }
      const choose = async (field: string, option: string) => {
        await page.getByRole('button', { name: field, exact: true }).click()
        expect(await page.getByRole('option').count()).toBeGreaterThan(1)
        await page.getByRole('option', { name: option, exact: true }).click()
        await expect(page.getByRole('button', { name: field, exact: true })).toContainText(option)
      }
      await choose('Организация', 'Яндекс Практикум')
      await choose('Что изучить?', 'Программирование и IT')
      await choose('Тип', 'Промокоды')
      if (id === 'promocode-detail' && width < 768) {
        await page.getByRole('button', { name: 'Найти промокоды', exact: true }).click()
        await expect(page.locator('.crs-search-form__summary')).toContainText('Программирование и IT')
        await expect(page.locator('.crs-search-form__summary')).toContainText('Промокоды')
        await page.locator('.crs-search-form__summary').click()
        await expect(page.getByRole('button', { name: 'Тип', exact: true })).toContainText('Промокоды')
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
    }
  }
})

test('review detail matches production back-link spacing at every viewport', async ({ page }) => {
  for (const width of [320, 393, 480, 767, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/review-detail')
    const header = (await page.locator('.crs-site-header').boundingBox())!
    const back = (await page.locator('.production-page__back-link').boundingBox())!
    const card = (await page.locator('.production-page__review-body > .crs-review-card').boundingBox())!
    expect(back.y - header.y - header.height).toBeCloseTo(24, 1)
    expect(back.height).toBeCloseTo(32, 1)
    expect(card.y - back.y - back.height).toBeCloseTo(24, 1)
    const sections = page.locator('.production-page__review-body > section')
    const first = (await sections.nth(0).boundingBox())!
    const last = (await sections.nth(1).boundingBox())!
    expect(first.y - card.y - card.height).toBeCloseTo(48, 1)
    expect(last.y - first.y - first.height).toBeCloseTo(48, 1)
    const title = (await page.locator('h1').boundingBox())!
    expect(title.y - last.y - last.height).toBeCloseTo(32, 1)
  }
})

test('reviews dropdowns contain schools and dependent course options', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/reviews')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    await page.getByRole('button', { name: 'Какая школа?', exact: true }).click()
    await page.getByRole('option', { name: 'Академия Эдюсон', exact: true }).click()
    await page.getByRole('button', { name: 'Какой курс?', exact: true }).click()
    await expect(page.getByRole('option')).toHaveCount(2)
    await page.getByRole('option', { name: 'Python-разработчик + ИИ', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Какой курс?', exact: true })).toContainText('Python-разработчик + ИИ')
    await page.getByRole('button', { name: 'Какая школа?', exact: true }).click()
    await page.getByRole('option', { name: 'Skillbox', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Какой курс?', exact: true })).toContainText('Все курсы')
    await page.getByRole('button', { name: 'Какой курс?', exact: true }).click()
    await expect(page.getByRole('option', { name: 'Нейросети. Практический курс', exact: true })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Python-разработчик + ИИ', exact: true })).toHaveCount(0)
  }
})

test('school header logo stays fixed while description expands and the toggle is below text', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/education-center')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const header = page.locator('.crs-entity-header')
    const logo = header.locator('.crs-entity-header__logo')
    const before = (await logo.boundingBox())!
    const toggle = header.locator('.crs-entity-header__more')
    await toggle.click()
    await expect(toggle).toHaveText('Свернуть')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const expanded = (await logo.boundingBox())!
    expect(expanded.y).toBeCloseTo(before.y, 1)
    const text = (await header.locator('.crs-entity-header__description p').boundingBox())!
    const link = (await toggle.boundingBox())!
    expect(link.y).toBeGreaterThanOrEqual(text.y + text.height)
    expect(link.x).toBeCloseTo(text.x, 1)
    await toggle.click()
    await expect(toggle).toHaveText('Подробнее')
    expect((await logo.boundingBox())!.y).toBeCloseTo(before.y, 1)
  }
})

test('rating search populates dependent fields and filters local rows', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/rating')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const choose = async (field: string, option: string) => {
      await page.getByRole('button', { name: field, exact: true }).click()
      await page.getByRole('option', { name: option, exact: true }).click()
    }
    await expect(page.locator('.crs-rating-table__row')).toHaveCount(10)
    await choose('Какое направление?', 'Программирование и IT')
    await choose('Что изучить?', 'Программирование')
    await choose('Какая цель?', 'Освоить профессию')
    await page.getByRole('button', { name: 'Найти школы', exact: true }).click()
    await expect(page.locator('.crs-rating-table__row')).toHaveCount(4)
    await choose('Какая цель?', 'Для себя')
    await page.getByRole('button', { name: 'Найти школы', exact: true }).click()
    await expect(page.locator('.crs-empty')).toBeVisible()
    await page.locator('.crs-empty').getByRole('button', { name: 'Сбросить фильтры' }).click()
    await expect(page.locator('.crs-rating-table__row')).toHaveCount(10)
    await choose('Какое направление?', 'Программирование и IT')
    await choose('Что изучить?', 'Программирование')
    await choose('Какое направление?', 'Языки')
    await expect(page.getByRole('button', { name: 'Что изучить?', exact: true })).toContainText('Все темы')
    await choose('Что изучить?', 'Английский язык')
    await page.getByRole('group', { name: 'Аудитория' }).getByRole('button', { name: 'Детям', exact: true }).click()
    await expect(page.locator('.crs-rating-table__row')).toHaveCount(4)
    await expect(page.locator('.crs-rating-table__row').first()).toContainText('Пиксель')
    await page.getByRole('group', { name: 'Аудитория' }).getByRole('button', { name: 'Взрослым', exact: true }).click()
    await expect(page.locator('.crs-rating-table__row')).toHaveCount(10)
  }
})

test('school card buttons stay at the bottom and names truncate after three lines', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ui/pages/education-centers-listing')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const cards = page.locator('.production-page__school-results .crs-school-card')
    await cards.first().locator('.crs-school-card__title-link').evaluate(element => {
      element.textContent = 'Very long school name with many words '.repeat(12)
    })
    const geometry = await cards.evaluateAll(elements => elements.map(element => {
      const card = element.getBoundingClientRect()
      const button = element.querySelector('.crs-school-card__action')!.getBoundingClientRect()
      const name = element.querySelector<HTMLElement>('.crs-school-card__title-link')!
      return { bottom: card.bottom - button.bottom, nameHeight: name.getBoundingClientRect().height, contentHeight: name.scrollHeight, clamp: getComputedStyle(name).webkitLineClamp }
    }))
    for (const card of geometry) {
      expect(card.bottom).toBeCloseTo(25, 1)
      expect(card.clamp).toBe('3')
      expect(card.nameHeight).toBeLessThanOrEqual(66)
    }
    expect(geometry[0]!.nameHeight).toBe(66)
    expect(geometry[0]!.contentHeight).toBeGreaterThan(66)
  }
})

test('education search selects filters, submits, clears and switches audience', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/pages/education-centers-listing')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const results = page.locator('.production-page__school-results')
    const choose = async (field: string, option: string) => {
      await page.getByRole('button', { name: field, exact: true }).click()
      await page.getByRole('option', { name: option, exact: true }).click()
    }
    await expect(results.locator('.crs-school-card')).toHaveCount(8)
    await choose('Организация', 'Хекслет')
    await choose('Что изучить?', 'Программирование')
    await choose('Тип', 'Онлайн-школа')
    await expect(results.locator('.crs-school-card')).toHaveCount(8)
    await page.getByRole('button', { name: 'Найти организации', exact: true }).click()
    await expect(results.locator('.crs-school-card')).toHaveCount(1)
    await expect(results.locator('.crs-school-card h3')).toHaveText('Хекслет')
    await choose('Что изучить?', 'Английский язык')
    await page.getByRole('button', { name: 'Найти организации', exact: true }).click()
    await expect(results.getByText('Ничего не найдено', { exact: true })).toBeVisible()
    await results.locator('.crs-empty').getByRole('button', { name: 'Сбросить фильтры' }).click()
    await expect(results.locator('.crs-school-card')).toHaveCount(8)
    await page.getByRole('group', { name: 'Аудитория' }).getByRole('button', { name: 'Детям', exact: true }).click()
    await expect(results.locator('.crs-school-card h3').first()).toHaveText('Компьютерная академия «TOP»')
    await expect(results.locator('.crs-pagination')).toBeVisible()
    const first = await results.locator('.crs-school-card h3').first().innerText()
    await results.locator('.crs-pagination').getByRole('button', { name: 'Вперёд', exact: true }).click()
    await expect(results.locator('.crs-school-card h3').first()).not.toHaveText(first)
    await page.getByRole('group', { name: 'Аудитория' }).getByRole('button', { name: 'Взрослым', exact: true }).click()
    await expect(results.locator('.crs-school-card h3').first()).toHaveText('Яндекс Практикум')
  }
})

test('education footer lists expand their production data and journal fills columns', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/pages/education-centers-listing')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const columns = width < 768 ? 1 : width < 1024 ? 2 : 3
    for (const [title, total, first] of [['Образовательные организации в городах', 33, 'Москва'], ['Ещё онлайн-школы', 49, 'Frontend-разработка']] as const) {
      const section = page.locator('section').filter({ has: page.getByRole('heading', { name: title, exact: true }) })
      await expect(section.locator('.crs-link-grid__link')).toHaveCount(columns * 3)
      await expect(section.locator('.crs-link-grid__link').first()).toHaveText(first)
      await section.getByRole('button', { name: 'Смотреть все', exact: true }).click()
      await expect(section.locator('.crs-link-grid__link')).toHaveCount(total)
      await section.getByRole('button', { name: 'Свернуть', exact: true }).click()
      await expect(section.locator('.crs-link-grid__link')).toHaveCount(columns * 3)
    }
    const carousel = page.locator('.crs-carousel[data-variant="article-card"]')
    await expect.poll(() => carousel.locator('.crs-carousel__item').first().evaluate(item => getComputedStyle(item).marginRight)).toBe('12px')
    const geometry = await carousel.evaluate(el => {
      const track = el.querySelector('.crs-carousel__track')!.getBoundingClientRect()
      const card = el.querySelector('.crs-article-card')!.getBoundingClientRect()
      return { track: track.width - 2, card: card.width }
    })
    expect(geometry.card).toBeCloseTo((geometry.track - 12 * (columns - 1)) / columns, 0)
    await expect(carousel.locator('.crs-carousel__controls')).toHaveCount(columns === 3 ? 0 : 1)
  }
})

test('hero pages share one gradient and audience buttons retain symmetric padding', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const id of ['education-centers-listing', 'rating', 'reviews', 'promocodes', 'authors', 'editors']) {
      await page.goto(`/ui/pages/${id}`)
      const hero = page.locator('.crs-hero')
      await expect(hero.locator('.crs-site-header')).toHaveAttribute('data-surface', 'transparent')
      await expect(hero.locator('.crs-site-header__blue')).toHaveCSS('background-image', 'none')
      await expect(hero.locator('.crs-site-header')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      const geometry = await hero.evaluate(element => ({
        gradient: getComputedStyle(element).backgroundImage,
        items: Array.from(element.querySelectorAll('.crs-button-group__item')).map(item => {
          const button = item.getBoundingClientRect()
          const text = item.querySelector('span')!.getBoundingClientRect()
          return { left: text.left - button.left, right: button.right - text.right }
        })
      }))
      expect(geometry.gradient).toContain('linear-gradient')
      for (const item of geometry.items) {
        expect(item.left).toBeCloseTo(16, 1)
        expect(item.right).toBeCloseTo(16, 1)
      }
    }
  }
})

test('category directions reuse the expandable link grid at guide breakpoints', async ({ page }) => {
  for (const width of [320, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/pages/course-category')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Другие направления нейросетей', exact: true }) })
    const count = width < 768 ? 3 : width < 1024 ? 6 : 9
    await expect(section.locator('.crs-link-grid__link')).toHaveCount(count)
    await expect(section.locator('.crs-link-grid__link').first()).toHaveAttribute('href', 'https://career.habr.com/courses/nejronnye-seti')
    await expect(section.locator('.crs-link-grid small')).toHaveCount(0)
    await section.getByRole('button', { name: 'Смотреть все', exact: true }).click()
    await expect(section.locator('.crs-link-grid__link')).toHaveCount(72)
    await section.getByRole('button', { name: 'Свернуть', exact: true }).click()
    await expect(section.locator('.crs-link-grid__link')).toHaveCount(count)
  }
})

test('category breadcrumbs flow inline and both contributor dialogs open', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/pages/course-category')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    if (width === 320) {
      const lines = await page.locator('.crs-breadcrumbs').evaluate(element => {
        const middle = Array.from(element.children[1].getClientRects())
        return { middleLast: middle.at(-1)!.y, current: element.children[2].getBoundingClientRect().y }
      })
      expect(lines.current).toBe(lines.middleLast)
    }
    await page.locator('.crs-site-header__contributors-more:visible').click()
    await expect(page.getByRole('dialog')).toContainText('Кто работал над этой страницей?')
    await expect(page.getByRole('dialog')).toContainText('Елена Лучина')
    await expect(page.locator('.production-page__dialog-intro')).toHaveCSS('color', 'rgb(44, 46, 52)')
    await expect(page.locator('.production-page__dialog-intro')).toHaveCSS('margin-top', '0px')
    for (const avatar of await page.getByRole('dialog').locator('.crs-avatar').all()) {
      await expect(avatar).toHaveCSS('width', '48px')
      await expect(avatar).toHaveCSS('height', '48px')
    }
    await expect(page.locator('.production-page__contributor-dialog-info > span')).toHaveCount(3)
    const expertLink = page.getByRole('dialog').getByRole('link', { name: 'Узнать больше про экспертов', exact: true })
    await expect(expertLink).toHaveAttribute('href', '/ui/pages/authors')
    await expect(expertLink).toHaveClass(/crs-button--main/)
    const closeButton = page.getByRole('dialog').getByRole('button', { name: 'Закрыть', exact: true })
    await expect(closeButton).toHaveClass(/crs-button--secondary/)
    const primaryBox = (await expertLink.boundingBox())!
    const secondaryBox = (await closeButton.boundingBox())!
    expect(secondaryBox.y).toBeGreaterThan(primaryBox.y + primaryBox.height)
    await page.getByRole('dialog').getByRole('button', { name: 'Закрыть', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.locator('.crs-site-header__verified').click()
    await expect(page.getByRole('dialog')).toContainText('Что значит «Проверено»?')
    for (const paragraph of await page.locator('.production-page__verification-copy p').all()) {
      await expect(paragraph).toHaveCSS('margin-top', '0px')
      await expect(paragraph).toHaveCSS('margin-bottom', '0px')
    }
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Узнать больше про экспертов', exact: true })).toHaveClass(/crs-button--main/)
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Закрыть', exact: true })).toHaveClass(/crs-button--secondary/)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  }
})

for (const width of widths) {
  test(`courses listing composition at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/pages/courses-listing')

    const composition = page.locator('[data-production-page="courses-listing"]')
    await expect(composition).toBeVisible()
    await expect(composition.locator('.crs-site-header')).toHaveAttribute('data-family', 'courses')
    await expect(composition.locator('.crs-course-card')).toHaveCount(8)
    await expect(composition.locator('.crs-authors')).toBeVisible()
    await expect(composition.locator('.crs-review-card')).toHaveCount(3)
    await expect(composition.locator('.crs-rating-table')).toBeVisible()
    await expect(composition.locator('.crs-footer')).toBeVisible()

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

for (const width of [320, 480, 768, 1024, 1440]) {
  test(`all production compositions render without body overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const id of pageIds) {
      await page.goto(`/ui/pages/${id}`)
      const composition = page.locator(`[data-production-page="${id}"]`)
      await expect(composition, id).toBeVisible()
      await expect(composition.locator('.crs-site-header'), `${id} header`).toBeVisible()
      await expect(composition.locator('.crs-footer'), `${id} footer`).toBeVisible()
      const brokenProductionAssets = await composition.locator('img[src^="/production-assets/"]').evaluateAll(images => images
        .filter(image => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
        .map(image => image.getAttribute('src')))
      expect(brokenProductionAssets, `${id} production assets`).toEqual([])
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `${id} body overflow`).toBe(0)
    }
  })
}

test('production page catalog exposes guide breakpoints', async ({ page }) => {
  await page.setViewportSize({ width: 681, height: 720 })
  await page.goto('/ui/pages')
  await expect(page.getByRole('heading', { name: 'Страницы production' })).toBeVisible()
  for (const label of ['Auto', '320', '480', '768', '1024']) {
    await expect(page.getByRole('tab', { name: label, exact: true })).toBeVisible()
  }
  const tabs = await page.getByRole('tab').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { x: rect.x, y: rect.y }
  }))
  expect(new Set(tabs.map(tab => tab.y)).size).toBe(1)
  expect(tabs.map(tab => tab.x)).toEqual([...tabs.map(tab => tab.x)].sort((a, b) => a - b))
  await expect(page.locator('iframe')).toHaveAttribute('src', '/ui/pages/courses-listing')
})

test('two-field production search stacks on phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/ui/pages/reviews')

  const fields = page.locator('.crs-search-form__field')
  await expect(fields).toHaveCount(2)
  const first = await fields.nth(0).boundingBox()
  const second = await fields.nth(1).boundingBox()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height)
})

test('promocode detail exposes selected desktop search and compact phone summary', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/ui/pages/promocode-detail')
  await expect(page.locator('.crs-search-form__field').first()).toContainText('Яндекс Практикум')
  await expect(page.locator('.crs-search-form__submit')).toHaveText('Найти промокоды')

  await page.setViewportSize({ width: 320, height: 900 })
  await expect(page.locator('.crs-search-form__summary')).toContainText('Яндекс Практикум')
  await expect(page.locator('.crs-search-form__summary')).toContainText('Все темы')
  await expect(page.locator('.crs-search-form__summary')).toContainText('Все типы')
})
