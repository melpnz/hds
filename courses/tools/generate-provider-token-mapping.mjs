import { readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const coursesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const providerTokens = await readJson(resolve(coursesRoot, 'courses-nuxt-kit', 'layers', 'courses', 'courses-kit.tokens.json'))
const guideTokens = await readJson(resolve(coursesRoot, 'machine', 'tokens.json'))
const dimensions = await readJson(resolve(coursesRoot, 'machine', 'dimension-tokens.json'))
const semanticTokens = await readJson(resolve(coursesRoot, 'machine', 'semantic-tokens.json'))
const overrides = await readJson(resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit.tokens.overrides.json'))
const outputPath = resolve(coursesRoot, 'machine', 'providers', 'courses-nuxt-kit.tokens.json')
const reportPath = resolve(coursesRoot, 'machine', 'reports', 'provider-token-mapping.md')

function flattenGuideTokens() {
  const result = new Map()
  for (const [group, tokens] of Object.entries(guideTokens)) {
    for (const [id, token] of Object.entries(tokens)) {
      result.set(`${group}.${id}`, {
        id: `${group}.${id}`,
        cssVariable: token.$extensions?.guide?.cssVar ?? token.cssVariable ?? null,
        type: token.$type,
        value: token.$value
      })
    }
  }
  for (const [group, tokens] of Object.entries(dimensions.tokens)) {
    for (const [id, token] of Object.entries(tokens)) {
      result.set(`${group}.${id}`, {
        id: `${group}.${id}`,
        cssVariable: token.cssVariable,
        type: token.$type,
        value: token.$value
      })
    }
  }
  for (const [group, tokens] of Object.entries(semanticTokens.tokens)) {
    for (const [id, token] of Object.entries(tokens)) {
      result.set(`${group}.${id}`, {
        id: `${group}.${id}`,
        cssVariable: token.cssVariable,
        type: token.$type,
        value: token.$value
      })
    }
  }
  return result
}

const guideById = flattenGuideTokens()

function automaticTarget(providerId) {
  const palette = providerId.match(/^(blue|black|white|green|red|orange|yellow|violet)(-.+)?$/)
  if (palette && !['green', 'red', 'orange', 'yellow'].includes(providerId)) return `color.ui-${providerId}`
  for (const [prefix, group] of [
    ['radius-', 'radius'],
    ['size-', 'size'],
    ['space-', 'space'],
    ['font-', 'font-size'],
    ['leading-', 'line-height'],
    ['border-', 'border-width']
  ]) {
    const suffix = providerId.slice(prefix.length)
    if (providerId.startsWith(prefix) && /^\d/.test(suffix)) return `${group}.${suffix}`
  }
  return null
}

function resolveProviderValue(id, trail = []) {
  if (trail.includes(id)) return null
  const token = providerTokens.tokens[id]
  if (!token) return null
  return token.value.replace(/var\((--crs-[\w-]+)\)/g, (_, cssVariable) => {
    const referenceId = cssVariable.slice('--crs-'.length)
    return resolveProviderValue(referenceId, [...trail, id]) ?? `var(${cssVariable})`
  })
}

function resolveGuideValue(value, trail = []) {
  if (typeof value !== 'string') return value
  return value.replace(/\{([\w.-]+)}/g, (_, id) => {
    if (trail.includes(id)) return `{${id}}`
    const token = guideById.get(id)
    return token ? resolveGuideValue(token.value, [...trail, id]) : `{${id}}`
  })
}

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, '').replace(/^(-?)0+\./, '$1.')
}

function parseColor(value) {
  const normalized = String(value).trim().toLowerCase()
  const hex = normalized.match(/^#([\da-f]{3}|[\da-f]{6})$/)
  if (hex) {
    const full = hex[1].length === 3 ? [...hex[1]].map(part => part + part).join('') : hex[1]
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16), 1]
  }
  const rgb = normalized.match(/^rgba?\((.+)\)$/)
  if (rgb) {
    const parts = rgb[1].replace('/', ' ').split(/[\s,]+/).filter(Boolean)
    if (parts.length >= 3) {
      const alpha = parts[3]?.endsWith('%') ? Number(parts[3].slice(0, -1)) / 100 : Number(parts[3] ?? 1)
      return [Number(parts[0]), Number(parts[1]), Number(parts[2]), alpha]
    }
  }
  const hsl = normalized.match(/^hsla?\(0(?:deg)?,0%,(0|100)%(?:,|\s+\/\s+)([\d.]+%?)\)$/)
  if (hsl) {
    const channel = hsl[1] === '100' ? 255 : 0
    const alpha = hsl[2].endsWith('%') ? Number(hsl[2].slice(0, -1)) / 100 : Number(hsl[2])
    return [channel, channel, channel, alpha]
  }
  return null
}

function valuesAgree(providerValue, guideValue) {
  if (normalize(providerValue) === normalize(guideValue)) return 'exact'
  const zeroDimension = value => /^[-+]?0(?:\.0+)?(?:px|rem|em|%)?$/.test(String(value).trim().toLowerCase())
  if (zeroDimension(providerValue) && zeroDimension(guideValue)) return 'equivalent'
  const left = parseColor(providerValue)
  const right = parseColor(guideValue)
  if (left && right && left.every((value, index) => Math.abs(value - right[index]) < .0001)) return 'equivalent'
  return 'different'
}

