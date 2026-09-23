import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const roots = [join(process.cwd(), 'app'), join(process.cwd(), 'layers', 'courses')]
const allowed = new Set([479, 480, 767, 768, 1023, 1024])
const violations = []

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collect(path))
    else if (['.vue', '.css', '.ts'].includes(extname(entry.name))) files.push(path)
  }
  return files
}

for (const root of roots) {
  for (const file of await collect(root)) {
    const source = await readFile(file, 'utf8')
    const patterns = [
      /\((?:min|max)-width\s*:\s*(\d+)px\)/g,
      /(?:min|max)-\[(\d+)px\]/g
    ]
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const prefix = source.slice(Math.max(0, match.index - 24), match.index)
        if (prefix.includes('@container')) continue
        const width = Number(match[1])
        if (!allowed.has(width)) violations.push(`${relative(process.cwd(), file)}: unsupported breakpoint ${width}px in "${match[0]}"`)
      }
    }
  }
}

if (violations.length) {
  console.error(`Breakpoint check failed:\n${violations.join('\n')}`)
  process.exit(1)
}

console.log('Breakpoint check passed: only 480, 768 and 1024 boundaries are used.')
