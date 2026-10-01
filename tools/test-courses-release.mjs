import assert from 'node:assert/strict'
import { releaseVersion, validateManifest, validateEntries, validateBundlePlan } from './courses-release.mjs'

const tag = 'courses-nuxt-kit-v1.2.0'
const commit = 'a'.repeat(40)
assert.equal(releaseVersion(tag), '1.2.0')
for (const bad of ['', 'main', 'courses-nuxt-kit-v01.2.0', 'courses-nuxt-kit-v1.2.0-beta',
  'courses-nuxt-kit-v1.2.0;echo', '--help', 'courses-nuxt-kit-v1.2.0\n']) {
  assert.throws(() => releaseVersion(bad))
}
const manifest = { version: '1.2.0', releasedAt: '2026-10-01', source: { commitSha: commit },
  distribution: { releaseTag: tag, archiveName: tag + '.zip' } }
const notes = '## 1.2.0 — 2026-10-01\n\nRelease notes'
assert.equal(validateManifest(tag, manifest, { version: '1.2.0' }, notes).version, '1.2.0')
assert.throws(() => validateManifest(tag, manifest, { version: '1.1.0' }, notes))
assert.throws(() => validateManifest(tag, { ...manifest, source: {} }, { version: '1.2.0' }, notes))
assert.throws(() => validateManifest(tag, manifest, { version: '1.2.0' }, '## Unreleased'))
const safeLayer = ['layers/courses/', 'layers/courses/courses-kit.manifest.json']
validateEntries(safeLayer, 'layer')
for (const bad of ['../escape', '/absolute', 'layers/courses/node_modules/package/index.js',
  'layers/courses/../../escape', 'C:/escape', 'layers\\courses\\escape']) {
  assert.throws(() => validateEntries([...safeLayer, bad], 'layer'))
}
assert.throws(() => validateEntries(['other/'], 'layer'))
validateEntries(['courses-kit.release.json', '_nuxt/app.js'], 'catalog')
assert.throws(() => validateEntries(['index.html'], 'catalog'))
const plan = { tag, version: '1.2.0', commit,
  assets: [tag + '.zip', tag + '.zip.sha256', tag + '-catalog.zip', tag + '-catalog.zip.sha256'] }
validateBundlePlan(plan, tag, commit)
assert.throws(() => validateBundlePlan({ ...plan, commit: 'b'.repeat(40) }, tag, commit))
assert.throws(() => validateBundlePlan({ ...plan, assets: ['../escape.zip'] }, tag, commit))
console.log('Release safety tests passed: strict tag/version/source, provenance and archive boundaries.')