const records = []
const mappedByProviderId = new Map()

for (const [providerId, token] of Object.entries(providerTokens.tokens)) {
  const target = overrides.map[providerId] ?? automaticTarget(providerId)
  const ignored = overrides.ignore[providerId]
  const guide = target ? guideById.get(target) : null
  const record = {
    providerId,
    providerCssVariable: token.cssVariable,
    providerType: token.type,
    providerValue: token.value,
    providerResolvedValue: resolveProviderValue(providerId),
    status: ignored ? 'ignored' : guide ? (overrides.map[providerId] ? 'explicit' : 'direct') : 'unmapped',
    guideToken: guide?.id ?? null,
    guideCssVariable: guide?.cssVariable ?? null,
    guideValue: guide?.value ?? null,
    valueAgreement: guide ? valuesAgree(resolveProviderValue(providerId), resolveGuideValue(guide.value)) : null,
    reason: ignored ?? (target && !guide ? `Guide token ${target} does not exist.` : null)
  }
  records.push(record)
  if (guide) mappedByProviderId.set(providerId, record)
}

for (const record of records.filter(item => item.status === 'unmapped')) {
  const token = providerTokens.tokens[record.providerId]
  if (token.references.length !== 1) continue
  const referenceId = token.references[0].slice('--crs-'.length)
  const reference = mappedByProviderId.get(referenceId)
  if (!reference) continue
  record.status = 'alias'
  record.guideToken = reference.guideToken
  record.guideCssVariable = reference.guideCssVariable
  record.guideValue = reference.guideValue
  record.valueAgreement = valuesAgree(record.providerResolvedValue, resolveGuideValue(reference.guideValue))
  record.reason = `Alias of ${token.references[0]}.`
  mappedByProviderId.set(record.providerId, record)
}

const mapped = records.filter(item => ['direct', 'explicit', 'alias'].includes(item.status))
const mismatched = mapped.filter(item => item.valueAgreement === 'different')
const unmapped = records.filter(item => item.status === 'unmapped')
const ignored = records.filter(item => item.status === 'ignored')
const summary = {
  providerTokens: records.length,
  mapped: mapped.length,
  direct: records.filter(item => item.status === 'direct').length,
  explicit: records.filter(item => item.status === 'explicit').length,
  aliases: records.filter(item => item.status === 'alias').length,
  valueMismatches: mismatched.length,
  unmapped: unmapped.length,
  ignored: ignored.length
}

const output = {
  schemaVersion: 1,
  provider: { id: providerTokens.provider.id, version: providerTokens.provider.version, tokenManifest: 'courses-nuxt-kit/layers/courses/courses-kit.tokens.json' },
  guide: { id: 'courses', colorTokens: 'machine/tokens.json', dimensionTokens: 'machine/dimension-tokens.json', semanticTokens: 'machine/semantic-tokens.json' },
  summary,
  tokens: records
}

const table = rows => rows.length
  ? rows.map(item => `| \`${item.providerCssVariable}\` | \`${item.providerValue}\` | ${item.guideCssVariable ? `\`${item.guideCssVariable}\`` : '—'} | ${item.valueAgreement ?? '—'} | ${item.reason ?? '—'} |`).join('\n')
  : '| — | — | — | — | — |'
const report = `# Courses · provider token mapping

Сгенерировано из \`courses-kit.tokens.json\`, \`machine/tokens.json\`,
\`machine/dimension-tokens.json\` и \`machine/semantic-tokens.json\`. Ручные решения находятся в
\`machine/providers/courses-nuxt-kit.tokens.overrides.json\`.

## Итог

- provider tokens: **${summary.providerTokens}**;
- mapped: **${summary.mapped}** (${summary.direct} direct, ${summary.explicit} explicit, ${summary.aliases} aliases);
- value mismatches: **${summary.valueMismatches}**;
- unmapped: **${summary.unmapped}**;
- ignored: **${summary.ignored}**.

## Несовпадающие значения

| Provider | Значение | Guide | Сверка | Причина |
|---|---|---|---|---|
${table(mismatched)}

## Пока не сопоставлены

| Provider | Значение | Guide | Сверка | Причина |
|---|---|---|---|---|
${table(unmapped)}
`

async function sync(path, content) {
  if (checkOnly) {
    const current = await readFile(path, 'utf8').catch(() => '')
    if (current !== content) {
      console.error(`${relative(coursesRoot, path)} is stale. Run npm run build:provider-tokens.`)
      process.exitCode = 1
    }
  } else await writeFile(path, content, 'utf8')
}

await sync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
await sync(reportPath, report)
if (!process.exitCode) console.log(`${checkOnly ? 'Verified' : 'Generated'} provider token mapping: ${summary.mapped} mapped, ${summary.unmapped} unmapped, ${summary.valueMismatches} value mismatches.`)
