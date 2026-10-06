import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const checklist = JSON.parse(await readFile(resolve(root, 'machine/qa-checklist.json'), 'utf8'))
const text = value => typeof value === 'string' && value.trim().length > 0

export function validateReport(report) {
  const errors = [], blockers = []
  if (!report || typeof report !== 'object' || Array.isArray(report)) return { errors: ['Expected a report object'], blockers }
  if (!Array.isArray(report.routes) || !Array.isArray(report.widths) || !Array.isArray(report.entries)
    || report.entries.some(entry => !entry || typeof entry !== 'object' || Array.isArray(entry))) {
    return { errors: ['Expected routes, widths and object entries arrays'], blockers }
  }
  if (report.schemaVersion !== 1) errors.push('Expected report schemaVersion 1')
  if (!text(report.revision) || !['design-prototype', 'working-service'].includes(report.deliverable)) errors.push('Record revision and deliverable')
  if (!Array.isArray(report.routes) || !report.routes.length || report.routes.some(route => !text(route))) errors.push('Record all assembled routes')
  if (new Set(report.routes).size !== report.routes?.length) errors.push('Duplicate routes')
  const widths = report.widths
  if (!Array.isArray(widths) || checklist.defaultWidths.some(width => !widths.includes(width))
    || widths.some(width => !Number.isInteger(width) || width <= 0) || new Set(widths).size !== widths.length) errors.push('Record base widths and any additional breakpoint widths')
  if (!Array.isArray(report.entries)) return { errors: [...errors, 'Missing entries'], blockers }
  const keys = new Set()
  for (const entry of report.entries) {
    const check = checklist.checks.find(item => item.id === entry.check)
    const key = `${entry.route}|${entry.check}|${entry.width}`
    if (keys.has(key)) errors.push(`Duplicate entry: ${key}`)
    keys.add(key)
    if (!check || !report.routes?.includes(entry.route)) errors.push(`Unknown route or check: ${key}`)
    if (!widths?.includes(entry.width)) errors.push(`Unknown viewport: ${key}`)
    if (!checklist.statuses.includes(entry.status)) errors.push(`Unknown result status: ${key}`)
    if (['not-applicable-with-reason', 'not-verified-with-reason'].includes(entry.status)) {
      if (!text(entry.reason)) errors.push(`Missing reason: ${key}`)
      if (entry.status === 'not-verified-with-reason') blockers.push(key)
      continue
    }
    if (!text(entry.expected) || !text(entry.actual) || !text(entry.steps)) errors.push(`Missing steps or expected/actual result: ${key}`)
    if (check?.productContractRequired && !text(entry.productContract)) errors.push(`Missing agreed product contract: ${key}`)
    if (!checklist.methods.includes(entry.method)) errors.push(`Unknown verification method: ${key}`)
    if (!Array.isArray(entry.evidence) || !entry.evidence.length || entry.evidence.some(item => !text(item))) errors.push(`Missing evidence reference: ${key}`)
    if (check?.id === 'visual-review' && entry.method !== 'manual-visual') errors.push(`A screenshot or automatic geometry check is not visual review: ${key}`)
    if (check?.allWidths && entry.method === 'source-review') errors.push(`Adaptive states need a browser or visual check: ${key}`)
    if (check?.productContractRequired && entry.method !== 'browser-test') errors.push(`Behavior needs a browser test, not source review: ${key}`)
    if (entry.status === 'issue-found') blockers.push(key)
  }
  for (const route of report.routes || []) {
    for (const check of checklist.checks) {
      const rows = report.entries.filter(entry => entry.route === route && entry.check === check.id)
      if (!rows.length || (check.allWidths && widths?.some(width => !rows.some(entry => entry.width === width)))) {
        errors.push(`Missing coverage: ${route}|${check.id}`)
      }
    }
  }
  return { errors, blockers }
}

export function createReport(routes) {
  if (!routes.length || routes.some(route => !text(route))) throw new Error('Provide the actual application routes')
  return { schemaVersion: 1, revision: '', deliverable: '', routes, widths: checklist.defaultWidths,
    entries: routes.flatMap(route => checklist.checks.flatMap(check => (check.allWidths ? checklist.defaultWidths : [1440])
      .map(width => ({ route, check: check.id, width, status: 'not-verified-with-reason',
        reason: 'Not executed; record applicable product contract and actual evidence before acceptance' })))) }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === '--template') {
    console.log(JSON.stringify(createReport(process.argv.slice(3)), null, 2))
  } else if (!process.argv[2]) {
    console.error('Usage: node tools/validate-application-qa.mjs <application-report.json>')
    process.exitCode = 1
  } else {
    const result = validateReport(JSON.parse(await readFile(resolve(process.argv[2]), 'utf8')))
    console.log(JSON.stringify(result, null, 2))
    if (result.errors.length || result.blockers.length) process.exitCode = 1
    else console.log('Report coverage is consistent; evidence authenticity and route completeness still require review.')
  }
}
