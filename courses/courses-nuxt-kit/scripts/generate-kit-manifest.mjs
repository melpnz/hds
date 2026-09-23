import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layerRoot = resolve(kitRoot, 'layers', 'courses')
const manifestPath = resolve(layerRoot, 'courses-kit.manifest.json')
const integrityPath = resolve(layerRoot, 'courses-kit.integrity.json')
const checkOnly = process.argv.includes('--check')
const excludedFiles = new Set(['courses-kit.manifest.json', 'courses-kit.integrity.json'])

function readOption(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1]
}

const packageJson = JSON.parse(await readFile(resolve(kitRoot, 'package.json'), 'utf8'))
const guideIndex = JSON.parse(await readFile(resolve(kitRoot, '..', 'machine', 'index.json'), 'utf8'))
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

const files = (await listFiles(layerRoot))
  .map(file => ({ absolute: file, path: normalizePath(file) }))
  .filter(file => !excludedFiles.has(file.path))

const checksums = {}
for (const file of files) checksums[file.path] = sha256(await readFile(file.absolute))

const manifest = {
  schemaVersion: 1,
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
