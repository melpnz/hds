import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const coursesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit.json')
const previewReportPath = resolve(coursesRoot, 'machine', 'reports', 'provider-preview-audit.md')
const componentOutputDirectory = resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit')
const checkOnly = process.argv.includes('--check')
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))

const index = await readJson(resolve(coursesRoot, 'machine', 'index.json'))
const catalog = await readJson(resolve(coursesRoot, 'machine', 'catalog.json'))
const manifest = await readJson(resolve(coursesRoot, 'courses-nuxt-kit', 'layers', 'courses', 'courses-kit.manifest.json'))
const overrides = await readJson(resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit.overrides.json'))
const aliases = await readJson(resolve(coursesRoot, 'machine', 'aliases.json'))

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
  invalid: ['invalid', 'error'],
  pressed: ['pressed', 'selected'],
  selected: ['selected', 'pressed']
}

function providerCoversState(providerStates, guideState) {
  if (guideState === 'default') return true
  return (equivalentProviderStates[guideState] ?? [guideState]).some(state => providerStates.includes(state))
}

function isProviderOnlyState(providerState, guideStates) {
  if (providerState === 'invalid') return !guideStates.some(state => ['invalid', 'error'].includes(state))
  if (providerState === 'error') return !guideStates.some(state => ['error', 'invalid'].includes(state))
  if (providerState === 'pressed') return !guideStates.some(state => ['pressed', 'selected'].includes(state))
  if (providerState === 'selected') return !guideStates.some(state => ['selected', 'pressed'].includes(state))
  return !guideStates.includes(providerState)
}

