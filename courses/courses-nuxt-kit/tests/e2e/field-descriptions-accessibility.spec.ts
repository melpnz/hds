import { expect, test } from '@playwright/test'

for (const component of ['textarea', 'select']) {
  test(`${component}: unique descriptions update without stale references`, async ({ page }) => {
    await page.goto(`/ui/preview?component=${component}&variant=descriptions`)
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
    const role = component === 'textarea' ? 'textbox' : 'button'
    const field = page.getByRole(role, { name: /^Динамическое поле(?: |$)/ })
    const second = page.getByRole(role, { name: /^Второе поле(?: |$)/ })
    await expect(field).toHaveAccessibleDescription('Проверьте значение')
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(second).toHaveAccessibleDescription('Другая подсказка')
    const errorId = await field.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    expect(await second.getAttribute('aria-describedby')).not.toBe(errorId)

    async function change(value: string, label: string) {
      if (component === 'textarea') await field.fill(value)
      else {
        await field.focus()
        await field.press('ArrowDown')
        await expect(page.getByRole('listbox')).toBeVisible()
        const option = page.getByRole('option', { name: label, exact: true })
        await option.focus()
        await option.press('Enter')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(field).toBeFocused()
        await expect(field).toHaveAccessibleName(`Динамическое поле ${label}`)
      }
    }

    await change('hint', 'Подсказка')
    await expect(field).toHaveAccessibleDescription('Подсказка к полю')
    await expect(field).toHaveAttribute('aria-invalid', 'false')
    expect(await field.getAttribute('aria-describedby')).not.toBe(errorId)
    expect(await page.locator('[id]').evaluateAll((elements, id) => elements.some(e => e.id === id), errorId)).toBe(false)
    await change('none', 'Без описания')
    await expect(field).not.toHaveAttribute('aria-describedby', /.+/)
    await expect(field).toHaveAccessibleDescription('')
    await change('error', 'Ошибка')
    await expect(field).toHaveAccessibleDescription('Проверьте значение')
    await expect(field).toHaveAttribute('aria-describedby', errorId!)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const ids = await page.locator('[id]').evaluateAll(elements => elements.map(e => e.id))
    expect(new Set(ids).size).toBe(ids.length)
    await expect(second).toHaveAccessibleDescription('Другая подсказка')
  })
}

test('Select: explicit name takes priority and unlabelled trigger keeps its value name', async ({ page }) => {
  await page.goto('/ui/preview?component=select&variant=descriptions')
  const explicit = page.getByRole('button', { name: 'Явное имя', exact: true })
  await expect(explicit).toBeVisible()
  await expect(explicit).not.toHaveAttribute('aria-labelledby', /.+/)
  const plain = page.getByRole('button', { name: 'Без подписи', exact: true })
  await expect(plain).not.toHaveAttribute('aria-labelledby', /.+/)
  await expect(plain).not.toHaveAttribute('aria-describedby', /.+/)
})
