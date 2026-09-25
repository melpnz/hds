import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { compareSemver, evaluateUpdate, readManifestSource, verifyIntegrity } from '../layers/courses/scripts/check-update.mjs'

const layerRoot = resolve('layers', 'courses')
const localManifest = await readManifestSource(resolve(layerRoot, 'courses-kit.manifest.json'))
const packageJson = await readManifestSource(resolve('package.json'))
const tokenManifest = await readManifestSource(resolve(layerRoot, 'courses-kit.tokens.json'))
const integrity = await verifyIntegrity(layerRoot)

assert.equal(integrity.clean, true, JSON.stringify(integrity, null, 2))
assert.equal(localManifest.schemaVersion, 2)
assert.equal(localManifest.version, packageJson.version)
assert.equal(localManifest.distribution.archiveName, `courses-nuxt-kit-v${localManifest.version}.zip`)
assert.equal(localManifest.distribution.releaseTag, `courses-nuxt-kit-v${localManifest.version}`)
assert.equal(localManifest.components.public.length, 72)
assert.equal(localManifest.tokens.manifest, 'courses-kit.tokens.json')
assert.equal(localManifest.tokens.count, tokenManifest.count)
assert.equal(tokenManifest.namespace, '--crs-')
assert.ok(tokenManifest.count > 100)
assert.equal(tokenManifest.tokens['blue-500'].value, '#346ef4')
assert.equal(tokenManifest.tokens['radius-24'].type, 'dimension')
assert.deepEqual(tokenManifest.tokens.green.references, ['--crs-green-500'])
assert.ok(localManifest.components.public.every(component =>
  Array.isArray(component.api?.props)
  && Array.isArray(component.api?.slots)
  && Array.isArray(component.api?.emits)
  && Array.isArray(component.api?.models)
), 'Every public component must expose a generated API contract.')
const buttonApi = localManifest.components.public.find(component => component.id === 'button')?.api
assert.deepEqual(buttonApi.slots.map(slot => slot.name), ['default', 'leading', 'trailing'])
assert.ok(buttonApi.props.some(prop => prop.name === 'variant' && prop.type.includes("'primary'")))
const filterModalApi = localManifest.components.public.find(component => component.id === 'filter-modal')?.api
assert.ok(filterModalApi.emits.some(event => event.name === 'update:modelValue' && event.source === 'model'))
assert.ok(filterModalApi.emits.some(event => event.name === 'apply' && event.source === 'emit'))
assert.equal(compareSemver('1.0.0', '1.0.0'), 0)
assert.equal(compareSemver('1.0.1', '1.0.0'), 1)
assert.equal(compareSemver('1.0.0', '1.1.0'), -1)
assert.equal(compareSemver('1.0.0-beta.2', '1.0.0-beta.10'), -1)
assert.equal(compareSemver('1.0.0', '1.0.0-beta.1'), 1)

const newer = structuredClone(localManifest)
newer.version = '1.1.0'
const cleanUpdate = evaluateUpdate(localManifest, newer, integrity)
assert.equal(cleanUpdate.status, 'update_available')
assert.equal(cleanUpdate.recommendation, 'offer_update')
assert.equal(cleanUpdate.automaticReplacementAllowed, false)
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
  const changedIntegrity = await verifyIntegrity(fixtureRoot)
  assert.deepEqual(changedIntegrity.changed, ['components/Example.vue'])
  const dirtyUpdate = evaluateUpdate(localManifest, newer, changedIntegrity)
  assert.equal(dirtyUpdate.recommendation, 'offer_migration_preserving_local_changes')
  assert.equal(dirtyUpdate.automaticReplacementAllowed, false)
  await writeFile(resolve(fixtureRoot, 'components', 'Extra.vue'), 'extra\n')
  assert.deepEqual((await verifyIntegrity(fixtureRoot)).extra, ['components/Extra.vue'])
  await rm(resolve(fixtureRoot, 'components', 'Example.vue'))
  assert.deepEqual((await verifyIntegrity(fixtureRoot)).missing, ['components/Example.vue'])
} finally {
  await rm(fixtureRoot, { recursive: true, force: true })
}

console.log(`Courses Kit version checks passed: ${localManifest.version}, ${Object.keys((await readManifestSource(resolve(layerRoot, localManifest.integrity.file))).files).length} integrity entries.`)