for (const guideItem of guideItems) {
  const providerItem = providerById.get(guideItem.id)
  if (!providerItem) continue
  const guideRecord = await readJson(resolve(coursesRoot, guideItem.file.replace(/^machine\//, 'machine/')))
  const guideStates = guideRecord.states?.ui ?? []
  const missingInProvider = guideStates.filter(state => !providerCoversState(providerItem.states, state))
  const staticFallbacks = (guideRecord.examples ?? []).map(example => ({
    id: example.id,
    file: example.file,
    covers: example.covers ?? []
  }))
  mappings.push({
    guideId: guideItem.id,
    providerComponentId: providerItem.id,
    exportName: providerItem.exportName,
    status: 'direct',
    visibility: providerItem.visibility,
    source: `courses-nuxt-kit/layers/courses/${providerItem.source}`,
    catalogUrl: providerItem.catalogUrl,
    previewUrl: providerItem.previewUrl,
    preview: {
      strategy: missingInProvider.length ? 'hybrid' : 'provider-primary',
      primary: 'implementation-provider',
      staticFallbacks,
      retainStaticFor: [
        'github-pages-fallback',
        ...(missingInProvider.length ? ['provider-state-gap'] : [])
      ]
    },
    api: providerItem.api,
    states: {
      guide: guideStates,
      provider: providerItem.states,
      missingInProvider,
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
    previewUrl: providerItem.previewUrl,
    api: providerItem.api
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
const previewAliases = Object.entries(aliases.aliases).map(([legacyId, alias]) => ({
  legacyId,
  legacyFile: `examples/components/${legacyId}/index.html`,
  target: alias.target ?? alias.replacement,
  previewTarget: alias.previewTarget
}))
for (const alias of previewAliases) {
  if (!alias.previewTarget) throw new Error(`Alias ${alias.legacyId} has no previewTarget.`)
  const legacySource = await readFile(resolve(coursesRoot, alias.legacyFile), 'utf8').catch(() => '')
  if (!legacySource.includes('data-legacy-preview-redirect') || !legacySource.includes(`data-preview-target="${alias.previewTarget}"`)) {
    throw new Error(`${alias.legacyFile} must redirect to ${alias.previewTarget}.`)
  }
  await readFile(resolve(coursesRoot, alias.previewTarget), 'utf8')
}
const provider = {
  id: manifest.provider.id,
  version: manifest.version,
  type: manifest.provider.type,
  manifest: 'courses-nuxt-kit/layers/courses/courses-kit.manifest.json',
  tokens: `courses-nuxt-kit/layers/courses/${manifest.tokens.manifest}`
}
const compactMappings = mappings.map(mapping => {
  if (mapping.status !== 'direct') return mapping
  const { api, ...compact } = mapping
  return {
    ...compact,
    apiFile: `machine/providers/courses-nuxt-kit/${mapping.guideId}.json`
  }
})
const output = {
  schemaVersion: 2,
  guide: { id: index.product.id, version: index.product.guideVersion },
  provider,
  compatibility: manifest.guide.compatibleVersion === index.product.guideVersion ? 'compatible' : 'incompatible',
  summary: {
    guideImplementable: guideItems.length,
    providerPublic: providerItems.length,
    providerInternal: manifest.components.internal.length,
    direct: direct.length,
    providerOnly: mappings.filter(item => item.guideId === null).length,
    guideOnly: mappings.filter(item => item.providerComponentId === null).length,
    directWithMissingStates: direct.filter(item => item.states.missingInProvider.length).length,
    providerPrimaryPreviews: direct.filter(item => item.preview.strategy === 'provider-primary').length,
    hybridPreviews: direct.filter(item => item.preview.strategy === 'hybrid').length,
    legacyPreviewRedirects: previewAliases.length
  },
  mappings: compactMappings
}

const serialize = value => `${JSON.stringify(value, null, 2)}\n`
const previewRows = direct.map(mapping => `| \`${mapping.guideId}\` | ${mapping.preview.strategy} | ${mapping.states.missingInProvider.length ? mapping.states.missingInProvider.map(state => `\`${state}\``).join(', ') : '—'} | ${mapping.preview.staticFallbacks.map(example => `\`${example.file}\``).join('<br>')} |`).join('\n')
const aliasRows = previewAliases.map(alias => `| \`${alias.legacyId}\` | \`${alias.legacyFile}\` | \`${alias.previewTarget}\` |`).join('\n')
const previewReport = `# Courses · аудит preview активного provider

Отчёт генерируется из machine-каталога, provider mapping и \`machine/aliases.json\`.
В интегрированном режиме реализация provider является основным визуальным
источником. Статические HTML-примеры сохраняются как fallback для GitHub Pages;
при state-gap они также остаются проверяемым примером отсутствующего состояния.

## Итог

- прямых component mappings: **${direct.length}**;
- provider-primary: **${direct.filter(item => item.preview.strategy === 'provider-primary').length}**;
- hybrid из-за state-gap: **${direct.filter(item => item.preview.strategy === 'hybrid').length}**;
- минимальных redirects старых имён: **${previewAliases.length}**.

## Компоненты

| Guide id | Стратегия | Не хватает в provider | Статический fallback |
|---|---|---|---|
${previewRows}

## Старые адреса

| Старый id | Сохранённый адрес | Канонический preview |
|---|---|---|
${aliasRows}
`

async function syncFile(path, expected) {
  if (checkOnly) {
    const current = await readFile(path, 'utf8').catch(() => '')
    if (current !== expected) {
      console.error(`${relative(coursesRoot, path)} is stale. Run npm run build:provider.`)
      process.exitCode = 1
    }
    return
  }
  await writeFile(path, expected, 'utf8')
}

if (!checkOnly) await mkdir(componentOutputDirectory, { recursive: true })
const expectedComponentFiles = new Set(direct.map(mapping => `${mapping.guideId}.json`))
const existingComponentFiles = (await readdir(componentOutputDirectory).catch(() => []))
  .filter(file => file.endsWith('.json'))
for (const file of existingComponentFiles.filter(file => !expectedComponentFiles.has(file))) {
  if (checkOnly) {
    console.error(`${relative(coursesRoot, resolve(componentOutputDirectory, file))} is stale. Run npm run build:provider.`)
    process.exitCode = 1
  } else {
    await unlink(resolve(componentOutputDirectory, file))
  }
}
for (const mapping of direct) {
  await syncFile(resolve(componentOutputDirectory, `${mapping.guideId}.json`), serialize({
    schemaVersion: 1,
    guide: { id: index.product.id, version: index.product.guideVersion, componentId: mapping.guideId },
    provider,
    component: mapping
  }))
}
await syncFile(outputPath, serialize(output))
await syncFile(previewReportPath, previewReport)

if (!process.exitCode) console.log(`${checkOnly ? 'Verified' : 'Generated'} provider mapping: ${output.summary.direct} direct, ${output.summary.providerOnly} provider-only, ${output.summary.guideOnly} guide-only.`)
