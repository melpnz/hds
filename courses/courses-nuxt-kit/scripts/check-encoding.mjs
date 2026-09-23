import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const roots = ['app', 'layers', 'tests']
const extensions = new Set(['.css', '.md', '.ts', '.vue'])
const ignored = new Set(['.nuxt', '.output', 'node_modules', 'test-results'])
const broken = []

async function scan(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue
    const path = join(directory, item.name)
    if (item.isDirectory()) {
      await scan(path)
      continue
    }
    if (!extensions.has(extname(item.name))) continue
    const content = await readFile(path, 'utf8')
    if (content.includes('\uFFFD')) broken.push(path)
  }
}

for (const root of roots) await scan(root)

if (broken.length) {
  console.error(`Invalid UTF-8 replacement characters found:\n${broken.join('\n')}`)
  process.exit(1)
}

console.log('Encoding check passed: no UTF-8 replacement characters found.')
