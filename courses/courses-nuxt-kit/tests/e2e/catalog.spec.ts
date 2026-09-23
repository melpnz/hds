import { expect, test } from '@playwright/test'

async function waitForHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
}

test.describe('Courses UI catalog', () => {
  test('redirects the root and exposes the consolidated guide entries', async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)

    await expect(page).toHaveURL(/\/ui/)
    await expect(page.getByText('Nuxt component library · 71 элементов')).toBeVisible()
    await expect(page.locator('.catalog-list > button')).toHaveCount(71)
    await expect(page.locator('.catalog-list .status--in-progress')).toHaveCount(0)
    await expect(page.locator('.source-status')).toHaveCount(0)
  })

  test('renders a selected component and filters the registry', async ({ page }) => {
    await page.goto('/ui?component=course-card')
    await waitForHydration(page)

    await expect(page.getByRole('heading', { name: 'CourseCard' })).toBeVisible()
    await expect(page.getByText('Frontend-разработчик')).toBeVisible()

    await page.getByPlaceholder('Найти компонент').fill('tooltip')
    await expect(page.locator('.catalog-list > button')).toHaveCount(1)
    await expect(page.locator('.catalog-list')).toContainText('Tooltip')
  })

  test('loads generic previews and exposes useful component variants', async ({ page }) => {
    await page.goto('/ui?component=chip')
    await waitForHydration(page)
    await expect(page.locator('.preview-stage .crs-chip')).toHaveCount(10)
    await expect(page.getByText('С удалением', { exact: true })).toBeVisible()

    await page.goto('/ui?component=button')
    await waitForHydration(page)
    await expect(page.locator('.button-grid .crs-button')).toHaveCount(36)
    await expect(page.locator('.button-grid').getByText('XL · icon', { exact: true })).toBeVisible()
    const buttonIcons = page.locator('.button-grid .crs-button .iconify:not(.crs-button__loader)')
    await expect(buttonIcons).toHaveCount(18)
    expect(await buttonIcons.evaluateAll(icons => icons.map(icon => {
      const rect = icon.getBoundingClientRect()
      return [rect.width, rect.height]
    }))).toEqual(Array.from({ length: 18 }, () => [24, 24]))
    const iconButtonSpacing = await page.locator('.button-grid .crs-button--leading').evaluateAll(buttons => buttons.slice(0, 3).map((button) => {
      const styles = getComputedStyle(button)
      return {
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        gap: styles.gap,
      }
    }))
    expect(iconButtonSpacing).toEqual([
      { paddingLeft: '8px', paddingRight: '16px', gap: '4px' },
      { paddingLeft: '12px', paddingRight: '20px', gap: '6px' },
      { paddingLeft: '16px', paddingRight: '24px', gap: '8px' },
    ])

    await page.goto('/ui?component=checkbox')
    await waitForHydration(page)
    await expect(page.locator('.control-variants .crs-check')).toHaveCount(5)
    await expect(page.getByText('Выбрана часть', { exact: true })).toBeVisible()

    await page.goto('/ui?component=switch')
    await waitForHydration(page)
    await expect(page.locator('.control-variants .crs-switch')).toHaveCount(5)
    await expect(page.locator('.crs-switch[aria-busy="true"]')).toBeVisible()

    await page.goto('/ui?component=social-icon')
    await waitForHydration(page)
    await expect(page.locator('.preview-stage .crs-social img')).toHaveCount(5)
    await expect(page.getByRole('link', { name: 'Telegram' }).locator('img')).toHaveAttribute('src', '/courses/social/telegram.svg')

    await page.goto('/ui?component=link')
    await waitForHydration(page)
    await expect(page.locator('.preview-stage .crs-link')).toHaveCount(3)
    await expect(page.getByRole('heading', { name: 'Link', exact: true })).toBeVisible()
  })

  test('reuses public option primitives for selection menus', async ({ page }) => {
    await page.goto('/ui?component=option-list')
    await waitForHydration(page)

    const lists = page.locator('.preview-stage .crs-option-list')
    await expect(lists).toHaveCount(4)
    await expect(lists.nth(0)).toHaveAttribute('role', 'listbox')
    await expect(lists.nth(1)).toHaveAttribute('aria-multiselectable', 'true')
    await expect(lists.nth(2)).toHaveAttribute('role', 'menu')
    await expect(lists.nth(3)).toHaveAttribute('aria-multiselectable', 'true')
    const selectedSingle = lists.nth(0).getByRole('option', { name: 'Разработка' })
    await expect(selectedSingle).toHaveCSS('background-color', 'rgb(241, 241, 241)')
    await expect(selectedSingle.locator('.crs-option-item__check')).toHaveCount(0)

    const multipleRow = lists.nth(1).getByRole('option', { name: 'Разработка' })
    const multipleCheckbox = multipleRow.locator('.crs-option-item__checkbox')
    await expect(multipleCheckbox).toBeVisible()
    await expect(multipleCheckbox).toHaveClass(/crs-check/)
    await expect(multipleRow).toHaveCSS('font-size', '16px')
    const multipleGeometry = await multipleRow.evaluate((row) => {
      const copy = row.querySelector('.crs-option-item__copy')!.getBoundingClientRect()
      const checkbox = row.querySelector('.crs-option-item__checkbox')!.getBoundingClientRect()
      return { checkboxRight: checkbox.right, copyLeft: copy.left }
    })
    expect(multipleGeometry.checkboxRight).toBeLessThanOrEqual(multipleGeometry.copyLeft)
    await multipleCheckbox.click()
    await expect(multipleRow).toHaveAttribute('aria-selected', 'false')
    await multipleCheckbox.click()
    await expect(multipleRow).toHaveAttribute('aria-selected', 'true')

    const richRow = lists.nth(3).locator('.crs-option-item')
    await expect(richRow).toHaveCSS('padding', '8px 24px 8px 16px')
    await expect(richRow).toHaveCSS('gap', '12px')
    await expect(richRow).toHaveCSS('font-size', '16px')
    await expect(richRow.locator('.crs-check__visual')).toHaveCSS('width', '24px')
    await expect(richRow.locator('.crs-option-item__leading')).toHaveCSS('width', '24px')
    await expect(richRow.locator('.crs-option-item__avatar')).toHaveCSS('width', '24px')
    await expect(richRow.locator('.crs-option-item__logo')).toHaveCSS('width', '40px')
    await expect(richRow.locator('.crs-option-item__count')).toHaveCSS('min-height', '16px')
    await expect(richRow.locator('.crs-option-item__description').first()).toHaveCSS('font-size', '12px')
    await expect(richRow.locator('.crs-option-item__description').first()).toHaveCSS('line-height', '16px')
    await expect(richRow.locator('.crs-option-item__meta')).toHaveCSS('font-size', '12px')
    await expect(richRow.locator('.crs-option-item__trailing-icon')).toHaveCount(2)
    expect(await richRow.locator('.crs-option-item__trailing-icon').evaluateAll(icons => icons.map(icon => {
      const rect = icon.getBoundingClientRect()
      return [rect.width, rect.height]
    }))).toEqual([[24, 24], [24, 24]])

    await lists.nth(0).getByRole('option', { name: 'Дизайн UX/UI и графический дизайн' }).click()
    await expect(lists.nth(0).getByRole('option', { name: 'Дизайн UX/UI и графический дизайн' })).toHaveAttribute('aria-selected', 'true')

    await lists.nth(2).getByRole('menuitem', { name: 'Аналитика' }).click()
    await expect(page.getByText('Аналитика', { exact: true }).last()).toBeVisible()

    await page.goto('/ui?component=sort-sheet')
    await waitForHydration(page)
    await page.getByRole('button', { name: 'Открыть сортировку' }).click()
    const sortDialog = page.getByRole('dialog', { name: 'Сортировка' })
    const sortRow = sortDialog.getByRole('option').first()
    const sortGeometry = await Promise.all([sortDialog.boundingBox(), sortRow.boundingBox()])
    expect(Math.abs(sortGeometry[0]!.width - sortGeometry[1]!.width)).toBeLessThanOrEqual(1)
  })

  test('keeps canonical HDS geometry for core components', async ({ page }) => {
    await page.goto('/ui?component=icon-button')
    await waitForHydration(page)

    const iconButton = await page.locator('.crs-icon-button').first().boundingBox()
    expect(iconButton?.width).toBe(36)
    expect(iconButton?.height).toBe(36)

    const ghostIconButton = page.locator('.crs-icon-button--ghost').first()
    await expect(ghostIconButton).toHaveCSS('border-top-width', '0px')
    await expect(ghostIconButton).toHaveCSS('box-shadow', 'none')
    await expect(ghostIconButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await ghostIconButton.hover()
    await expect(ghostIconButton).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    await page.goto('/ui?component=pagination')
    await waitForHydration(page)
    await expect(page.locator('.crs-pagination > .crs-icon-button')).toHaveCount(2)
    await expect(page.locator('.crs-pagination > .crs-icon-button .crs-icon-button__icon').first()).toHaveCSS('width', '24px')
    await expect(page.locator('.crs-pagination-item')).toHaveCount(5)
    await expect(page.locator('.crs-pagination-item').first()).toHaveAttribute('aria-current', 'page')
    await page.getByRole('button', { name: 'Страница 2' }).click()
    await expect(page.getByRole('button', { name: 'Страница 2' })).toHaveAttribute('aria-current', 'page')

    await page.goto('/ui?component=course-card')
    await waitForHydration(page)
    const courseCard = await page.locator('.crs-course-card').boundingBox()
    expect(courseCard?.width).toBe(260)
    expect(courseCard?.height).toBe(418)

    await page.goto('/ui?component=school-card')
    await waitForHydration(page)
    const schoolCard = await page.locator('.crs-school-card').boundingBox()
    expect(schoolCard?.width).toBe(260)
    expect(schoolCard?.height).toBe(318)
    await expect(page.locator('.crs-school-card__rating')).toHaveCSS('padding-left', '0px')
    await expect(page.locator('.crs-school-card__rating')).toHaveCSS('padding-right', '0px')
    await expect(page.locator('.crs-school-card__rating')).toHaveCSS('margin-bottom', '8px')
  })

  test('renders the complete Courses avatar scale and canonical empty state', async ({ page }) => {
    await page.goto('/ui?component=avatar')
    await waitForHydration(page)

    const avatars = page.locator('.avatar-scale .crs-avatar')
    await expect(avatars).toHaveCount(8)
    await expect(avatars.first()).toHaveAttribute('src', '/courses/avatar-default-user.svg')
    await expect(avatars.first()).toHaveAttribute('data-empty', 'true')
    await expect(avatars.first()).toHaveAttribute('style', /--avatar-size:\s*6\.25rem/)
    expect(await avatars.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))).toEqual([100, 68, 56, 48, 40, 36, 32, 24])
    await expect(avatars.first()).toHaveCSS('border-radius', '200px')
  })

  test('uses a real viewport for responsive previews', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/ui?component=site-header')
    await waitForHydration(page)
    await page.getByRole('tab', { name: '1024', exact: true }).click()

    await expect.poll(async () => page.locator('.preview-frame--iframe').evaluate(element => ({
      clientWidth: element.clientWidth,
      renderedWidth: element.getBoundingClientRect().width
    }))).toEqual({ clientWidth: 1024, renderedWidth: 1024 })

    await page.getByRole('tab', { name: '320', exact: true }).click()

    const preview = page.frameLocator('.preview-frame--iframe')
    await expect(preview.locator('.crs-site-header')).toBeVisible()
    await expect(preview.locator('.crs-site-header')).toHaveCSS('height', '744px')
    await expect(preview.locator('.crs-site-header__topbar nav a')).toHaveCount(3)
    await expect(preview.locator('.crs-site-header__hero h1')).toHaveCSS('font-size', '30px')
    await expect(preview.getByRole('button', { name: 'Сортировка' })).toBeVisible()
    await expect(preview.getByRole('button', { name: 'Открыть фильтры' })).toBeVisible()
  })

  test('groups SiteHeader selects and stacks EntityHeader details at responsive widths', async ({ page }) => {
    for (const width of [768, 1024]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=site-header')
      await waitForHydration(page)
      const triggers = page.locator('.crs-site-header__listing-form').first().locator('.crs-select__trigger')
      await expect(triggers).toHaveCount(3)
      await expect(triggers.nth(0)).toHaveCSS('border-radius', '12px 0px 0px 12px')
      await expect(triggers.nth(1)).toHaveCSS('border-radius', '0px')
      await expect(triggers.nth(2)).toHaveCSS('border-radius', '0px 12px 12px 0px')

      const brand = page.locator('.crs-site-header__brand img')
      await expect(brand).toHaveAttribute('src', '/courses/brand/courses-logo.svg')
      await expect(brand).toHaveAttribute('style', /--crs-service-logo-width:\s*6\.0625rem;\s*--crs-service-logo-height:\s*2rem/)
      await expect(brand).toHaveCSS('width', '97px')
      await expect(brand).toHaveCSS('height', '32px')
      const brandGeometry = await page.locator('.crs-site-header__logo-area').evaluate((element) => {
        const logo = element.querySelector('.crs-site-header__brand')!.getBoundingClientRect()
        const separator = element.querySelector('i')!.getBoundingClientRect()
        const trigger = element.querySelector('.crs-header-dropdown__trigger')!.getBoundingClientRect()
        const icon = element.querySelector('.crs-header-dropdown__trigger .iconify')!.getBoundingClientRect()
        return {
          beforeSeparator: separator.left - logo.right,
          separator: [separator.width, separator.height],
          afterSeparator: icon.left - separator.right,
          trigger: [trigger.width, trigger.height],
          icon: [icon.width, icon.height]
        }
      })
      expect(brandGeometry).toEqual({ beforeSeparator: 12, separator: [1, 24], afterSeparator: 2, trigger: [24, 24], icon: [20, 20] })
      const navigation = page.locator('.crs-site-header__topbar nav a')
      await expect(navigation).toHaveCount(3)
      await expect(navigation.nth(0)).toHaveAttribute('href', 'https://career.habr.com/education_centers')
      await expect(navigation.nth(1)).toHaveAttribute('href', 'https://career.habr.com/education_centers/otzyvy')
      await expect(navigation.nth(2)).toHaveAttribute('href', 'https://career.habr.com/education/promocodes')
    }

    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=site-header')
      await waitForHydration(page)
      const group = page.locator('.crs-site-header__listing-form').first().locator('> div').first()
      const triggers = group.locator('.crs-select__trigger')
      await expect(page.locator('.crs-site-header')).toHaveCSS('height', '744px')
      await expect(group).toHaveCSS('gap', '1px')
      await expect(triggers.nth(0)).toHaveCSS('border-radius', '12px 12px 0px 0px')
      await expect(triggers.nth(1)).toHaveCSS('border-radius', '0px')
      await expect(triggers.nth(2)).toHaveCSS('border-radius', '0px 0px 12px 12px')
      const boxes = await triggers.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()))
      expect(Math.abs(boxes[1]!.top - boxes[0]!.bottom - 1)).toBeLessThanOrEqual(1)
      expect(Math.abs(boxes[2]!.top - boxes[1]!.bottom - 1)).toBeLessThanOrEqual(1)
      expect(Math.abs(boxes[0]!.width - (width - 48))).toBeLessThanOrEqual(1)

      const navigation = page.locator('.crs-site-header__topbar nav a')
      await expect(navigation).toHaveCount(3)
      await expect(navigation.nth(0)).toBeVisible()
      await expect(navigation.nth(0).locator('span:not(.iconify)')).toBeHidden()
      await expect(page.locator('.crs-site-header__mobile-menu')).toBeHidden()
      const navigationBoxes = await navigation.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()))
      expect(navigationBoxes.map(box => [box.width, box.height])).toEqual([[24, 24], [24, 24], [24, 24]])
      expect(navigationBoxes[1]!.left - navigationBoxes[0]!.right).toBe(16)
      expect(navigationBoxes[2]!.left - navigationBoxes[1]!.right).toBe(16)

      const servicesTrigger = page.locator('.crs-header-dropdown__trigger')
      await expect(servicesTrigger).toHaveCSS('color', 'rgb(255, 255, 255)')
      await servicesTrigger.hover()
      await expect(servicesTrigger).toHaveCSS('color', 'rgb(255, 255, 255)')
      await servicesTrigger.click()
      const dropdown = page.locator('.crs-header-dropdown__panel')
      const dropdownChevron = page.locator('.crs-header-dropdown__trigger .iconify')
      await expect(dropdownChevron).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)')
      const dropdownGeometry = await dropdown.evaluate((element) => {
        const panel = element.getBoundingClientRect()
        const brand = document.querySelector('.crs-site-header__brand')!.getBoundingClientRect()
        const title = element.querySelector('.crs-header-dropdown__title')!.getBoundingClientRect()
        return { panelLeft: panel.left, brandLeft: brand.left, panelWidth: panel.width, titleHeight: title.height }
      })
      expect(dropdownGeometry).toEqual({ panelLeft: 24, brandLeft: 24, panelWidth: 200, titleHeight: 36 })
      const firstService = dropdown.locator('.crs-header-dropdown__link').first()
      await firstService.hover()
      await expect(firstService).toHaveCSS('background-color', 'rgb(241, 241, 241)')
      await expect(firstService).toHaveCSS('color', 'rgb(44, 46, 52)')
      await expect(firstService).toHaveCSS('text-decoration-line', 'none')
      await servicesTrigger.click()
      await expect(dropdownChevron).toHaveCSS('transform', 'none')

      await page.goto('/ui/preview?component=entity-header')
      const description = page.locator('.crs-entity-header__description')
      await expect(description).toHaveCSS('flex-direction', 'column')
      const entityRating = page.locator('.crs-entity-header__rating')
      await expect(entityRating).toHaveAttribute('data-variant', 'summary')
      await expect(entityRating).toHaveAttribute('data-size', 'm')
      await expect(entityRating).toHaveCSS('padding-left', '0px')
      await expect(entityRating).toHaveCSS('padding-top', '0px')
      await expect(entityRating).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(entityRating).toHaveCSS('gap', '8px')
      await expect(entityRating.locator('.iconify')).toHaveCount(2)
      const descriptionGeometry = await description.evaluate((element) => {
        const text = element.querySelector('p')!.getBoundingClientRect()
        const link = element.querySelector('button')!.getBoundingClientRect()
        return { textBottom: text.bottom, linkTop: link.top }
      })
      expect(descriptionGeometry.linkTop).toBeGreaterThanOrEqual(descriptionGeometry.textBottom)
      await expect(description.locator('button')).toHaveCSS('width', `${width - 48}px`)
    }
  })

  test('keeps every SiteHeader select menu above the filter bar', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto('/ui/preview?component=site-header')
    await waitForHydration(page)

    await expect(page.locator('.crs-site-header')).toHaveCSS('overflow', 'visible')
    await expect(page.locator('.crs-site-header__blue')).toHaveCSS('overflow', 'visible')

    const triggers = page.locator('.crs-site-header__listing-form').first().locator('.crs-select__trigger')
    await expect(triggers).toHaveCount(3)

    for (let index = 0; index < 3; index += 1) {
      await triggers.nth(index).click()
      const menu = page.locator('.crs-select__menu')
      await expect(menu).toBeVisible()

      const layering = await menu.evaluate((element) => {
        const menuRect = element.getBoundingClientRect()
        const filtersRect = document.querySelector('.crs-site-header__filters')!.getBoundingClientRect()
        const x = Math.min(menuRect.right - 2, menuRect.left + 24)
        const y = Math.min(menuRect.bottom - 2, filtersRect.top + 10)
        const topmost = document.elementFromPoint(x, y)

        return {
          overlapsFilters: menuRect.bottom > filtersRect.top,
          menuIsTopmost: Boolean(topmost?.closest('.crs-select__menu'))
        }
      })

      expect(layering).toEqual({ overlapsFilters: true, menuIsTopmost: true })
      await triggers.nth(index).click()
      await expect(menu).toBeHidden()
    }
  })

  test('renders every SiteHeader family and level variant', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    const variants = [
      { variant: 'listing-hero', family: 'listing', level: 'hero', sticky: 'false', height: '472px' },
      { variant: 'listing-page', family: 'listing', level: 'page', sticky: 'false', height: '208px' },
      { variant: 'listing-page-sticky', family: 'listing', level: 'page', sticky: 'true', height: '156px' },
      { variant: 'courses-hero', family: 'courses', level: 'hero', sticky: 'false', height: '110px' },
      { variant: 'courses-page', family: 'courses', level: 'page', sticky: 'false', height: '266px' },
      { variant: 'courses-page-sticky', family: 'courses', level: 'page', sticky: 'true', height: '124px' },
      { variant: 'simple-page', family: 'simple', level: 'page', sticky: 'false', height: '64px' }
    ]

    for (const item of variants) {
      await page.goto(`/ui/preview?component=site-header&variant=${item.variant}`)
      await waitForHydration(page)
      const header = page.locator('.crs-site-header')
      await expect(header).toHaveAttribute('data-family', item.family)
      await expect(header).toHaveAttribute('data-level', item.level)
      await expect(header).toHaveAttribute('data-sticky', item.sticky)
      await expect(header).toHaveCSS('height', item.height)
    }

    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=site-header&variant=listing-page')
      await waitForHydration(page)
      const pill = page.locator('.crs-site-header__listing-pill')
      await expect(pill).toBeVisible()
      await expect.poll(async () => pill.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return { left: rect.left, width: rect.width }
      })).toEqual({ left: 24, width: width - 48 })
    }

    const coursesMenuGeometry = [
      { width: 320, height: 30, paddingTop: 8, bottomGap: 16 },
      { width: 480, height: 30, paddingTop: 8, bottomGap: 16 },
      { width: 768, height: 46, paddingTop: 0, bottomGap: 0 },
      { width: 1024, height: 46, paddingTop: 0, bottomGap: 0 }
    ]

    for (const expected of coursesMenuGeometry) {
      await page.setViewportSize({ width: expected.width, height: 900 })
      await page.goto('/ui/preview?component=site-header&variant=courses-hero')
      await waitForHydration(page)
      const geometry = await page.locator('.crs-site-header__topmenu').evaluate((element) => {
        const menu = element.getBoundingClientRect()
        const blue = document.querySelector('.crs-site-header__blue')!.getBoundingClientRect()
        const sale = element.querySelector('.crs-site-header__sale')!.getBoundingClientRect()
        const link = element.querySelector('.crs-link')!.getBoundingClientRect()
        const styles = getComputedStyle(element)
        return {
          height: menu.height,
          paddingTop: Number.parseFloat(styles.paddingTop),
          gap: Number.parseFloat(styles.gap),
          bottomGap: blue.bottom - menu.bottom,
          saleHeight: sale.height,
          centersAligned: Math.abs((sale.top + sale.height / 2) - (link.top + link.height / 2)) < 0.5
        }
      })
      expect(geometry).toEqual({
        height: expected.height,
        paddingTop: expected.paddingTop,
        gap: 16,
        bottomGap: expected.bottomGap,
        saleHeight: 22,
        centersAligned: true
      })
    }

    const topMenuLink = page.locator('.crs-site-header__topmenu .crs-link').first()
    await expect(page.locator('.crs-site-header__topmenu')).toHaveCSS('scrollbar-width', 'none')
    await expect(topMenuLink).toHaveCSS('color', 'rgb(255, 255, 255)')
    await topMenuLink.hover()
    await expect(topMenuLink).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(topMenuLink).toHaveCSS('text-decoration-line', 'none')
    await expect(topMenuLink).toHaveCSS('cursor', 'pointer')

    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=site-header&variant=courses-hero')
      await waitForHydration(page)
      const mobileTools = await page.locator('.crs-site-header__course-tools').evaluate((element) => {
        const tools = element.getBoundingClientRect()
        const button = element.querySelector('.crs-site-header__catalog')!.getBoundingClientRect()
        const icon = element.querySelector('.crs-site-header__catalog-icon')!.getBoundingClientRect()
        const search = element.querySelector('.crs-site-header__course-search')!.getBoundingClientRect()
        const logo = document.querySelector('.crs-site-header__logo-area')!.getBoundingClientRect()
        const menu = document.querySelector('.crs-site-header__topmenu') as HTMLElement
        const initialItemLeft = menu.firstElementChild!.getBoundingClientRect().left
        menu.scrollLeft = 200
        const menuRect = menu.getBoundingClientRect()
        return {
          logo: [logo.left, logo.top, logo.width, logo.height],
          tools: [tools.left, tools.top, tools.width, tools.height],
          button: [button.left, button.top, button.width, button.height],
          icon: [icon.width, icon.height],
          search: [search.left, search.top, search.width, search.height],
          gap: search.left - button.right,
          menu: [menuRect.left, menuRect.right, menu.clientWidth, initialItemLeft, menu.scrollLeft, getComputedStyle(menu).scrollbarWidth],
          menuIsScrollable: menu.scrollWidth > menu.clientWidth,
          menuChildrenDoNotShrink: [...menu.children].every(child => getComputedStyle(child).flexShrink === '0')
        }
      })
      expect(mobileTools).toEqual({
        logo: [24, 12, 138, 32],
        tools: [24, 56, width - 48, 40],
        button: [24, 56, 40, 40],
        icon: [24, 24],
        search: [72, 56, width - 96, 40],
        gap: 8,
        menu: [0, width, width, 24, 200, 'auto'],
        menuIsScrollable: true,
        menuChildrenDoNotShrink: true
      })
    }

    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=site-header&variant=courses-page')
      await waitForHydration(page)
      const mobilePage = await page.locator('.crs-site-header').evaluate((element) => {
        const header = element.getBoundingClientRect()
        const blue = element.querySelector('.crs-site-header__blue')!.getBoundingClientRect()
        const seo = element.querySelector('.crs-site-header__course-seo')!.getBoundingClientRect()
        const lastLine = element.querySelector('.crs-site-header__course-seo p')!.getBoundingClientRect()
        return {
          headerHeight: header.height,
          seoHeight: seo.height,
          bottomGap: blue.bottom - lastLine.bottom
        }
      })
      expect(mobilePage).toEqual({
        headerHeight: width === 320 ? 312 : 268,
        seoHeight: width === 320 ? 156 : 112,
        bottomGap: 24
      })
    }

    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=site-header&variant=courses-page-sticky')
      await waitForHydration(page)
      const stickyPage = await page.locator('.crs-site-header').evaluate((element) => {
        const header = element.getBoundingClientRect()
        const blue = element.querySelector('.crs-site-header__blue')!.getBoundingClientRect()
        const topbar = element.querySelector('.crs-site-header__topbar')!.getBoundingClientRect()
        const filters = element.querySelector('.crs-site-header__filters')!.getBoundingClientRect()
        return {
          headerHeight: header.height,
          blueHeight: blue.height,
          topbarHeight: topbar.height,
          filtersTop: filters.top,
          blueBottom: blue.bottom
        }
      })
      expect(stickyPage).toEqual({
        headerHeight: 168,
        blueHeight: 108,
        topbarHeight: 96,
        filtersTop: 108,
        blueBottom: 108
      })
    }
  })

  test('scrolls every SiteHeader quick-filter row when it does not fit', async ({ page }) => {
    const variants = [
      'listing-hero',
      'listing-page',
      'listing-page-sticky',
      'courses-page',
      'courses-page-sticky'
    ]

    for (const width of [320, 480, 768]) {
      await page.setViewportSize({ width, height: 900 })
      for (const variant of variants) {
        await page.goto(`/ui/preview?component=site-header&variant=${variant}`)
        await waitForHydration(page)
        const filters = await page.locator('.crs-site-header__filters > div').evaluate((element) => {
          const row = element as HTMLElement
          const overflows = row.scrollWidth > row.clientWidth
          row.scrollLeft = row.scrollWidth
          return {
            overflowX: getComputedStyle(row).overflowX,
            touchAction: getComputedStyle(row).touchAction,
            childrenDoNotShrink: [...row.children].every(child => getComputedStyle(child).flexShrink === '0'),
            overflows,
            scrollsWhenNeeded: !overflows || row.scrollLeft > 0
          }
        })
        expect(filters).toEqual({
          overflowX: 'auto',
          touchAction: 'pan-x',
          childrenDoNotShrink: true,
          overflows: width === 320,
          scrollsWhenNeeded: true
        })
      }
    }
  })

  test('keeps the filter modal on the canonical canvas', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 620 })
    await page.goto('/ui/preview?component=filter-modal')
    await expect(page.getByRole('dialog')).toBeVisible()

    await expect.poll(async () => page.getByRole('dialog').evaluate(element => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })).toEqual({ x: 0, y: 0, width: 320, height: 620 })
    await expect(page.locator('.crs-filter-modal__footer')).toHaveCSS('height', '104px')
    const closeButton = page.getByRole('button', { name: 'Закрыть' })
    await expect(closeButton).toBeVisible()
    await expect(closeButton).toHaveCSS('border-top-width', '0px')
    await expect.poll(async () => closeButton.evaluate(element => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })).toEqual({ x: 272, y: 24, width: 24, height: 24 })
    await expect.poll(async () => {
      const positions = await Promise.all(['Курс', 'Вебинар', 'Симулятор'].map(name => page.getByRole('button', { name, exact: true }).evaluate(element => element.getBoundingClientRect().top)))
      return new Set(positions).size
    }).toBe(1)

    await page.setViewportSize({ width: 1024, height: 800 })
    await expect.poll(async () => page.getByRole('dialog').evaluate(element => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })).toEqual({ x: 228, y: 0, width: 568, height: 620 })
    await expect.poll(async () => closeButton.evaluate(element => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })).toEqual({ x: 748, y: 24, width: 24, height: 24 })
  })

  test('matches reviewed card and table geometry', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto('/ui/preview?component=person-card')
    const person = await page.locator('.crs-person-card').boundingBox()
    expect(person?.width).toBe(260)
    expect(person?.height).toBe(365)

    await page.goto('/ui/preview?component=review-card')
    const review = await page.locator('.crs-review-card').boundingBox()
    expect(review?.width).toBe(260)
    expect(review?.height).toBe(503)

    await page.goto('/ui/preview?component=rating-table')
    await expect(page.locator('.crs-rating-table__row')).toHaveCount(10)
  })

  test('uses Nuxt UI behavior for overlays', async ({ page }) => {
    await page.goto('/ui?component=modal')
    await waitForHydration(page)

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Информация' })).toBeVisible()
  })

  test('renders Cyrillic component copy without replacement characters', async ({ page }) => {
    const replacementCharacter = String.fromCodePoint(0xfffd)
    await page.goto('/ui?component=feedback-form')
    await waitForHydration(page)

    await expect(page.getByRole('heading', { name: 'Не нашли, что хотели?' })).toBeVisible()
    await expect(page.getByLabel('Почта')).toHaveAttribute('placeholder', 'Почта')
    await expect(page.locator('.catalog-demo')).not.toContainText(replacementCharacter)
  })

  test('browses Tabler Outline icons in batches and copies an icon name', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/ui')
    await waitForHydration(page)
    await page.locator('.catalog-sidebar').getByRole('button', { name: /Icons/ }).click()

    await expect(page).toHaveURL(/\/ui(?:\?.*)?$/)
    await expect(page.locator('.catalog-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Icons', exact: true })).toBeVisible()
    await expect(page.locator('.icon-card')).toHaveCount(200)
    await expect(page.getByText(/Показано 200 из/)).toBeVisible()
    expect((await page.locator('.icon-card small').allTextContents()).some(name => name.includes('-filled'))).toBe(false)

    await page.getByRole('button', { name: 'Показать ещё 200' }).click()
    await expect(page.locator('.icon-card')).toHaveCount(400)

    await page.getByPlaceholder('Поиск по названию, например settings').fill('settings')
    const settingsCard = page.getByRole('button', { name: 'Скопировать i-tabler-settings', exact: true })
    await expect(settingsCard).toBeVisible()
    await settingsCard.click()
    await expect(settingsCard).toContainText('Скопировано')
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe('i-tabler-settings')
  })

  test('shows editable foundation tokens inside the catalog', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/ui?foundation=colors')
    await waitForHydration(page)

    await expect(page.locator('.catalog-sidebar')).toBeVisible()
    await expect(page.locator('.foundations-page h1')).toHaveText('Цвета')
    await expect(page.locator('.foundations-source')).toHaveCount(0)
    await expect(page.locator('.color-card')).toHaveCount(45)
    await expect(page.locator('.foundation-sections > .unused-section')).toHaveCount(1)
    await expect(page.locator('.foundation-sections > .unused-section h2')).toHaveText('Пока не используются')
    await expect(page.locator('.color-card[data-unused="true"]')).toHaveCount(6)
    const blue = page.locator('.color-card').filter({ hasText: 'blue-500' })
    await expect(blue.locator('.token-editor')).toHaveValue('#346ef4')
    await blue.locator('.copy-token').click()
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe('--crs-blue-500: #346ef4;')
    await blue.locator('.token-editor').fill('#ff0000')
    await blue.locator('.token-editor').press('Enter')
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--crs-blue-500').trim())).toBe('#ff0000')
    await page.reload()
    await waitForHydration(page)
    await expect(page.locator('.color-card').filter({ hasText: 'blue-500' }).locator('.token-editor')).toHaveValue('#ff0000')
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--crs-blue-500').trim())).toBe('#ff0000')
    await page.getByRole('button', { name: 'Скопировать CSS' }).click()
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('--crs-blue-500: #ff0000;')
    await page.getByRole('button', { name: 'Сбросить правки' }).click()
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--crs-blue-500').trim())).toBe('#346ef4')

    await page.locator('.catalog-sidebar').getByRole('button', { name: /Типографика/ }).click()
    await expect(page.locator('.foundations-page h1')).toHaveText('Типографика')
    await expect(page.locator('.type-row')).toHaveCount(8)
    await expect(page.locator('.type-list > .unused-section')).toContainText('Все токены типографики используются.')
    await expect(page.locator('.type-sample').first()).toHaveCSS('font-size', '44px')
    await expect(page.locator('.type-sample').first()).toHaveCSS('line-height', '48px')

    await page.locator('.catalog-sidebar').getByRole('button', { name: /Скругления/ }).click()
    await expect(page.locator('.radius-grid .token-card')).toHaveCount(9)
    await expect(page.locator('.radius-page > .unused-section')).toContainText('Все токены скруглений используются.')
    await expect(page.locator('.radius-grid .token-card[data-unused="true"]')).toHaveCount(0)
    const cardRadius = page.locator('.radius-grid .token-card').filter({ hasText: 'radius-24' })
    await expect(cardRadius.locator('.token-editor')).toHaveValue('1.5rem')

    await page.locator('.catalog-sidebar').getByRole('button', { name: /Отступы и сетка/ }).click()
    await expect(page.locator('.spacing-list article')).toHaveCount(12)
    await expect(page.locator('.spacing-page > .unused-section')).toContainText('Все токены отступов и сетки используются.')

    await page.locator('.catalog-sidebar').getByRole('button', { name: /Раскладка\/Адаптивность/ }).click()
    await expect(page.locator('.foundations-page h1')).toHaveText('Раскладка/Адаптивность')
    await page.locator('.catalog-sidebar').getByRole('button', { name: /^Раскладка/ }).last().click()
    await expect(page.locator('.catalog-list')).toBeVisible()
  })

  test('keeps the catalog within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/ui?component=button')
    await waitForHydration(page)

    const sizes = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth
    }))
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)
    await expect(page.getByRole('heading', { name: 'Button' })).toBeVisible()
  })

  test('keeps the reviewed Courses details aligned with the guide', async ({ page }) => {
    await page.goto('/ui/preview?component=entity-logo')
    const logos = page.locator('.avatar-scale .crs-logo')
    await expect(logos).toHaveCount(8)
    await expect(logos.first()).toHaveAttribute('src', '/courses/avatar-default-company.svg')
    expect(await logos.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))).toEqual([100, 68, 56, 48, 40, 36, 32, 24])

    await page.goto('/ui/preview?component=faq-item')
    const faqChevron = page.locator('.crs-faq-item__chevron')
    await expect(faqChevron).toHaveCSS('transform', /matrix/)
    await page.locator('.crs-faq-item summary').click()
    await expect(faqChevron).toHaveCSS('transform', 'none')

    await page.goto('/ui/preview?component=faq-block')
    await expect(page.locator('.crs-faq-block')).toHaveCSS('gap', '16px')
    await expect(page.locator('.crs-faq-block__list')).toHaveCSS('gap', '12px')

    await page.goto('/ui/preview?component=loader')
    await expect(page.locator('.crs-loader__icon')).toHaveCSS('animation-name', /^crs-loader-spin/)

    await page.goto('/ui/preview?component=search-input')
    await expect(page.locator('.crs-search svg')).toHaveCount(0)

    await page.goto('/ui/preview?component=promo-card')
    expect((await page.locator('.crs-promo').boundingBox())?.height).toBe(268)

    await page.goto('/ui/preview?component=vacancy-card')
    expect((await page.locator('.crs-vacancy-card .crs-logo').boundingBox())?.width).toBe(32)

    await page.goto('/ui/preview?component=ad-slot')
    const ad = await page.locator('.crs-ad-card').first().boundingBox()
    expect(ad?.width).toBe(568)
    expect(ad?.height).toBe(232)

    await page.goto('/ui/preview?component=catalog-menu')
    await expect(page.locator('.crs-catalog-menu')).toHaveCSS('display', 'grid')
    await expect(page.locator('.crs-catalog-menu__groups .crs-catalog-menu__group')).toHaveCount(9)

    await page.goto('/ui/preview?component=header-dropdown')
    expect((await page.locator('.crs-header-dropdown__panel').boundingBox())?.width).toBe(178)
    await expect(page.locator('.crs-header-dropdown__link')).toHaveCount(4)
  })

  test('keeps the revised cards, overlays and shared primitives responsive', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    for (const component of ['review-card', 'school-card', 'vacancy-card', 'promo-card', 'profession-card', 'person-card']) {
      await page.goto(`/ui/preview?component=${component}`)
      const card = page.locator(`.crs-${component.replace('-card', '')}${component === 'promo-card' ? '' : '-card'}`).first()
      expect((await card.boundingBox())?.width).toBe(432)
    }

    await page.goto('/ui/preview?component=step-card')
    const step = page.locator('.crs-learning')
    await expect(step.locator('.crs-learning__number')).toHaveText('1')
    await expect(step).toHaveAttribute('open', '')
    await step.locator('summary').click()
    await expect(step).not.toHaveAttribute('open', '')

    await page.goto('/ui/preview?component=filter-modal')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(480)
    await expect.poll(() => page.locator('.recommendations').evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
    const recommendationTiles = page.locator('.recommendations .crs-tile--image-cover')
    await expect(recommendationTiles).toHaveCount(4)
    await expect(recommendationTiles.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await recommendationTiles.first().click()
    await expect(recommendationTiles.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(recommendationTiles.nth(2)).toHaveAttribute('aria-pressed', 'false')
    const filterModalGeometry = await page.locator('.crs-filter-modal').evaluate((modal) => {
      const dialog = modal.closest('[role="dialog"]')!.getBoundingClientRect()
      const recommendations = modal.querySelector('.recommendations') as HTMLElement
      const recommendationRect = recommendations.getBoundingClientRect()
      recommendations.scrollLeft = recommendations.scrollWidth
      const lastTile = recommendations.lastElementChild!.getBoundingClientRect()
      const price = modal.querySelector('.price')!.getBoundingClientRect()
      const fields = [...modal.querySelectorAll('.crs-filter-modal__price-field')].map((element) => {
        const field = element.getBoundingClientRect()
        const control = element.querySelector('.crs-input-wrap')!.getBoundingClientRect()
        return {
          width: field.width,
          edges: [field.left, field.right],
          controlEdges: [control.left, control.right],
          overflow: getComputedStyle(element).overflow
        }
      })
      return {
        dialogEdges: [dialog.left, dialog.right],
        recommendationEdges: [recommendationRect.left, recommendationRect.right],
        lastTileRight: lastTile.right,
        priceEdges: [price.left, price.right],
        fields
      }
    })
    expect(filterModalGeometry.recommendationEdges).toEqual(filterModalGeometry.dialogEdges)
    expect(filterModalGeometry.lastTileRight).toBeLessThanOrEqual(filterModalGeometry.dialogEdges[1] - 23)
    expect(Math.abs(filterModalGeometry.fields[0]!.width - filterModalGeometry.fields[1]!.width)).toBeLessThanOrEqual(1)
    for (const { edges: [left, right], controlEdges, overflow } of filterModalGeometry.fields) {
      expect(left).toBeGreaterThanOrEqual(filterModalGeometry.priceEdges[0] - 1)
      expect(right).toBeLessThanOrEqual(filterModalGeometry.priceEdges[1] + 1)
      expect(controlEdges[0]).toBeGreaterThanOrEqual(left - 1)
      expect(controlEdges[1]).toBeLessThanOrEqual(right + 1)
      expect(overflow).toBe('visible')
    }

    await page.goto('/ui/preview?component=tile-filter')
    const coverTile = page.locator('.crs-tile--image-cover')
    await expect(coverTile).toHaveCount(1)
    await expect(coverTile.locator('.crs-tile__surface')).toHaveCSS('padding', '0px')
    const coverGeometry = await coverTile.evaluate((tile) => {
      const surface = tile.querySelector('.crs-tile__surface')!.getBoundingClientRect()
      const image = tile.querySelector('.crs-tile__image')!.getBoundingClientRect()
      return { surface: [surface.width, surface.height], image: [image.width, image.height] }
    })
    expect(coverGeometry.image).toEqual(coverGeometry.surface.map(size => size - 2))

    await page.goto('/ui/preview?component=header-dropdown')
    await expect(page.locator('.crs-header-dropdown__link').first()).toHaveCSS('font-size', '14px')

    await page.goto('/ui/preview?component=tooltip')
    await page.locator('.crs-tooltip__trigger').hover()
    await expect(page.locator('.crs-tooltip')).toHaveAttribute('data-placement', /right|bottom/)
  })

  test('uses the required carousel columns at every showcase width', async ({ page }) => {
    for (const [width, expectedVisible] of [[320, 1], [480, 1], [768, 3], [1024, 4]] as const) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/ui/preview?component=carousel')
      const visibleCards = await page.locator('.crs-carousel').evaluate((carousel) => {
        const track = carousel.querySelector('.crs-carousel__track')!.getBoundingClientRect()
        return [...carousel.querySelectorAll('.crs-course-card')].filter((card) => {
          const rect = card.getBoundingClientRect()
          return rect.left >= track.left - 1 && rect.right <= track.right + 1
        }).length
      })
      expect(visibleCards).toBe(expectedVisible)
    }
  })

  test('keeps mobile catalog tiles top-aligned with edge artwork', async ({ page }) => {
    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/ui/preview?component=catalog-menu')
      const geometry = await page.locator('.crs-catalog-menu__tiles .crs-tile--catalog').first().evaluate((tile) => {
        const tileRect = tile.getBoundingClientRect()
        const labelRect = tile.querySelector('.crs-tile__label')!.getBoundingClientRect()
        const imageRect = tile.querySelector('.crs-tile__image')!.getBoundingClientRect()
        return {
          labelTop: labelRect.top - tileRect.top,
          imageRight: tileRect.right - imageRect.right,
          imageBottom: tileRect.bottom - imageRect.bottom,
          imageWidth: imageRect.width,
          imageHeight: imageRect.height,
          tileWidth: tileRect.width,
          tileHeight: tileRect.height
        }
      })
      expect(geometry.labelTop).toBeLessThanOrEqual(9)
      expect(Math.abs(geometry.imageRight)).toBeLessThanOrEqual(1)
      expect(Math.abs(geometry.imageBottom)).toBeLessThanOrEqual(1)
      expect(Math.abs(geometry.imageWidth - geometry.tileWidth)).toBeLessThanOrEqual(1)
      expect(Math.abs(geometry.imageHeight - geometry.tileHeight)).toBeLessThanOrEqual(1)
      await expect(page.locator('.crs-catalog-menu__tiles .crs-tile--catalog').first()).not.toHaveAttribute('aria-pressed')
    }
  })

  test('uses the regular ButtonGroup geometry in CatalogMenu', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto('/ui/preview?component=catalog-menu')
    const geometry = await page.locator('.crs-catalog-menu__modes').evaluate((group) => {
      const groupRect = group.getBoundingClientRect()
      const item = group.querySelector('.crs-button-group__item')!
      const itemRect = item.getBoundingClientRect()
      return {
        fontSize: getComputedStyle(item).fontSize,
        top: itemRect.top - groupRect.top,
        bottom: groupRect.bottom - itemRect.bottom
      }
    })
    expect(geometry.fontSize).toBe('14px')
    expect(Math.abs(geometry.top - geometry.bottom)).toBeLessThanOrEqual(1)
  })

  test('keeps level icons clear of text and exposes one Chip family', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/ui/preview?component=filter-modal')
    const level = page.locator('.levels .crs-tile').first()
    await level.scrollIntoViewIfNeeded()
    const levelGeometry = await level.evaluate((tile) => {
      const icon = tile.querySelector('.crs-tile__level-icon')!.getBoundingClientRect()
      const copy = tile.querySelector(':scope > span:nth-child(2)')!.getBoundingClientRect()
      return { iconRight: icon.right, copyLeft: copy.left }
    })
    expect(levelGeometry.copyLeft).toBeGreaterThanOrEqual(levelGeometry.iconRight + 11)

    await page.goto('/ui/preview?component=chip')
    await expect(page.locator('.crs-chip')).toHaveCount(10)
    await expect(page.locator('.crs-chip--counter')).toHaveText('+12')
    await expect(page.getByText('Партнёрский', { exact: true })).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(page.locator('.crs-chip--s')).toHaveCSS('height', '20px')
  })

  test('scales course artwork and matches Chip and RatingBadge guide geometry', async ({ page }) => {
    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/ui/preview?component=carousel')
      const cover = await page.locator('.crs-course-card__cover').first().boundingBox()
      expect(cover).not.toBeNull()
      expect(Math.abs((cover!.width / cover!.height) - (260 / 148))).toBeLessThan(0.01)
    }

    await page.goto('/ui/preview?component=chip')
    const removable = page.locator('.crs-chip--removable')
    await expect(removable).toHaveCSS('padding-left', '12px')
    await expect(removable).toHaveCSS('padding-right', '4px')

    await page.goto('/ui/preview?component=rating-badge')
    const rating = page.locator('.crs-rating[data-variant="summary"][data-size="s"]')
    await expect(rating).toHaveCSS('gap', '8px')
    await expect(rating.locator('> span').first()).toHaveCSS('gap', '4px')
    await expect(rating.locator('> span').last()).toHaveCSS('gap', '2px')
    await expect(rating.locator('.iconify').first()).toHaveCSS('color', 'rgb(255, 150, 12)')
    await expect(rating.locator('.iconify').last()).toHaveCSS('color', 'rgb(166, 167, 169)')
    const mediumRating = page.locator('.crs-rating[data-variant="summary"][data-size="m"]')
    await expect(mediumRating).toHaveCSS('font-size', '14px')
    await expect(mediumRating).toHaveCSS('padding', '0px')
    await expect(mediumRating).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto('/ui/preview?component=tile-filter')
    const surface = await page.getByRole('button', { name: 'С внутренними отступами' }).locator('.crs-tile__surface').boundingBox()
    expect(surface?.width).toBe(122)
    expect(surface?.height).toBe(122)
  })

  test('keeps the revised mobile overlays and compact controls inside their containers', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/ui/preview?component=modal')
    const modal = page.locator('.crs-modal-content')
    await expect(modal).toBeVisible()
    const modalBox = await modal.boundingBox()
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    expect(modalBox?.width).toBe(320)
    expect(Math.abs(modalBox?.x || 0)).toBeLessThanOrEqual(1)
    expect(Math.abs((modalBox?.y || 0) + (modalBox?.height || 0) - viewportHeight)).toBeLessThanOrEqual(1)
    await expect(modal.locator('[data-slot="close"]')).toHaveCount(0)
    await expect(modal.locator('[data-slot="body"]')).toHaveCSS('padding', '0px 24px')
    await expect(modal.locator('[data-slot="header"]')).toHaveCSS('border-bottom-width', '0px')
    await expect(modal.locator('[data-slot="footer"]')).toHaveCSS('border-top-width', '0px')
    const actionWidths = await modal.locator('.crs-modal-actions .crs-button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().width))
    expect(actionWidths).toHaveLength(2)
    expect(Math.abs(actionWidths[0]! - actionWidths[1]!)).toBeLessThanOrEqual(1)

    await page.setViewportSize({ width: 480, height: 800 })
    await page.goto('/ui/preview?component=modal')
    const wideMobileBox = await page.locator('.crs-modal-content').boundingBox()
    expect(wideMobileBox?.width).toBe(480)
    expect(Math.abs(wideMobileBox?.x || 0)).toBeLessThanOrEqual(1)

    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto('/ui/preview?component=modal')
    await expect(page.locator('.crs-modal-content [data-slot="body"]')).toHaveCSS('padding', '0px 24px')

    await page.setViewportSize({ width: 320, height: 180 })
    await page.goto('/ui/preview?component=modal')
    const compactModal = page.locator('.crs-modal-content')
    await expect(compactModal.locator('[data-slot="body"]')).toHaveCSS('padding', '16px 24px')
    await expect(compactModal.locator('[data-slot="header"]')).toHaveCSS('border-bottom-width', '1px')
    await expect(compactModal.locator('[data-slot="footer"]')).toHaveCSS('border-top-width', '1px')

    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/ui/preview?component=price-sheet')
    await expect(page.locator('.crs-price-sheet__body')).toBeVisible()
    await expect(page.locator('.crs-price-sheet h2')).toHaveCSS('font-size', '20px')
    await expect(page.locator('.crs-price-sheet h2')).toHaveCSS('line-height', '24px')
    const priceHandle = page.locator('.crs-price-sheet__handle')
    await expect(priceHandle).toHaveCSS('width', '64px')
    await expect(priceHandle).toHaveCSS('height', '4px')
    await expect(priceHandle).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    const priceGeometry = await page.locator('.crs-price-sheet__body').evaluate((body) => {
      const bodyRect = body.getBoundingClientRect()
      return Array.from(body.querySelectorAll('.crs-field, .crs-control, input, .crs-select')).map((child) => {
        const rect = child.getBoundingClientRect()
        return { left: rect.left, right: rect.right, bodyLeft: bodyRect.left, bodyRight: bodyRect.right }
      })
    })
    for (const item of priceGeometry) {
      expect(item.left).toBeGreaterThanOrEqual(item.bodyLeft - 1)
      expect(item.right).toBeLessThanOrEqual(item.bodyRight + 1)
    }

    await page.goto('/ui/preview?component=promo-code-modal')
    const singleActionGeometry = await page.locator('.crs-modal-actions').evaluate((actions) => {
      const action = actions.firstElementChild!.getBoundingClientRect()
      const container = actions.getBoundingClientRect()
      return { action: action.width, container: container.width }
    })
    expect(Math.abs(singleActionGeometry.action - singleActionGeometry.container)).toBeLessThanOrEqual(1)

    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/ui/preview?component=course-card')
      const card = await page.locator('.crs-course-card').boundingBox()
      const frameBody = await page.locator('body').boundingBox()
      expect(card?.width).toBe(frameBody!.width - 48)
      const cover = await page.locator('.crs-course-card__cover').boundingBox()
      expect(Math.abs((cover!.width / cover!.height) - (260 / 148))).toBeLessThan(0.01)
      await expect(page.locator('.crs-course-card .crs-rating')).toHaveCSS('gap', '8px')
    }

    await page.goto('/ui/preview?component=filter-chip')
    await expect(page.locator('.crs-filter-chip__icon').first()).toHaveCSS('color', 'rgb(166, 167, 169)')

    await page.goto('/ui/preview?component=filter-modal')
    const levelIcon = page.locator('.crs-tile__level-icon').first()
    await expect(levelIcon).toHaveCSS('width', '24px')
    await expect(levelIcon).toHaveCSS('height', '24px')
    await expect(levelIcon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('uses plain article metadata and one FilterChip family with a softer review fade', async ({ page }) => {
    await page.goto('/ui/preview?component=article-card')
    await expect(page.locator('.crs-article-card .crs-chip')).toHaveCount(0)
    const articleType = page.locator('.crs-article-card__type')
    await expect(articleType).toHaveText('Статья')
    await expect(articleType).toHaveCSS('color', 'rgb(44, 46, 52)')
    await expect(articleType).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    for (const width of [320, 480]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/ui/preview?component=article-card')
      const article = await page.locator('.crs-article-card').boundingBox()
      const previewBody = await page.locator('body').boundingBox()
      expect(article?.width).toBe(previewBody!.width - 48)
      const image = await page.locator('.crs-article-card__image').boundingBox()
      expect(Math.abs((image!.width / image!.height) - (16 / 9))).toBeLessThan(0.01)
    }

    await page.goto('/ui/preview?component=filter-chip')
    await waitForHydration(page)
    await expect(page.locator('.crs-filter-chip')).toHaveCount(9)
    await expect(page.getByRole('heading', { name: 'Фильтры' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Варианты с иконками' })).toBeVisible()
    const iconOnly = page.getByRole('button', { name: 'Сортировка' })
    await expect(iconOnly).toHaveCSS('padding-left', '12px')
    await expect(iconOnly).toHaveCSS('padding-right', '12px')
    expect((await iconOnly.boundingBox())?.width).toBe(50)
    const iconWithText = page.locator('.crs-filter-chip').filter({ hasText: 'С иконкой' })
    await expect(iconWithText).toHaveCSS('gap', '4px')
    const dropdownChip = page.getByRole('button', { name: 'Школа' })
    await expect(dropdownChip).toHaveCSS('padding-right', '8px')
    await expect(dropdownChip.locator('.crs-filter-chip__chevron')).toHaveCSS('width', '20px')
    await dropdownChip.click()
    const dropdownMenu = page.getByRole('menu')
    await expect(dropdownMenu).toBeVisible()
    await expect(page.locator('.crs-filter-chip--dropdown')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.crs-filter-chip--dropdown')).toHaveAttribute('data-state', 'open')
    await expect(page.locator('.crs-filter-chip--dropdown')).toHaveCSS('background-color', 'rgb(241, 241, 241)')
    await expect(dropdownMenu).toHaveCSS('width', '290px')
    await expect(dropdownMenu).toHaveCSS('height', '186px')
    await expect(dropdownMenu).toHaveCSS('padding', '8px 0px')
    await expect(dropdownMenu).toHaveCSS('border-radius', '12px')
    const dropdownItems = dropdownMenu.getByRole('menuitem')
    await expect(dropdownItems).toHaveCount(4)
    await expect(dropdownItems.first()).toHaveCSS('height', '42px')
    await expect(dropdownItems.first()).toHaveCSS('padding', '8px 24px 8px 16px')
    await expect(dropdownItems.first()).toHaveCSS('font-size', '16px')
    await expect(dropdownItems.first()).toHaveCSS('line-height', '22px')

    await page.goto('/ui/preview?component=select')
    await waitForHydration(page)
    await page.locator('.crs-select__trigger').click()
    const selectMenu = page.locator('.crs-select__menu')
    await expect(selectMenu).toBeVisible()
    const selectRow = selectMenu.getByRole('option').first()
    const selectGeometry = await Promise.all([selectMenu.boundingBox(), selectRow.boundingBox()])
    expect(Math.abs(selectGeometry[1]!.x - selectGeometry[0]!.x - 1)).toBeLessThanOrEqual(1)
    expect(Math.abs((selectGeometry[0]!.x + selectGeometry[0]!.width) - (selectGeometry[1]!.x + selectGeometry[1]!.width) - 1)).toBeLessThanOrEqual(1)

    await page.goto('/ui?component=filter-chip')
    await expect(page.locator('.catalog-list').getByRole('button', { name: /^Tab/ })).toHaveCount(0)

    await page.goto('/ui/preview?component=review-card')
    await expect(page.locator('.crs-review-card__course .crs-chip')).toHaveCount(1)
    const fade = page.locator('.crs-review-card__text > span')
    await expect(fade).toHaveCSS('height', '100px')
    const reviewBottomGap = await page.locator('.crs-review-card').evaluate((card) => {
      const button = card.querySelector('.crs-review-card__text button')!
      return card.getBoundingClientRect().bottom - button.getBoundingClientRect().bottom
    })
    expect(Math.abs(reviewBottomGap - 24)).toBeLessThanOrEqual(1)
  })

  test('reuses input, chip and grouped-control primitives without changing their geometry', async ({ page }) => {
    await page.goto('/ui/preview?component=text-input')
    await waitForHydration(page)
    const inputIcons = page.locator('.crs-input-wrap .iconify')
    await expect(inputIcons).toHaveCount(5)
    expect(await inputIcons.evaluateAll(icons => icons.map((icon) => {
      const rect = icon.getBoundingClientRect()
      return [rect.width, rect.height]
    }))).toEqual(Array.from({ length: 5 }, () => [24, 24]))
    const inputAction = page.getByRole('button', { name: 'Очистить поле' })
    await expect(inputAction).toHaveClass(/crs-icon-button--ghost/)
    await inputAction.hover()
    await expect(inputAction).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await inputAction.click()
    await expect(page.getByLabel('Кликабельная иконка')).toHaveValue('')
    await expect(page.locator('.crs-input-wrap').first()).toHaveCSS('height', '40px')

    await page.goto('/ui/preview?component=feedback-form')
    await waitForHydration(page)
    await expect(page.locator('.crs-feedback-form .crs-button-group')).toHaveCount(1)
    await expect(page.locator('.crs-feedback-form .crs-button-group')).toHaveCSS('min-height', '48px')
    const feedbackIcons = page.locator('.crs-feedback-form .crs-input-wrap .iconify')
    await expect(feedbackIcons).toHaveCount(2)
    await expect(feedbackIcons.first()).toHaveCSS('width', '24px')
    await expect(feedbackIcons.first()).toHaveCSS('height', '24px')

    await page.goto('/ui/preview?component=button-group')
    await waitForHydration(page)
    await expect(page.locator('.crs-button-group[role="group"]')).toHaveCount(4)
    await expect(page.locator('.crs-button-group--light')).toHaveCount(2)
    await expect(page.locator('.crs-button-group--hero')).toHaveCount(2)
    await expect(page.locator('.crs-button-group--block')).toHaveCount(2)
    await expect(page.locator('.crs-button-group--hero').first()).toHaveCSS('height', '40px')
    await expect(page.locator('.crs-button-group--hero .crs-button-group__item').first()).toHaveCSS('height', '40px')
    await expect(page.locator('.crs-button-group--hero .crs-button-group__item.selected').first()).toHaveCSS('box-shadow', 'none')

    await page.goto('/ui/preview?component=multi-select')
    await waitForHydration(page)
    const multi = page.getByRole('combobox')
    await multi.click()
    await page.getByRole('option', { name: 'JavaScript' }).click()
    await page.getByRole('option', { name: 'Vue' }).click()
    await page.keyboard.press('Escape')
    await expect(multi.locator('.crs-chip')).toHaveCount(2)
    await expect(multi.locator('.crs-chip').first()).toHaveCSS('min-height', '32px')
    await multi.getByRole('button', { name: 'Удалить' }).first().click()
    await expect(multi.locator('.crs-chip')).toHaveCount(1)
    await expect(multi).toHaveAttribute('aria-expanded', 'false')
  })

  test('renders tokenized toast variants and supports closing them', async ({ page }) => {
    await page.goto('/ui/preview?component=toast')
    await waitForHydration(page)

    const toasts = page.locator('.crs-toast')
    await expect(toasts).toHaveCount(4)
    await expect(toasts.nth(0)).toHaveCSS('background-color', 'rgb(52, 110, 244)')
    await expect(toasts.nth(1)).toHaveCSS('background-color', 'rgb(52, 178, 79)')
    await expect(toasts.nth(2)).toHaveCSS('background-color', 'rgb(255, 150, 12)')
    await expect(toasts.nth(3)).toHaveCSS('background-color', 'rgb(232, 68, 68)')
    await expect(toasts.first()).toHaveCSS('padding', '12px 16px')
    await expect(toasts.first()).toHaveCSS('border-radius', '12px')
    await expect(toasts.first().locator('.crs-toast__text')).toHaveCSS('font-size', '16px')
    await expect(toasts.first().locator('.crs-toast__text')).toHaveCSS('line-height', '22px')
    await expect(toasts.first().locator('.crs-toast__close .iconify')).toHaveCSS('width', '24px')

    await toasts.first().getByRole('button').click()
    await expect(toasts).toHaveCount(3)
  })

  test('keeps LinkGrid link styling stable on hover', async ({ page }) => {
    await page.goto('/ui/preview?component=link-grid')
    await waitForHydration(page)

    const link = page.locator('.crs-link-grid__link').first()
    const initialColor = await link.evaluate(element => getComputedStyle(element).color)
    await link.hover()
    await expect(link).toHaveCSS('color', initialColor)
    await expect(link).toHaveCSS('text-decoration-line', 'none')
  })

  test('renders closable informer variants with responsive geometry', async ({ page }) => {
    await page.goto('/ui/preview?component=informer')
    await waitForHydration(page)

    const informers = page.locator('.crs-informer')
    await expect(informers).toHaveCount(4)
    await expect(informers.first()).toHaveCSS('width', '280px')
    await expect(informers.first()).toHaveCSS('padding', '16px')
    await expect(informers.first()).toHaveCSS('border-radius', '12px')
    await expect(informers.first().locator('.crs-informer__status')).toHaveCSS('width', '24px')
    await expect(informers.first().locator('.crs-informer__title')).toHaveCSS('font-size', '16px')
    await expect(informers.first().locator('.crs-informer__description')).toHaveCSS('font-size', '14px')
    const closeButtons = page.locator('.crs-informer__close')
    await expect(closeButtons).toHaveCount(4)
    await expect(informers.first().locator('.crs-informer__links')).toHaveCSS('gap', '8px')
    for (const [index, color] of ['rgb(52, 110, 244)', 'rgb(52, 178, 79)', 'rgb(255, 150, 12)', 'rgb(232, 68, 68)'].entries()) {
      await expect(closeButtons.nth(index)).toHaveCSS('color', color)
      await expect(closeButtons.nth(index)).toHaveCSS('opacity', '0.6')
    }

    await page.setViewportSize({ width: 320, height: 900 })
    await expect(informers.first()).toBeVisible()
    const fitsViewport = await informers.first().evaluate(element => element.getBoundingClientRect().right <= document.documentElement.clientWidth)
    expect(fitsViewport).toBe(true)

    await informers.first().getByRole('button').click()
    await expect(informers).toHaveCount(3)
  })
})
