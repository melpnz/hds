import assert from 'node:assert/strict'
import { checklist, validateReport, createReport } from './validate-application-qa.mjs'

const report = { schemaVersion: 1, revision: 'fixture-only', deliverable: 'design-prototype', routes: ['/fixture'],
  widths: checklist.defaultWidths, entries: checklist.checks.flatMap(check => (check.allWidths ? checklist.defaultWidths : [1440])
    .map(width => ({ route: '/fixture', check: check.id, width, status: 'verified',
      method: check.id === 'visual-review' ? 'manual-visual' : check.id === 'public-api-reuse' ? 'source-review' : 'browser-test',
      steps: 'Synthetic test fixture, not application evidence', expected: 'Agreed fixture result', actual: 'Fixture result',
      productContract: 'fixture-contract', evidence: ['fixture-only'] }))) }
assert.deepEqual(validateReport(report), { errors: [], blockers: [] })
const rejects = [
  copy => { delete copy.revision },
  copy => { copy.routes.push('/omitted') },
  copy => { copy.widths.pop() },
  copy => { copy.entries.pop() },
  copy => { copy.entries.push(copy.entries[0]) },
  copy => { copy.entries[0].productContract = '' },
  copy => { copy.entries[0].actual = '' },
  copy => { copy.entries[0].evidence = [] },
  copy => { copy.entries[0].method = 'source-review' },
  copy => { copy.entries.find(row => row.check === 'visual-review').method = 'browser-test' },
  copy => { copy.entries.find(row => row.check === 'guest-and-populated').method = 'source-review' },
  copy => { copy.entries[0].status = 'not-applicable-with-reason' },
  copy => { copy.entries[0].width = 999 },
  copy => { copy.entries[0].check = 'unknown' }
]
for (const change of rejects) { const copy = structuredClone(report); change(copy); assert.ok(validateReport(copy).errors.length) }
for (const status of ['issue-found', 'not-verified-with-reason']) {
  const copy = structuredClone(report); Object.assign(copy.entries[0], { status, reason: 'Explicit fixture blocker' })
  const result = validateReport(copy); assert.equal(result.errors.length, 0); assert.equal(result.blockers.length, 1)
}
const notApplicable = structuredClone(report)
Object.assign(notApplicable.entries[0], { status: 'not-applicable-with-reason', reason: 'No repeatable action on this fixture surface' })
assert.deepEqual(validateReport(notApplicable), { errors: [], blockers: [] })
for (const invalid of [null, [], {}, { ...report, entries: [null] }, { ...report, routes: {} }, { ...report, widths: '320' }]) assert.ok(validateReport(invalid).errors.length)
const template = createReport(['/one', '/two'])
assert.equal(template.entries.length, 56)
assert.equal(validateReport(template).blockers.length, 56)
assert.throws(() => createReport([]))
console.log('Application QA report: valid, explicit N/A, 14 invalid cases, malformed inputs, pending template and 2 acceptance blockers verified; no application acceptance claimed.')
