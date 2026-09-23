import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layerPath = 'courses/courses-nuxt-kit/layers/courses'
const manifestPath = resolve(kitRoot, 'layers', 'courses', 'courses-kit.manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const outputDirectory = resolve(kitRoot, 'dist')
const archiveName = `courses-nuxt-kit-v${manifest.version}.zip`
const archivePath = resolve(outputDirectory, archiveName)
const checksumPath = `${archivePath}.sha256`

if (!manifest.source?.commitSha) throw new Error('Bind the manifest to a source commit before creating a release.')

execFileSync(process.execPath, ['scripts/generate-kit-manifest.mjs', '--check'], {
  cwd: kitRoot,
  stdio: 'inherit'
})

const repositoryRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: kitRoot,
  encoding: 'utf8'
}).trim()
const layerChanges = execFileSync('git', ['status', '--porcelain', '--', layerPath], {
  cwd: repositoryRoot,
  encoding: 'utf8'
}).trim()
if (layerChanges) throw new Error('Commit or revert layer changes before creating a release archive.')

await mkdir(outputDirectory, { recursive: true })
await rm(archivePath, { force: true })
await rm(checksumPath, { force: true })

execFileSync('git', [
  'archive',
  '--format=zip',
  '--prefix=layers/courses/',
  `--output=${archivePath}`,
  'HEAD',
  layerPath
], { cwd: repositoryRoot, stdio: 'inherit' })

const archive = await readFile(archivePath)
const checksum = createHash('sha256').update(archive).digest('hex')
await writeFile(checksumPath, `${checksum}  ${archiveName}\n`, 'utf8')

console.log(`Created ${archivePath}`)
console.log(`SHA-256 ${checksum}`)
