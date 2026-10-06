import { expect, test } from '@playwright/test'

test('associates the visible error or hint with its own field', async ({ page }) => {
  await page.goto('/ui/preview?component=text-input')
  const error = page.getByRole('textbox', { name: 'С ошибкой', exact: true })
  const hint = page.getByRole('textbox', { name: 'С подписью', exact: true })
  const plain = page.getByRole('textbox', { name: 'M', exact: true })
  await expect(error).toHaveAccessibleDescription('Проверьте значение')
  await expect(error).toHaveAttribute('aria-invalid', 'true')
  await expect(hint).toHaveAccessibleDescription('Необязательное поле')
  await expect(hint).toHaveAttribute('aria-invalid', 'false')
  await expect(plain).not.toHaveAttribute('aria-describedby', /.+/)
  const ids = await page.locator('.crs-field__error, .crs-field__hint').evaluateAll(elements => elements.map(e => e.id))
  expect(ids.every(Boolean)).toBe(true)
  expect(new Set(ids).size).toBe(ids.length)
})

test('updates the description from error to hint to none without stale references', async ({ page }) => {
  await page.goto('/ui/preview?component=text-input&variant=descriptions')
  await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: unknown })?.__vue_app__))
  const field = page.getByRole('textbox', { name: 'Динамическое поле', exact: true })
  const second = page.getByRole('textbox', { name: 'Второе поле', exact: true })
  await expect(field).toHaveAccessibleDescription('Проверьте значение')
  const errorId = await field.getAttribute('aria-describedby')
  expect(errorId).toBeTruthy()
  await expect(second).toHaveAccessibleDescription('Другая подсказка')
  expect(await second.getAttribute('aria-describedby')).not.toBe(errorId)

  await field.fill('valid')
  await expect(field).toHaveAccessibleDescription('Подсказка к полю')
  await expect(field).toHaveAttribute('aria-invalid', 'false')
  expect(await field.getAttribute('aria-describedby')).not.toBe(errorId)
  expect(await page.locator('[id]').evaluateAll((elements, id) => elements.some(e => e.id === id), errorId)).toBe(false)

  await field.fill('none')
  await expect(field).not.toHaveAttribute('aria-describedby', /.+/)
  await expect(field).toHaveAccessibleDescription('')

  await field.fill('error')
  await expect(field).toHaveAccessibleDescription('Проверьте значение')
  await expect(field).toHaveAttribute('aria-describedby', errorId!)
  await expect(field).toHaveAttribute('aria-invalid', 'true')
})
