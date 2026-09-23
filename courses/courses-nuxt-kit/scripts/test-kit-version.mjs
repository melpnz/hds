import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { compareSemver, evaluateUpdate, readManifestSource, verifyIntegrity } from '../layers/courses/scripts/check-update.mjs'

const layerRoot = resolve('layers', 'courses')
const localManifest = await readManifestSource(resolve(layerRoot, 'courses-kit.manifest.json'))
const integrity = await verifyIntegrity(layerRoot)

assert.equal(integrity.clean, true, JSON.stringify(integrity, null, 2))
assert.equal(compareSemver('1.0.0', '1.0.0'), 0)
assert.equal(compareSemver('1.0.1', '1.0.0'), 1)
assert.equal(compareSemver('1.0.0', '1.1.0'), -1)
assert.equal(compareSemver('1.0.0-beta.2', '1.0.0-beta.10'), -1)
assert.equal(compareSemver('1.0.0', '1.0.0-beta.1'), 1)

const newer = structuredClone(localManifest)
newer.version = '1.1.0'
assert.equal(evaluateUpdate(localManifest, newer, integrity).status, 'update_available')
assert.equal(evaluateUpdate(newer, localManifest, integrity).status, 'local_newer')
assert.equal(evaluateUpdate(localManifest, localManifest, integrity).status, 'up_to_date')

const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'courses-kit-integrity-'))
try {
  const fixtureContent = 'original\n'
  const fixtureHash = createHash('sha256').update(fixtureContent).digest('hex')
  await mkdir(resolve(fixtureRoot, 'components'))
  await writeFile(resolve(fixtureRoot, 'components', 'Example.vue'), fixtureContent)
  await writeFile(resolve(fixtureRoot, 'courses-kit.manifest.json'), JSON.stringify({
    integrity: { file: 'courses-kit.integrity.json' }
  }))
  await writeFile(resolve(fixtureRoot, 'courses-kit.integrity.json'), JSON.stringify({
    files: { 'components/Example.vue': fixtureHash }
  }))

  assert.equal((await verifyIntegrity(fixtureRoot)).clean, true)
  await writeFile(resolve(fixtureRoot, 'components', 'Example.vue'), 'changed\n')
  assert.deepEqual((await verifyIntegrity(fixtureRoot)).changed, ['components/Example.vue'])
  await writeFile(resolve(fixtureRoot, 'components', 'Extra.vue'), 'extra\n')
  assert.deepEqual((await verifyIntegrity(fixtureRoot)).extra, ['components/Extra.vue'])
  await rm(resolve(fixtureRoot, 'components', 'Example.vue'))
  assert.deepEqual((await verifyIntegrity(fixtureRoot)).missing, ['components/Example.vue'])
} finally {
  await rm(fixtureRoot, { recursive: true, force: true })
}

console.log(`Courses Kit version checks passed: ${localManifest.version}, ${Object.keys((await readManifestSource(resolve(layerRoot, localManifest.integrity.file))).files).length} integrity entries.`)
