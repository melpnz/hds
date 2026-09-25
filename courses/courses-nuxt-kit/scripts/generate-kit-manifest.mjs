import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layerRoot = resolve(kitRoot, 'layers', 'courses')
const manifestPath = resolve(layerRoot, 'courses-kit.manifest.json')
const integrityPath = resolve(layerRoot, 'courses-kit.integrity.json')
const tokenManifestPath = resolve(layerRoot, 'courses-kit.tokens.json')
const checkOnly = process.argv.includes('--check')
const excludedFiles = new Set(['courses-kit.manifest.json', 'courses-kit.integrity.json'])

function readOption(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1]
}

const packageJson = JSON.parse(await readFile(resolve(kitRoot, 'package.json'), 'utf8'))
const guideIndex = JSON.parse(await readFile(resolve(kitRoot, '..', 'machine', 'index.json'), 'utf8'))
const { coursesRegistry } = await import(pathToFileURL(resolve(layerRoot, 'app', 'data', 'coursesRegistry.ts')).href)
const previousManifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => 'null'))
const sourceCommit = process.argv.includes('--clear-source-commit')
  ? null
  : readOption('--source-commit') ?? process.env.COURSES_KIT_SOURCE_COMMIT ?? previousManifest?.source?.commitSha ?? null

if (sourceCommit !== null && !/^[0-9a-f]{40}$/.test(sourceCommit)) {
  throw new Error('Source commit must be a full 40-character lowercase Git SHA.')
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(absolute))
    else if (entry.isFile()) files.push(absolute)
  }
  return files
}

