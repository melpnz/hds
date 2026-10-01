import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFile, readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layer = 'courses/courses-nuxt-kit/layers/courses'
const bundle = resolve(root, 'courses-release-bundle')
const catalog = resolve(root, 'courses-static-catalog')
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

export function releaseVersion(tag) {
  const match = /^courses-nuxt-kit-v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/.exec(tag ?? '')
  if (!match) throw new Error('Use an exact stable tag: courses-nuxt-kit-vX.Y.Z')
  return match[1]
}

export function validateManifest(tag, manifest, packageJson, changelog) {
  const version = releaseVersion(tag)
  if (manifest.version !== version || packageJson.version !== version) throw new Error('Tag/package/manifest versions differ')
  if (manifest.distribution.releaseTag !== tag || manifest.distribution.archiveName !== tag + '.zip') throw new Error('Distribution does not match the tag')
  if (!/^[a-f0-9]{40}$/.test(manifest.source?.commitSha ?? '')) throw new Error('Manifest must be bound to an exact source commit')
  const heading = '## ' + version + ' — ' + manifest.releasedAt
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.releasedAt) || !changelog.split(/\r?\n/).includes(heading)) throw new Error('Dated release notes are missing')
  return { version, heading }
}

export function validateEntries(entries, kind) {
  if (!entries.length) throw new Error('Empty archive')
  for (const path of entries) {
    if (path.startsWith('/') || path.includes('\\') || path.split('/').includes('..') || /^[A-Za-z]:/.test(path)) throw new Error('Unsafe archive path')
    if (/(^|\/)(node_modules|\.nuxt|\.output|test-results|playwright-report)(\/|$)/.test(path)) throw new Error('Build/dependency directory in archive')
    if (kind === 'layer' && !path.startsWith('layers/courses/')) throw new Error('Layer archive has an unexpected root')
  }
  if (kind === 'layer' && !entries.includes('layers/courses/courses-kit.manifest.json')) throw new Error('Layer manifest missing')
  if (kind === 'catalog' && !entries.includes('courses-kit.release.json')) throw new Error('Catalog provenance missing')
}

export function validateBundlePlan(plan, tag, commit) {
  const version = releaseVersion(tag)
  const expected = [tag + '.zip', tag + '.zip.sha256', tag + '-catalog.zip', tag + '-catalog.zip.sha256']
  if (plan.tag !== tag || plan.version !== version || plan.commit !== commit || !/^[a-f0-9]{40}$/.test(commit)) throw new Error('Bundle provenance does not match the tested revision')
  if (JSON.stringify(plan.assets) !== JSON.stringify(expected)) throw new Error('Unexpected release assets')
}

