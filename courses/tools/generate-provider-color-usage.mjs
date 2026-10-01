import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layer = resolve(root, 'courses-nuxt-kit/layers/courses')
const manifest = JSON.parse(await readFile(resolve(layer, 'courses-kit.tokens.json'), 'utf8'))
const mapping = JSON.parse(await readFile(resolve(root, 'machine/providers/courses-nuxt-kit.tokens.json'), 'utf8'))
const sources = []
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await scan(path)
    else if (/\.(vue|css|ts)$/.test(entry.name)) {
      const source = (await readFile(path, 'utf8')).replace(/:root\s*\{[\s\S]*?\n\}/g, '')
      sources.push({ file: path.slice(layer.length + 1).replaceAll('\\', '/'), source })
    }
  }
}
await scan(resolve(layer, 'app'))
const used = new Set(sources.flatMap(({ source }) => [...source.matchAll(/var\(\s*--crs-([\w-]+)/g)].map(m => m[1])))
let changed = true
while (changed) {
  changed = false
  for (const id of [...used]) {
    for (const reference of manifest.tokens[id]?.references ?? []) {
      const target = reference.replace('--crs-', '')
      if (!used.has(target)) { used.add(target); changed = true }
    }
  }
}
const tokens = Object.entries(manifest.tokens)
  .filter(([, token]) => ['color', 'gradient'].includes(token.type))
  .map(([id, token]) => ({
    id, cssVariable: token.cssVariable, value: token.value,
    resolvedValue: mapping.tokens.find(item => item.providerId === id)?.providerResolvedValue ?? token.value,
    status: used.has(id) ? 'used' : 'reserved',
    directSources: sources.filter(({ source }) => source.includes('var(' + token.cssVariable)).map(item => item.file)
  }))
const data = {
  schemaVersion: 1, provider: manifest.provider,
  policy: 'Active palette comes from the canonical UI Kit. Reserved means no CSS-variable reference in kit runtime, not an unused brand color. Historical production/Figma tokens remain evidence and compatibility aliases.',
  scope: 'Layer Vue/CSS/TS, excluding token declarations; transitive token dependencies included. SVG assets are not CSS-variable consumers.',
  summary: { total: tokens.length, used: tokens.filter(t => t.status === 'used').length, reserved: tokens.filter(t => t.status === 'reserved').length },
  tokens
}
const output = resolve(root, 'machine/reports/provider-color-usage.json')
const serialized = JSON.stringify(data, null, 2) + '\n'
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8').catch(() => '') !== serialized) throw new Error('Provider color usage is stale. Run npm run build:provider-colors.')
} else await writeFile(output, serialized)
console.log('Provider colors: ' + data.summary.used + ' used, ' + data.summary.reserved + ' reserved; all from UI Kit.')