function normalizePath(file) {
  return relative(layerRoot, file).replaceAll('\\', '/')
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function inferTokenType(name, value) {
  if (name.includes('duration')) return 'duration'
  if (name.includes('ease')) return 'cubicBezier'
  if (name.includes('shadow') || name === '--crs-focus') return 'shadow'
  if (name.includes('font-family')) return 'fontFamily'
  if (name.includes('opacity')) return 'number'
  if (name.includes('-z-')) return 'number'
  if (/gradient\(/i.test(value) || /(?:^|-)gradient-/.test(name)) return 'gradient'
  if (/^(?:#|rgb\(|hsl\()/i.test(value) || /(?:blue|black|white|green|red|orange|yellow|violet|overlay|placeholder|success-art|brand-hover)/.test(name)) return 'color'
  if (/^-?(?:\d*\.)?\d+(?:px|rem|em|%)$/.test(value) || value === '0') return 'dimension'
  return 'unknown'
}

function extractTokens(css) {
  const root = css.match(/:root\s*{([\s\S]*?)}/)?.[1]
  if (!root) throw new Error('Courses CSS has no :root token block.')
  const tokens = {}
  for (const match of root.matchAll(/^\s*(--crs-[\w-]+)\s*:\s*([^;]+);/gm)) {
    const cssVariable = match[1]
    const value = match[2].trim()
    const id = cssVariable.slice('--crs-'.length)
    tokens[id] = {
      cssVariable,
      type: inferTokenType(cssVariable, value),
      value,
      references: [...value.matchAll(/var\((--crs-[\w-]+)\)/g)].map(reference => reference[1])
    }
  }
  return tokens
}

function nodeName(node, sourceFile) {
  if (!node) return null
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text
  return node.getText(sourceFile)
}

function literalStrings(node) {
  if (!node) return []
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [node.literal.text]
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalStrings)
  return []
}

function objectBoolean(node, key) {
  if (!node || !ts.isObjectLiteralExpression(node)) return false
  const property = node.properties.find(item => ts.isPropertyAssignment(item) && nodeName(item.name) === key)
  return Boolean(property && property.initializer.kind === ts.SyntaxKind.TrueKeyword)
}

async function extractComponentApi(file) {
  const source = await readFile(file, 'utf8')
  const script = source.match(/<script\s+setup(?:\s+lang=["']ts["'])?[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? ''
  const sourceFile = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const props = new Map()
  const emits = new Map()
  const models = new Map()

  function addProp(name, type = 'unknown', required = false, source = 'prop') {
    if (!name || props.has(name)) return
    props.set(name, { name, type, required, source })
  }

  function addEmit(name, type = '[]', source = 'emit') {
    if (!name || emits.has(name)) return
    emits.set(name, { name, type, source })
  }

  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const macro = node.expression.text
      const typeNode = node.typeArguments?.[0]

      if (macro === 'defineProps' && typeNode && ts.isTypeLiteralNode(typeNode)) {
        for (const member of typeNode.members) {
          if (!ts.isPropertySignature(member)) continue
          addProp(nodeName(member.name, sourceFile), member.type?.getText(sourceFile) ?? 'unknown', !member.questionToken)
        }
      }

      if (macro === 'defineEmits' && typeNode && ts.isTypeLiteralNode(typeNode)) {
        for (const member of typeNode.members) {
          if (ts.isPropertySignature(member)) {
            addEmit(nodeName(member.name, sourceFile), member.type?.getText(sourceFile) ?? '[]')
          } else if (ts.isCallSignatureDeclaration(member)) {
            const [eventParameter, ...payload] = member.parameters
            for (const eventName of literalStrings(eventParameter?.type)) {
              addEmit(eventName, `[${payload.map(parameter => parameter.type?.getText(sourceFile) ?? 'unknown').join(', ')}]`)
            }
          }
        }
      }

      if (macro === 'defineModel') {
        const explicitName = node.arguments[0] && ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : null
        const name = explicitName ?? 'modelValue'
        const options = explicitName ? node.arguments[1] : node.arguments[0]
        const type = typeNode?.getText(sourceFile) ?? 'unknown'
        const required = objectBoolean(options, 'required')
        models.set(name, { name, type, required })
        addProp(name, type, required, 'model')
        addEmit(`update:${name}`, `[${type}]`, 'model')
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  const slots = new Set()
  for (const match of source.matchAll(/<slot\b([^>]*)>/gi)) {
    const name = match[1].match(/\bname=["']([^"']+)["']/i)?.[1] ?? 'default'
    slots.add(name)
  }

  const byName = (left, right) => left.name.localeCompare(right.name)
  return {
    props: [...props.values()].sort(byName),
    slots: [...slots].sort().map(name => ({ name })),
    emits: [...emits.values()].sort(byName),
    models: [...models.values()].sort(byName)
  }
}

const providerTokens = extractTokens(await readFile(resolve(layerRoot, 'app', 'assets', 'css', 'courses.css'), 'utf8'))
const tokenManifest = {
  schemaVersion: 1,
  provider: { id: 'courses-nuxt-kit', version: packageJson.version },
  namespace: '--crs-',
  source: 'app/assets/css/courses.css',
  count: Object.keys(providerTokens).length,
  tokens: providerTokens
}
const serializedTokenManifest = `${JSON.stringify(tokenManifest, null, 2)}\n`
if (checkOnly) {
  const current = await readFile(tokenManifestPath, 'utf8').catch(() => '')
  if (current !== serializedTokenManifest) {
    console.error(`${relative(kitRoot, tokenManifestPath)} is stale. Run pnpm run generate:kit-manifest.`)
    process.exitCode = 1
  }
} else {
  await writeFile(tokenManifestPath, serializedTokenManifest, 'utf8')
}

const files = (await listFiles(layerRoot))
  .map(file => ({ absolute: file, path: normalizePath(file) }))
  .filter(file => !excludedFiles.has(file.path))

const checksums = {}
for (const file of files) checksums[file.path] = sha256(await readFile(file.absolute))

const componentDirectory = resolve(layerRoot, 'app', 'components')
const componentFiles = (await listFiles(componentDirectory)).filter(file => file.endsWith('.vue'))
const publicNames = new Set(coursesRegistry.map(item => item.name))
const publicIds = new Set(coursesRegistry.map(item => item.id))
if (publicNames.size !== coursesRegistry.length) throw new Error('Public registry contains duplicate component export names.')
if (publicIds.size !== coursesRegistry.length) throw new Error('Public registry contains duplicate component ids.')
for (const item of coursesRegistry) {
  if (!componentFiles.some(file => basename(file, '.vue') === item.name)) {
    throw new Error(`Public registry entry ${item.id} points to missing component ${item.name}.vue.`)
  }
}
const publicComponents = []
for (const item of coursesRegistry) {
  const componentFile = componentFiles.find(file => basename(file, '.vue') === item.name)
  publicComponents.push({
    id: item.id,
    exportName: item.name,
    visibility: 'public',
    kind: item.kind,
    category: item.category,
    maturity: item.status,
    states: item.states,
    api: await extractComponentApi(componentFile),
    source: `app/components/${item.name}.vue`,
    catalogUrl: `/ui?component=${encodeURIComponent(item.id)}`,
    previewUrl: `/ui/preview?component=${encodeURIComponent(item.id)}`
  })
}
const internalComponents = componentFiles
  .map(file => basename(file, '.vue'))
  .filter(name => !publicNames.has(name))
  .sort()
  .map(name => ({
    exportName: name,
    visibility: 'internal',
    source: `app/components/${name}.vue`
  }))

const manifest = {
  schemaVersion: 2,
  provider: {
    id: 'courses-nuxt-kit',
    name: 'Courses Nuxt Kit',
    type: 'nuxt-layer',
    status: 'active-temporary'
  },
  version: packageJson.version,
  releasedAt: '2026-09-23',
  guide: {
    id: 'courses',
    compatibleVersion: guideIndex.product.guideVersion
  },
  maintainer: '@melpnz',
  source: {
    repository: 'https://github.com/melpnz/hds',
    path: 'courses/courses-nuxt-kit/layers/courses',
    commitSha: sourceCommit
  },
  distribution: {
    mode: 'copy',
    copiedDirectory: 'layers/courses',
    archiveName: `courses-nuxt-kit-v${packageJson.version}.zip`,
    releaseTag: `courses-nuxt-kit-v${packageJson.version}`,
    repositoryUrl: 'https://github.com/melpnz/hds',
    releasesUrl: 'https://github.com/melpnz/hds/releases',
    changelogUrl: 'https://github.com/melpnz/hds/blob/main/courses/courses-nuxt-kit/layers/courses/CHANGELOG.md',
    latestManifestUrl: 'https://raw.githubusercontent.com/melpnz/hds/main/courses/courses-nuxt-kit/layers/courses/courses-kit.manifest.json',
    networkPolicy: 'manual-update-check-only'
  },
  requirements: {
    dependencies: ['@nuxt/ui', '@fontsource-variable/inter'],
    devDependencies: ['@iconify-json/tabler']
  },
  tokens: {
    manifest: 'courses-kit.tokens.json',
    source: tokenManifest.source,
    namespace: tokenManifest.namespace,
    count: tokenManifest.count
  },
  components: {
    public: publicComponents,
    internal: internalComponents
  },
  integrity: {
    algorithm: 'sha256',
    file: 'courses-kit.integrity.json',
    trackedFiles: files.length,
    excludes: [...excludedFiles]
  }
}

const integrity = {
  schemaVersion: 1,
  providerId: manifest.provider.id,
  version: manifest.version,
  algorithm: manifest.integrity.algorithm,
  files: checksums
}

const serialize = value => `${JSON.stringify(value, null, 2)}\n`

async function syncFile(path, expected) {
  if (checkOnly) {
    const actual = await readFile(path, 'utf8').catch(() => '')
    if (actual !== expected) {
      console.error(`${relative(kitRoot, path)} is stale. Run pnpm run generate:kit-manifest.`)
      process.exitCode = 1
    }
    return
  }
  await writeFile(path, expected, 'utf8')
}

await syncFile(manifestPath, serialize(manifest))
await syncFile(integrityPath, serialize(integrity))

if (!process.exitCode) {
  console.log(`${checkOnly ? 'Verified' : 'Generated'} Courses Kit ${manifest.version}: ${files.length} tracked layer files.`)
}
