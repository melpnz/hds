import { readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const coursesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit.json')
const checkOnly = process.argv.includes('--check')
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))

const index = await readJson(resolve(coursesRoot, 'machine', 'index.json'))
const catalog = await readJson(resolve(coursesRoot, 'machine', 'catalog.json'))
const manifest = await readJson(resolve(coursesRoot, 'courses-nuxt-kit', 'layers', 'courses', 'courses-kit.manifest.json'))
const overrides = await readJson(resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit.overrides.json'))

const guideItems = catalog.filter(item => ['component', 'module'].includes(item.kind))
const guideById = new Map(guideItems.map(item => [item.id, item]))
const providerItems = manifest.components.public
const providerById = new Map(providerItems.map(item => [item.id, item]))
const mappings = []

if (providerById.size !== providerItems.length) throw new Error('Provider manifest contains duplicate public component ids.')
if (index.activeImplementationProvider?.id !== manifest.provider.id) throw new Error('machine/index.json points to a different active provider.')
if (index.activeImplementationProvider?.version !== manifest.version) throw new Error('machine/index.json and provider manifest versions differ.')
if (index.activeImplementationProvider?.mapping !== 'machine/providers/courses-nuxt-kit.json') throw new Error('machine/index.json points to an unexpected provider mapping.')
const equivalentProviderStates = {
  error: ['error', 'invalid'],
  invalid: ['invalid', 'error']
}

function providerCoversState(providerStates, guideState) {
  if (guideState === 'default') return true
  return (equivalentProviderStates[guideState] ?? [guideState]).some(state => providerStates.includes(state))
}

function isProviderOnlyState(providerState, guideStates) {
  if (providerState === 'invalid') return !guideStates.some(state => ['invalid', 'error'].includes(state))
  if (providerState === 'error') return !guideStates.some(state => ['error', 'invalid'].includes(state))
  return !guideStates.includes(providerState)
}

for (const guideItem of guideItems) {
  const providerItem = providerById.get(guideItem.id)
  if (!providerItem) continue
  const guideRecord = await readJson(resolve(coursesRoot, guideItem.file.replace(/^machine\//, 'machine/')))
  const guideStates = guideRecord.states?.ui ?? []
  mappings.push({
    guideId: guideItem.id,
    providerComponentId: providerItem.id,
    exportName: providerItem.exportName,
    status: 'direct',
    visibility: providerItem.visibility,
    source: `courses-nuxt-kit/layers/courses/${providerItem.source}`,
    catalogUrl: providerItem.catalogUrl,
    previewUrl: providerItem.previewUrl,
    states: {
      guide: guideStates,
      provider: providerItem.states,
      missingInProvider: guideStates.filter(state => !providerCoversState(providerItem.states, state)),
      providerOnly: providerItem.states.filter(state => isProviderOnlyState(state, guideStates))
    }
  })
}

for (const providerItem of providerItems.filter(item => !guideById.has(item.id))) {
  const decision = overrides.providerOnly[providerItem.id]
  if (!decision) throw new Error(`Missing provider-only decision for ${providerItem.id}.`)
  mappings.push({
    guideId: null,
    providerComponentId: providerItem.id,
    exportName: providerItem.exportName,
    status: decision.resolution,
    action: decision.action,
    visibility: providerItem.visibility,
    source: `courses-nuxt-kit/layers/courses/${providerItem.source}`,
    catalogUrl: providerItem.catalogUrl,
    previewUrl: providerItem.previewUrl
  })
}

for (const guideItem of guideItems.filter(item => !providerById.has(item.id))) {
  const decision = overrides.guideOnly[guideItem.id]
  if (!decision) throw new Error(`Missing guide-only decision for ${guideItem.id}.`)
  mappings.push({
    guideId: guideItem.id,
    providerComponentId: null,
    exportName: null,
    status: decision.resolution,
    target: decision.target ?? null,
    guideFile: guideItem.file
  })
}

const actualProviderOnly = providerItems.filter(item => !guideById.has(item.id)).map(item => item.id).sort()
const declaredProviderOnly = Object.keys(overrides.providerOnly).sort()
const actualGuideOnly = guideItems.filter(item => !providerById.has(item.id)).map(item => item.id).sort()
const declaredGuideOnly = Object.keys(overrides.guideOnly).sort()
if (JSON.stringify(actualProviderOnly) !== JSON.stringify(declaredProviderOnly)) throw new Error('Provider-only overrides contain missing or stale ids.')
if (JSON.stringify(actualGuideOnly) !== JSON.stringify(declaredGuideOnly)) throw new Error('Guide-only overrides contain missing or stale ids.')

mappings.sort((left, right) => (left.guideId ?? left.providerComponentId).localeCompare(right.guideId ?? right.providerComponentId))
const direct = mappings.filter(item => item.status === 'direct')
const output = {
  schemaVersion: 1,
  guide: { id: index.product.id, version: index.product.guideVersion },
  provider: {
    id: manifest.provider.id,
    version: manifest.version,
    type: manifest.provider.type,
    manifest: 'courses-nuxt-kit/layers/courses/courses-kit.manifest.json'
  },
  compatibility: manifest.guide.compatibleVersion === index.product.guideVersion ? 'compatible' : 'incompatible',
  summary: {
    guideImplementable: guideItems.length,
    providerPublic: providerItems.length,
    providerInternal: manifest.components.internal.length,
    direct: direct.length,
    providerOnly: mappings.filter(item => item.guideId === null).length,
    guideOnly: mappings.filter(item => item.providerComponentId === null).length,
    directWithMissingStates: direct.filter(item => item.states.missingInProvider.length).length
  },
  mappings
}

const serialized = `${JSON.stringify(output, null, 2)}\n`
if (checkOnly) {
  const current = await readFile(outputPath, 'utf8').catch(() => '')
  if (current !== serialized) {
    console.error(`${relative(coursesRoot, outputPath)} is stale. Run npm run build:provider.`)
    process.exitCode = 1
  }
} else await writeFile(outputPath, serialized, 'utf8')

if (!process.exitCode) console.log(`${checkOnly ? 'Verified' : 'Generated'} provider mapping: ${output.summary.direct} direct, ${output.summary.providerOnly} provider-only, ${output.summary.guideOnly} guide-only.`)
