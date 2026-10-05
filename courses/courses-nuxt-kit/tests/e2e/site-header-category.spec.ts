import { expect, test } from '@playwright/test'

// Accepted inline breadcrumbs reduce the old forced-row height on narrow phones.
const acceptedFilterTop: Record<number, number> = {
  320: 288,
  393: 268,
  480: 264,
  744: 244,
  767: 244,
  768: 206,
  1024: 206
}

const acceptedVerticalLayout: Record<number, [number, number, number, number]> = {
  320: [108, 188, 248, 288],
  393: [108, 168, 228, 268],
  480: [108, 164, 224, 264],
  744: [108, 144, 204, 244],
  767: [108, 144, 204, 244],
  768: [64, 100, 166, 206],
  1024: [64, 100, 166, 206]
}

for (const width of Object.keys(acceptedFilterTop).map(Number)) {
  test(`course category header follows the production composition at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui/preview?component=site-header&variant=courses-page')
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown } | null)?.__vue_app__))

    const header = page.locator('.crs-site-header')
    const contributors = header.locator('.crs-site-header__contributors')
    const namedContributors = contributors.locator('.crs-site-header__contributor')
    const compactStack = contributors.locator('.crs-site-header__contributors-more--compact')
    const desktopStack = contributors.locator('.crs-site-header__contributors-more--desktop')
    const addContributor = contributors.locator('.crs-site-header__contributors-add:visible')

    await expect(header.locator('.crs-breadcrumbs li')).toHaveCount(3)
    await expect(header.locator('.crs-site-header__course-seo h1')).toHaveText('Курсы по ChatGPT')
    await expect(header.locator('.crs-site-header__verified')).toBeVisible()
    await expect(header.locator('.crs-site-header__updated')).toContainText('30.09.2026')

    if (width < 768) {
      await expect(namedContributors.first()).toBeHidden()
      await expect(header.locator('.crs-site-header__contributors-label')).toBeVisible()
      await expect(compactStack).toBeVisible()
      await expect(header.locator('.crs-site-header__verified-short')).toBeVisible()
      await expect(header.locator('.crs-site-header__verified-full')).toBeHidden()
      await expect(header.locator('.crs-site-header__updated span')).toBeHidden()
      await expect(addContributor).toHaveCount(0)
    } else if (width < 1024) {
      await expect(namedContributors.first()).toBeVisible()
      expect((await namedContributors.first().locator('.crs-avatar').boundingBox())?.height).toBe(20)
      await expect(namedContributors.nth(1)).toBeHidden()
      await expect(compactStack).toBeVisible()
      await expect(addContributor).toHaveCount(1)
    } else {
      await expect(namedContributors).toHaveCount(2)
      await expect(namedContributors.nth(1)).toBeVisible()
      expect((await namedContributors.first().locator('.crs-avatar').boundingBox())?.height).toBe(20)
      await expect(desktopStack).toBeVisible()
      await expect(compactStack).toBeHidden()
      await expect(addContributor).toHaveCount(1)
    }

    const visibleStack = width < 1024 ? compactStack : desktopStack
    await expect(visibleStack).toHaveCSS('border-top-style', 'solid')
    expect((await visibleStack.boundingBox())?.height).toBe(24)
    expect((await visibleStack.locator('.crs-avatar').first().boundingBox())?.height).toBe(20)
    await expect(visibleStack.locator('.crs-avatar').first()).toHaveCSS('border-top-width', '0px')
    if (width >= 768) {
      const plusGeometry = await addContributor.evaluate(element => {
        const horizontal = getComputedStyle(element, '::before')
        const vertical = getComputedStyle(element, '::after')
        return [horizontal.width, horizontal.height, vertical.width, vertical.height]
      })
      expect(plusGeometry).toEqual(['10px', '1px', '1px', '10px'])
    }
    if (width >= 768 && width < 1024) expect((await visibleStack.boundingBox())?.width).toBe(60)

    const verticalLayout = await header.evaluate(element => {
      const breadcrumbs = element.querySelector('.crs-site-header__breadcrumbs')!.getBoundingClientRect()
      const title = element.querySelector('.crs-site-header__course-seo h1')!.getBoundingClientRect()
      const contributors = element.querySelector('.crs-site-header__contributors')!.getBoundingClientRect()
      return [breadcrumbs.top, title.top, contributors.top, contributors.bottom]
    })
    verticalLayout.forEach((value, index) => {
      expect(Math.abs(value - acceptedVerticalLayout[width][index])).toBeLessThanOrEqual(2)
    })

    const filterTop = await header.locator('.crs-site-header__filters').evaluate(element => element.getBoundingClientRect().top)
    expect(Math.abs(filterTop - acceptedFilterTop[width])).toBeLessThanOrEqual(2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  })
}
