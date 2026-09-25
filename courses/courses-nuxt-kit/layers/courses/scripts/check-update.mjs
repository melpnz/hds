import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const defaultLayerRoot = resolve(scriptDirectory, '..')
const generatedFiles = new Set(['courses-kit.manifest.json', 'courses-kit.integrity.json'])

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

const normalizePath = (root, file) => relative(root, file).replaceAll('\\', '/')
const sha256 = content => createHash('sha256').update(content).digest('hex')

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(version)
  if (!match) throw new Error(`Unsupported version: ${version}`)
  return { numbers: match.slice(1, 4).map(Number), prerelease: match[4]?.split('.') ?? [] }
}

function compareIdentifiers(left, right) {
  const leftNumber = /^\d+$/.test(left)
  const rightNumber = /^\d+$/.test(right)
  if (leftNumber && rightNumber) return Number(left) - Number(right)
  if (leftNumber !== rightNumber) return leftNumber ? -1 : 1
  return left.localeCompare(right)
}

export function compareSemver(leftVersion, rightVersion) {
  const left = parseSemver(leftVersion)
  const right = parseSemver(rightVersion)
  for (let index = 0; index < 3; index += 1) {
    if (left.numbers[index] !== right.numbers[index]) return Math.sign(left.numbers[index] - right.numbers[index])
  }
  if (!left.prerelease.length || !right.prerelease.length) {
    if (left.prerelease.length === right.prerelease.length) return 0
    return left.prerelease.length ? -1 : 1
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length)
  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1
    if (right.prerelease[index] === undefined) return 1
    const comparison = compareIdentifiers(left.prerelease[index], right.prerelease[index])
    if (comparison) return Math.sign(comparison)
  }
  return 0
}

export async function verifyIntegrity(layerRoot = defaultLayerRoot) {
  const manifest = JSON.parse(await readFile(resolve(layerRoot, 'courses-kit.manifest.json'), 'utf8'))
  const integrity = JSON.parse(await readFile(resolve(layerRoot, manifest.integrity.file), 'utf8'))
  const changed = []
  const missing = []
  const extra = []

  for (const [path, expectedHash] of Object.entries(integrity.files)) {
    const content = await readFile(resolve(layerRoot, path)).catch(() => null)
    if (content === null) missing.push(path)
    else if (sha256(content) !== expectedHash) changed.push(path)
  }

  const expected = new Set(Object.keys(integrity.files))
  for (const file of await listFiles(layerRoot)) {
    const path = normalizePath(layerRoot, file)
    if (!generatedFiles.has(path) && !expected.has(path)) extra.push(path)
  }

  return {
    clean: changed.length === 0 && missing.length === 0 && extra.length === 0,
    changed,
    missing,
    extra
  }
}

export async function readManifestSource(source, baseDirectory = process.cwd()) {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10_000)
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} while reading ${source}`)
    return response.json()
  }
  const path = source.startsWith('file:') ? fileURLToPath(source) : (isAbsolute(source) ? source : resolve(baseDirectory, source))
  return JSON.parse(await readFile(path, 'utf8'))
}

export function evaluateUpdate(localManifest, remoteManifest, integrity) {
  if (remoteManifest.provider?.id !== localManifest.provider?.id) {
    throw new Error(`Provider mismatch: ${remoteManifest.provider?.id ?? 'unknown'}`)
  }
  if (remoteManifest.schemaVersion !== localManifest.schemaVersion) {
    throw new Error(`Manifest schema mismatch: ${remoteManifest.schemaVersion}`)
  }

  const comparison = compareSemver(localManifest.version, remoteManifest.version)
  const status = comparison < 0 ? 'update_available' : comparison > 0 ? 'local_newer' : 'up_to_date'
  const recommendation = status === 'update_available'
    ? (integrity.clean ? 'offer_update' : 'offer_migration_preserving_local_changes')
    : (integrity.clean ? 'none' : 'report_local_changes')
  return {
    status,
    localVersion: localManifest.version,
    latestVersion: remoteManifest.version,
    compatibleGuideVersion: remoteManifest.guide?.compatibleVersion ?? null,
    releaseUrl: remoteManifest.distribution?.currentReleaseUrl ?? remoteManifest.distribution?.releasesUrl ?? localManifest.distribution?.releasesUrl ?? null,
    changelogUrl: remoteManifest.distribution?.changelogUrl ?? localManifest.distribution?.changelogUrl ?? null,
    integrity,
    recommendation,
    automaticReplacementAllowed: false
  }
}

function readOption(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1]
}

function printHuman(result) {
  console.log(`Локальная версия Courses Kit: ${result.localVersion}`)
  console.log(`Последняя опубликованная версия: ${result.latestVersion}`)
  if (result.status === 'update_available') console.log('Доступно обновление Courses Kit.')
  else if (result.status === 'local_newer') console.log('Локальная версия новее опубликованной.')
  else console.log('Courses Kit актуален.')

  if (!result.integrity.clean) {
    console.log('Локальная копия изменена и не должна заменяться автоматически.')
    for (const path of result.integrity.changed) console.log(`  изменён: ${path}`)
    for (const path of result.integrity.missing) console.log(`  отсутствует: ${path}`)
    for (const path of result.integrity.extra) console.log(`  добавлен внутрь layer: ${path}`)
  }
  else console.log('Локальная копия не изменена.')
  if (result.status === 'update_available' && result.integrity.clean) {
    console.log('Предложите обновление пользователю; не заменяйте layer без явного согласия.')
  }
  if (result.status === 'update_available' && !result.integrity.clean) {
    console.log('Предложите миграцию с сохранением локальных изменений; автоматическая замена запрещена.')
  }
  if (result.status === 'update_available' && result.changelogUrl) console.log(`Что изменилось: ${result.changelogUrl}`)
  if (result.status === 'update_available' && result.releaseUrl) console.log(`Архив: ${result.releaseUrl}`)
}

async function main() {
  const layerRoot = resolve(readOption('--layer') ?? defaultLayerRoot)
  const localManifest = JSON.parse(await readFile(resolve(layerRoot, 'courses-kit.manifest.json'), 'utf8'))
  const source = readOption('--source') ?? localManifest.distribution.latestManifestUrl
  const integrity = await verifyIntegrity(layerRoot)
  const remoteManifest = await readManifestSource(source)
  const result = evaluateUpdate(localManifest, remoteManifest, integrity)
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2))
  else printHuman(result)
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch(error => {
    const result = { status: 'check_failed', message: error.message }
    if (process.argv.includes('--json')) console.error(JSON.stringify(result, null, 2))
    else console.error(`Не удалось проверить обновления Courses Kit: ${error.message}`)
    process.exitCode = 1
  })
}