function inspectTag(tag) {
  releaseVersion(tag)
  const ref = 'refs/tags/' + tag
  if (git('cat-file', '-t', ref) !== 'tag') throw new Error('Release tag must be annotated and already exist')
  const commit = git('rev-parse', ref + '^{commit}')
  git('merge-base', '--is-ancestor', commit, 'origin/main')
  const readAt = path => git('show', commit + ':' + path)
  const manifest = JSON.parse(readAt(layer + '/courses-kit.manifest.json'))
  const packageJson = JSON.parse(readAt('courses/courses-nuxt-kit/package.json'))
  const changelog = readAt(layer + '/CHANGELOG.md')
  const { version, heading } = validateManifest(tag, manifest, packageJson, changelog)
  git('merge-base', '--is-ancestor', manifest.source.commitSha, commit)
  git('diff', '--exit-code', manifest.source.commitSha, commit, '--', layer,
    ':(exclude)' + layer + '/courses-kit.manifest.json',
    ':(exclude)' + layer + '/courses-kit.integrity.json')
  const notes = changelog.slice(changelog.indexOf(heading) + heading.length).split(/\n## /)[0].trim()
  return { tag, commit, version, manifest, notes }
}

async function ensureNoRelease(tag) {
  if (!process.env.GITHUB_REPOSITORY || !process.env.GH_TOKEN) throw new Error('GitHub repository and temporary token are required')
  const response = await fetch('https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + '/releases/tags/' + tag, {
    headers: { Authorization: 'Bearer ' + process.env.GH_TOKEN, Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(30000)
  })
  if (response.status === 404) return
  if (response.ok) throw new Error('A release already exists; nothing will be overwritten')
  throw new Error('Cannot verify existing releases: HTTP ' + response.status)
}

function archiveEntries(path) {
  const output = process.platform === 'win32'
    ? execFileSync('tar', ['-tf', path], { encoding: 'utf8' })
    : execFileSync('unzip', ['-Z1', path], { encoding: 'utf8' })
  return output.trim().split(/\r?\n/)
}

async function rejectSymlinks(directory) {
  for (const entry of await readdir(directory)) {
    const path = resolve(directory, entry)
    const info = await lstat(path)
    if (info.isSymbolicLink()) throw new Error('Symlinks are not allowed in catalog assets')
    if (info.isDirectory()) await rejectSymlinks(path)
  }
}

async function checksum(path, name) {
  const hash = createHash('sha256').update(await readFile(path)).digest('hex')
  await writeFile(path + '.sha256', hash + '  ' + name + '\n')
}

async function verifyBundle(plan) {
  for (const kind of ['layer', 'catalog']) {
    const name = plan.tag + (kind === 'layer' ? '.zip' : '-catalog.zip')
    const path = resolve(bundle, name)
    const hash = createHash('sha256').update(await readFile(path)).digest('hex')
    const checksumText = await readFile(path + '.sha256', 'utf8')
    if (checksumText !== hash + '  ' + name + '\n') throw new Error('Checksum mismatch: ' + name)
    validateEntries(archiveEntries(path), kind)
  }
}

async function run(command) {
  const tag = process.env.COURSES_RELEASE_TAG
  if (process.env.GITHUB_REF && process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Start release workflow from main only')
  const plan = inspectTag(tag)
  if (process.env.COURSES_RELEASE_COMMIT && plan.commit !== process.env.COURSES_RELEASE_COMMIT) throw new Error('Tag moved after checks; refusing release')
  if (command === 'check') {
    console.log(JSON.stringify({ tag, version: plan.version, commit: plan.commit }, null, 2))
    return
  }
  if (command === 'preflight') {
    if (process.env.COURSES_RELEASE_DRY_RUN !== 'true') await ensureNoRelease(tag)
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, 'commit=' + plan.commit + '\n')
    console.log('Validated release tag ' + tag + ' at ' + plan.commit)
    return
  }
  if (command === 'package') {
    if (!process.env.COURSES_RELEASE_COMMIT) throw new Error('A tested commit is required')
    await rejectSymlinks(catalog)
    await readFile(resolve(catalog, 'ui/index.html'))
    await mkdir(bundle) // Existing output is never overwritten.
    const layerName = tag + '.zip'
    execFileSync('git', ['archive', '--format=zip', '--prefix=layers/courses/',
      '--output=' + resolve(bundle, layerName), plan.commit + ':' + layer], { cwd: root })
    await checksum(resolve(bundle, layerName), layerName)
    const catalogName = tag + '-catalog.zip'
    await writeFile(resolve(catalog, 'courses-kit.release.json'), JSON.stringify({
      tag, version: plan.version, commit: plan.commit, guideVersion: plan.manifest.guide.compatibleVersion
    }, null, 2) + '\n')
    execFileSync('zip', ['-qr', resolve(bundle, catalogName), '.'], { cwd: catalog })
    await checksum(resolve(bundle, catalogName), catalogName)
    const provenance = { tag, version: plan.version, commit: plan.commit,
      assets: [layerName, layerName + '.sha256', catalogName, catalogName + '.sha256'] }
    validateBundlePlan(provenance, tag, plan.commit)
    await writeFile(resolve(bundle, 'release-plan.json'), JSON.stringify(provenance, null, 2) + '\n')
    const runUrl = process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? 'https://github.com/' + process.env.GITHUB_REPOSITORY + '/actions/runs/' + process.env.GITHUB_RUN_ID : 'Local package check'
    await writeFile(resolve(bundle, 'release-notes.md'),
      '# Courses Nuxt Kit v' + plan.version + '\n\n' + plan.notes +
      '\n\nSource revision: ' + plan.commit + '\n\nChecks: ' + runUrl +
      '\n\nDraft only: the maintainer decides when to publish. Product copies are never updated automatically.' +
      '\n\nCatalog ZIP is a root-hosted static preview; the full icon explorer requires a local server API.\n')
    await verifyBundle(provenance)
    console.log('Packaged tested layer + catalog with verified SHA-256')
    return
  }
  if (command === 'draft') {
    if (!process.env.COURSES_RELEASE_COMMIT) throw new Error('A tested commit is required')
    const provenance = JSON.parse(await readFile(resolve(bundle, 'release-plan.json'), 'utf8'))
    validateBundlePlan(provenance, tag, plan.commit)
    await verifyBundle(provenance)
    await ensureNoRelease(tag)
    execFileSync('gh', ['release', 'create', tag, ...provenance.assets.map(name => resolve(bundle, name)),
      '--repo', process.env.GITHUB_REPOSITORY, '--verify-tag', '--draft', '--latest=false',
      '--title', 'Courses Nuxt Kit v' + plan.version, '--notes-file', resolve(bundle, 'release-notes.md')], { stdio: 'inherit' })
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,
      'Draft **' + tag + '** created. Review its assets and publish manually from GitHub Releases.\n')
    return
  }
  throw new Error('Use: check, preflight, package or draft')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await run(process.argv[2])
}
