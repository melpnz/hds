function renderColors(target, colors) {
  const fragment = document.createDocumentFragment()
  for (const token of colors) {
    const card = document.createElement('article')
    card.className = 'foundation-card'
    const preview = document.createElement('div')
    preview.className = 'foundation-swatch'
    preview.style.setProperty('--swatch', token.resolvedValue)
    const title = document.createElement('strong')
    title.textContent = token.id
    const meta = document.createElement('small')
    meta.textContent = token.value + ' · ' + token.cssVariable
    card.append(preview, title, meta)
    fragment.append(card)
  }
  document.querySelector(target).append(fragment)
}

fetch('../../../machine/reports/provider-color-usage.json')
  .then(response => {
    if (!response.ok) throw new Error('Color manifest unavailable')
    return response.json()
  })
  .then(data => {
    renderColors('#used-colors', data.tokens.filter(token => token.status === 'used'))
    renderColors('#unused-colors', data.tokens.filter(token => token.status === 'reserved'))
  })
  .catch(() => {
    document.querySelector('#used-colors').textContent = 'Не удалось загрузить палитру UI Kit. Откройте гайд через локальный сервер.'
  })
