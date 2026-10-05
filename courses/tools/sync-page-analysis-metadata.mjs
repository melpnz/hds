// Refresh accepted composition metadata without recapturing production geometry.
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export async function syncPageAnalysisMetadata(checkOnly = false) {
  const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'))
  const source = await read('machine/page-analysis/source.json')
  const atlas = await read('machine/page-analysis/atlas.json')
  const accepted = new Set(source.ownerDecisions.filter(item => ['implemented-local', 'approved-page-composition'].includes(item.status)).map(item => item.id))
  const metadata = definition => ({
    ...definition,
    approvalGaps: definition.approvalGaps.filter(id => !accepted.has(id)),
    ownerDecisions: source.ownerDecisions.filter(item => definition.approvalGaps.includes(item.id) || item.pages?.includes(definition.id))
  })
  const save = async (path, value) => {
    const output = JSON.stringify(value, null, 2) + '\n'
    const absolute = resolve(root, path)
    if (await readFile(absolute, 'utf8') === output) return
    if (checkOnly) throw new Error(`${path} metadata is stale. Run node tools/sync-page-analysis-metadata.mjs.`)
    await writeFile(absolute, output)
  }
  atlas.ownerDecisions = source.ownerDecisions
  atlas.rules = source.rules
  atlas.limits = source.limits
  atlas.providerChanges = 'All 12 component pages accepted on 2026-10-05; local kit changes are not yet published. Production measurements remain unchanged.'
  for (const definition of source.pages) {
    const entry = atlas.pages.find(page => page.id === definition.id)
    if (!entry) throw new Error(`Missing atlas page ${definition.id}`)
    Object.assign(entry, metadata(definition))
    const page = await read(entry.file)
    Object.assign(page, metadata(definition))
    await save(entry.file, page)
  }
  await save('machine/page-analysis/atlas.json', atlas)
  const reportPath = resolve(root, 'docs/reference/production-responsive-pages.md')
  const originalReport = await readFile(reportPath, 'utf8')
  let report = originalReport.replace(/## Решения владельца для новой сборки\r?\n[\s\S]*?(?=\r?\n## )/, '## Решения владельца для новой сборки\n\n' + source.ownerDecisions.map(item => '- ' + item.rule).join('\n') + '\n')
  report = report.replace('Экспертиза и квалификации внутри одной области, поэтому между ними нет общего gap40.', source.pages.find(page => page.id === 'author').notes[1])
  for (const definition of source.pages) {
    const start = report.indexOf('## ' + definition.title + '\n')
    if (start < 0) continue
    const next = report.indexOf('\n## ', start + 3)
    const end = next < 0 ? report.length : next
    const segment = report.slice(start, end).replace(/Требующие решения варианты:[^\n]*/, 'Требующие решения варианты: ' + (metadata(definition).approvalGaps.join(', ') || 'нет; страница принята 05.10.2026') + '.')
    report = report.slice(0, start) + segment + report.slice(end)
  }
  if (report !== originalReport) {
    if (checkOnly) throw new Error('Production report metadata is stale.')
    await writeFile(reportPath, report)
  }
  console.log(`${checkOnly ? 'Verified' : 'Synchronized'} page metadata: ${source.pages.length} pages; production measurements preserved.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncPageAnalysisMetadata(process.argv.includes('--check'))
}
