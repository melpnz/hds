import { icons as tablerIcons } from '@iconify-json/tabler'

interface TablerIconData {
  body: string
  width?: number
  height?: number
}

const iconEntries = Object.entries(tablerIcons.icons as Record<string, TablerIconData>)
  .filter(([name]) => !name.includes('-filled'))
  .sort(([left], [right]) => left.localeCompare(right))

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.q || '').trim().toLowerCase().slice(0, 80)
  const requestedLimit = Number(query.limit || 200)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(iconEntries.length, Math.max(1, Math.floor(requestedLimit)))
    : 200

  const matching = search
    ? iconEntries.filter(([name]) => name.includes(search))
    : iconEntries

  return {
    collection: 'tabler',
    style: 'outline',
    total: matching.length,
    available: iconEntries.length,
    items: matching.slice(0, limit).map(([name, icon]) => ({
      name,
      icon: `i-tabler-${name}`,
      body: icon.body,
      width: icon.width || tablerIcons.width || 24,
      height: icon.height || tablerIcons.height || 24
    }))
  }
})
