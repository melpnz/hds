import { expect, test } from '@playwright/test'
for (const width of [320, 480, 768, 1024, 1440]) {
  for (const kind of ['Chip', 'MultiSelect', 'ButtonGroup', 'Tooltip', 'DemandChart', 'PriceSheet', 'SortSheet', 'MobileMenu']) {
    test(`${kind} unchanged pixels at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/ui/accessibility-visual-fixtures?kind=${kind}`)
      await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({ content: '#nuxt-devtools-container,nuxt-devtools-inspect-panel{display:none!important}' })
      if (['PriceSheet', 'SortSheet', 'MobileMenu'].includes(kind)) await page.getByRole('button', { name: 'Открыть', exact: true }).click()
      const target = page.locator(kind === 'PriceSheet' ? '.crs-price-sheet__panel' : kind === 'SortSheet' ? '.crs-sort-sheet section' : kind === 'MobileMenu' ? '.crs-mobile-menu' : '.visual-target')
      if (kind === 'PriceSheet') await page.getByRole('textbox', { name: 'Цена от' }).focus()
      if (kind === 'SortSheet') await page.getByRole('option').first().focus()
      if (kind === 'MobileMenu') await page.getByRole('button', { name: 'Закрыть меню' }).focus()
      if (kind === 'Tooltip') { await page.locator('.crs-tooltip').hover(); await expect(page.getByRole('tooltip')).toBeVisible() }
      await expect(target).toBeVisible()
      // These baselines came from the pre-change components and were first
      // verified against the accessible versions with byte-identical PNGs.
      const image = kind === 'Tooltip' ? await page.screenshot({ animations: 'disabled', caret: 'hide' }) : await target.screenshot({ animations: 'disabled', caret: 'hide' })
      expect(image).toMatchSnapshot(`${kind}-${width}.png`)
    })
  }
}
