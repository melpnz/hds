import { readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse, compileTemplate } from '@vue/compiler-sfc'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mapping = JSON.parse(await readFile(resolve(root, 'machine/providers/courses-nuxt-kit.json'), 'utf8'))
const publicNames = new Set(mapping.mappings.filter(item => item.visibility === 'public').map(item => item.exportName))
const normalizedNames = new Map([...publicNames].map(name => [name.replaceAll('-', '').toLowerCase(), name]))

export function analyzeSource(source, filename = 'fixture.vue') {
  const { descriptor, errors } = parse(source, { filename })
  if (errors.length) throw new Error(`Cannot parse ${filename}: ${errors.join(', ')}`)
  if (!descriptor.template) return { used: [], review: [], limitations: ['No inline Vue template; inspect render functions or external templates manually'] }
  const compiled = compileTemplate({ source: descriptor.template.content, filename, id: 'reuse-audit' })
  if (compiled.errors.length) throw new Error(`Cannot compile ${filename}: ${compiled.errors.join(', ')}`)
  const used = new Set(), review = []
  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 1) {
      const tag = node.tag
      const name = normalizedNames.get(tag.replaceAll('-', '').toLowerCase())
      if (name && node.tagType === 1) used.add(name)
      const props = node.props || []
      const type = props.find(prop => prop.type === 6 && prop.name === 'type')?.value?.content
      let candidates
      if (node.tagType === 0 && tag === 'textarea') candidates = ['Textarea']
      if (node.tagType === 0 && tag === 'select') candidates = ['Select', 'MultiSelect']
      if (node.tagType === 0 && tag === 'button') candidates = ['Button', 'IconButton', 'Link', 'FilterChip']
      if (node.tagType === 0 && tag === 'input' && type !== 'hidden') {
        candidates = type === 'checkbox' ? ['Checkbox', 'Switch'] : type === 'radio' ? ['RadioButton'] : ['TextInput', 'SearchInput']
      }
      if (candidates) review.push({ tag, line: descriptor.template.loc.start.line + node.loc.start.line - 1,
        candidates: candidates.filter(candidate => publicNames.has(candidate)),
        disposition: 'needs-review-not-proven-violation' })
      if (tag === 'component') review.push({ tag, line: descriptor.template.loc.start.line + node.loc.start.line - 1,
        candidates: [], disposition: 'resolve-dynamic-component-manually' })
    }
    for (const child of node.children || []) visit(child)
    for (const branch of node.branches || []) visit(branch)
  }
  visit(compiled.ast)
  return { used: [...used].sort(), review, limitations: [] }
}

async function scan(directory, appRoot) {
  const results = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || ['node_modules', '.git', '.nuxt', '.output', 'layers', 'dist', 'test-results'].includes(entry.name)) continue
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) results.push(...await scan(path, appRoot))
    else if (entry.name.endsWith('.vue')) results.push({ file: relative(appRoot, path).replaceAll('\\', '/'), ...analyzeSource(await readFile(path, 'utf8'), path) })
  }
  return results
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv[2]) { console.error('Usage: node tools/audit-application-reuse.mjs <application-source-directory>'); process.exitCode = 1 }
  else {
    const files = await scan(resolve(process.argv[2]), resolve(process.argv[2]))
    console.log(JSON.stringify({ kind: 'read-only-advisory-audit', files,
      reviewCount: files.reduce((count, file) => count + file.review.length, 0),
      acceptance: 'not-determined', limitations: ['Cannot prove wrapper internals, import aliases, JSX or dynamic component identity; inspect those manually.',
        'Native markup can be justified; compare each finding with the reuse plan and public API before deciding.'] }, null, 2))
  }
}
