import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acceptedDecisionStatuses, validateOwnerDecisionMetadata } from './sync-page-analysis-metadata.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = JSON.parse(await readFile(resolve(root, 'machine/page-analysis/source.json'), 'utf8'))
validateOwnerDecisionMetadata(source.ownerDecisions)
assert(acceptedDecisionStatuses.has('implemented-published'))
assert(acceptedDecisionStatuses.has('implemented-local'))
assert(acceptedDecisionStatuses.has('approved-page-composition'))

const published = source.ownerDecisions.find(decision => decision.status === 'implemented-published')
assert(published, 'published decisions exist')
const invalid = mutate => {
  const decision = structuredClone(published)
  mutate(decision)
  assert.throws(() => validateOwnerDecisionMetadata([decision]))
}
invalid(decision => { delete decision.includedInRelease })
invalid(decision => { decision.includedInRelease.providerVersion = 'unknown' })
invalid(decision => { decision.includedInRelease.releaseTag = 'courses-nuxt-kit-v0.0.0' })
invalid(decision => { decision.includedInRelease.artifacts = [] })
invalid(decision => { decision.includedInRelease.artifacts = ['unknown'] })
invalid(decision => { decision.includedInRelease.artifacts = ['layer', 'layer'] })
invalid(decision => { decision.includedInRelease.artifacts = ['catalog'] })
invalid(decision => { decision.pages = ['author'] })
invalid(decision => { decision.rule += ' Доработка пока не опубликована.' })
invalid(decision => { decision.rule += ' Not yet published.' })
invalid(decision => { decision.status = 'implemented-local' })
validateOwnerDecisionMetadata([{ id: 'pending-local-fix', status: 'implemented-local', rule: 'Не опубликовано.' }])

// These checks also run in distributed guide copies without git history.
const atlas = JSON.parse(await readFile(resolve(root, 'machine/page-analysis/atlas.json'), 'utf8'))
for (const page of source.pages) {
  const current = JSON.parse(await readFile(resolve(root, `machine/page-analysis/pages/${page.id}.json`), 'utf8'))
  assert.deepEqual(current.measurements.map(item => item.width).sort((a, b) => a - b),
    [...source.widths].sort((a, b) => a - b), `${page.id}: captured widths preserved`)
  assert.equal(current.reference, `${atlas.evidenceRoot}/${page.id}/index.html`, `${page.id}: reference binding`)
  assert(current.approvalGaps.every(id => !source.ownerDecisions.some(decision =>
    decision.id === id && acceptedDecisionStatuses.has(decision.status))), `${page.id}: accepted decisions stay out of approval gaps`)
}
console.log(`Page metadata checks passed: ${source.ownerDecisions.length} decisions, 11 forbidden publication cases, ${source.pages.length} measurement/reference contracts.`)
