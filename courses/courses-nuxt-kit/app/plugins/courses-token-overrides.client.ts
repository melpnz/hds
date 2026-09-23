const storageKey = 'courses-ui-token-overrides'

function readOverrides(value: string | null): Record<string, string> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function applyOverrides(overrides: Record<string, string>) {
  for (const property of [...document.documentElement.style]) {
    if (property.startsWith('--crs-')) document.documentElement.style.removeProperty(property)
  }
  for (const [property, value] of Object.entries(overrides)) {
    if (property.startsWith('--crs-') && value) document.documentElement.style.setProperty(property, value)
  }
}

export default defineNuxtPlugin(() => {
  applyOverrides(readOverrides(localStorage.getItem(storageKey)))
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) applyOverrides(readOverrides(event.newValue))
  })
})
