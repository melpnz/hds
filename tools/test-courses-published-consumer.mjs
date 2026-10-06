import { createHash } from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { once } from 'node:events'
import { createServer } from 'node:net'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repository = 'melpnz/hds'
const prefix = 'courses-nuxt-kit-v'
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

export const archiveTool = (platform = process.platform) => platform === 'win32' ? 'tar' : 'bsdtar'

export function releaseTag(value) {
  const version = value.startsWith(prefix) ? value.slice(prefix.length) : value
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Expected a stable version X.Y.Z or Courses release tag')
  return `${prefix}${version}`
}

export function validateRelease(release, tag) {
  if (release.tag_name !== tag || release.draft || !release.published_at || release.prerelease) {
    throw new Error('Expected the specified published stable release, not a draft')
  }
  const name = `${tag}.zip`
  return [name, `${name}.sha256`].map(assetName => {
    const matches = release.assets.filter(asset => asset.name === assetName)
    const expected = `https://github.com/${repository}/releases/download/${tag}/${assetName}`
    if (matches.length !== 1 || matches[0].browser_download_url !== expected) {
      throw new Error(`Missing or unexpected release attachment: ${assetName}`)
    }
    return matches[0]
  })
}

export function verifyChecksum(bytes, checksum, name) {
  const match = checksum.trim().match(/^([a-fA-F0-9]{64})\s+\*?([^\r\n]+)$/)
  if (!match || match[2] !== name || sha256(bytes) !== match[1].toLowerCase()) {
    throw new Error('Published archive SHA-256 or attachment filename does not match')
  }
  return match[1].toLowerCase()
}

export function validateArchiveEntries(entries) {
  if (!entries.length) throw new Error('Empty archive')
  for (const entry of entries) {
    if (!entry.startsWith('layers/courses/') || /[\\:\x00]/.test(entry)
      || entry.split('/').some(part => part === '..' || part === '.')
      || /(^|\/)(node_modules|\.git|\.nuxt|\.output)(\/|$)/.test(entry)) {
      throw new Error(`Unsafe or unexpected archive entry: ${entry}`)
    }
  }
}

async function download(url, authenticated = false) {
  const headers = { 'User-Agent': 'courses-published-consumer-test' }
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (authenticated && token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(120000) })
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

async function filesBelow(directory, current = '') {
  const result = []
  for (const entry of await readdir(resolve(directory, current), { withFileTypes: true })) {
    const name = current ? `${current}/${entry.name}` : entry.name
    if (entry.isDirectory()) result.push(...await filesBelow(directory, name))
    else if (entry.isFile()) result.push(name)
    else throw new Error(`Unsupported archive file: ${name}`)
  }
  return result
}

async function checkIntegrity(layer, version) {
  const integrity = JSON.parse(await readFile(resolve(layer, 'courses-kit.integrity.json'), 'utf8'))
  if (integrity.version !== version || integrity.algorithm !== 'sha256'
    || integrity.providerId !== 'courses-nuxt-kit') throw new Error('Unexpected integrity metadata')
  const expected = Object.keys(integrity.files)
  validateArchiveEntries(expected.map(name => `layers/courses/${name}`))
  const actual = (await filesBelow(layer)).filter(name => !['courses-kit.manifest.json', 'courses-kit.integrity.json'].includes(name))
  if (JSON.stringify(actual.sort()) !== JSON.stringify(expected.sort())) throw new Error('Integrity file list differs from extracted layer')
  for (const name of expected) {
    if (sha256(await readFile(resolve(layer, name))) !== integrity.files[name]) throw new Error(`Integrity mismatch: ${name}`)
  }
  return expected.length
}

function pnpm(cwd, args) {
  const windows = process.platform === 'win32'
  const env = { ...process.env, CI: '1' }
  delete env.GITHUB_TOKEN
  delete env.GH_TOKEN
  execFileSync(windows ? (process.env.ComSpec || 'cmd.exe') : 'pnpm',
    windows ? ['/d', '/s', '/c', 'pnpm', ...args] : args,
    { cwd, env, stdio: 'inherit', timeout: 900000 })
}

async function smoke(cwd) {
  // Nitro treats 0 as its default 3000, so obtain an ephemeral port before launching it.
  const probe = createServer()
  await new Promise((resolveReady, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolveReady) })
  const port = probe.address().port
  await new Promise((resolveClosed, reject) => probe.close(error => error ? reject(error) : resolveClosed()))
  const env = { ...process.env, NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port), PORT: String(port) }
  delete env.GITHUB_TOKEN
  delete env.GH_TOKEN
  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd, env,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  const collect = chunk => { output += chunk.toString(); if (output.length > 100000) output = output.slice(-100000) }
  server.stdout.on('data', collect)
  server.stderr.on('data', collect)
  let spawnError
  server.on('error', error => { spawnError = error })
  try {
    const deadline = Date.now() + 60000
    let origin
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError
      if (server.exitCode !== null) throw new Error(`Consumer server exited: ${output}`)
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/)
      if (match && match[1] !== '0') { origin = match[0]; break }
      await new Promise(resolveWait => setTimeout(resolveWait, 200))
    }
    if (!origin) throw new Error(`Consumer server did not become ready: ${output}`)
    const response = await fetch(origin, { signal: AbortSignal.timeout(30000) })
    const html = await response.text()
    if (!response.ok || !html.includes('Выбрать курс') || !html.includes('Frontend-разработчик')
      || !html.includes('<footer')) throw new Error('Published consumer SSR smoke failed')
    const urls = [...new Set([...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]))]
      .filter(url => url.startsWith('/') && !url.startsWith('//') && /\.(css|js|svg|png|webp|jpg|woff2?)(?:\?|$)/.test(url))
    if (!urls.some(url => /\.css(?:\?|$)/.test(url))) throw new Error('Built consumer has no CSS asset')
    const checked = new Set()
    for (const url of urls) {
      const asset = await fetch(new URL(url, origin), { signal: AbortSignal.timeout(30000) })
      if (!asset.ok) throw new Error(`Consumer asset unavailable: ${url} (${asset.status})`)
      checked.add(url)
      if (/\.css(?:\?|$)/.test(url)) {
        const css = await asset.text()
        for (const match of css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)) {
          if (match[1].startsWith('data:')) continue
          const font = new URL(match[1], new URL(url, origin))
          if (font.origin !== origin) throw new Error(`CSS depends on an external asset: ${font.href}`)
          const result = await fetch(font, { signal: AbortSignal.timeout(30000) })
          if (!result.ok) throw new Error(`CSS asset unavailable: ${font.pathname} (${result.status})`)
          checked.add(font.pathname)
        }
      }
    }
    return { status: response.status, checkedAssets: checked.size }
  } finally {
    if (server.exitCode === null && !spawnError) {
      const exited = once(server, 'exit')
      server.kill()
      await exited
    }
  }
}

export async function main(args = process.argv.slice(2)) {
  if (args.length > 1) throw new Error('Usage: node tools/test-courses-published-consumer.mjs [X.Y.Z|release-tag]')
  const workflow = JSON.parse(await readFile(resolve(root, 'courses/machine/consumer-workflow.json'), 'utf8'))
  if (!args[0] && !process.env.COURSES_RELEASE_TAG && workflow.distribution.availability !== 'published') {
    throw new Error('The guide default release is not published; specify an already published version explicitly')
  }
  const tag = releaseTag(args[0] || process.env.COURSES_RELEASE_TAG || workflow.provider.version)
  const version = tag.slice(prefix.length)
  const reportRoot = resolve(root, 'courses/courses-nuxt-kit/test-results/published-consumer')
  await mkdir(reportRoot, { recursive: true })
  const report = { version, tag, startedAt: new Date().toISOString(), steps: [], passed: false }
  const consumer = await mkdtemp(resolve(tmpdir(), 'courses-published-consumer-'))
  const step = async (name, action) => {
    console.log(`Published consumer: ${name}`)
    report.currentStep = name
    const result = await action()
    report.steps.push(name)
    return result
  }
  try {
    const assets = await step('published release', async () => validateRelease(
      JSON.parse((await download(`https://api.github.com/repos/${repository}/releases/tags/${tag}`, true)).toString()), tag))
    const [zip, checksum] = await step('download attachments', () => Promise.all(assets.map(asset => download(asset.browser_download_url))))
    report.archiveSha256 = await step('SHA-256', () => verifyChecksum(zip, checksum.toString(), assets[0].name))
    const archive = resolve(consumer, 'release.zip')
    await writeFile(archive, zip)
    await step('safe extraction', async () => {
      const extractor = archiveTool()
      const entries = execFileSync(extractor, ['-tf', archive], { encoding: 'utf8' }).trim().split(/\r?\n/)
      validateArchiveEntries(entries)
      const types = execFileSync(extractor, ['-tvf', archive], { encoding: 'utf8' }).trim().split(/\r?\n/)
      if (types.some(line => !/^[d-]/.test(line))) throw new Error('Archive links or special files are not allowed')
      execFileSync(extractor, ['-xf', archive, '-C', consumer])
    })
    const layer = resolve(consumer, 'layers/courses')
    const manifest = JSON.parse(await readFile(resolve(layer, 'courses-kit.manifest.json'), 'utf8'))
    if (manifest.version !== version || manifest.provider.id !== 'courses-nuxt-kit'
      || manifest.source.repository !== `https://github.com/${repository}`
      || manifest.source.path !== 'courses/courses-nuxt-kit/layers/courses'
      || !/^[a-f0-9]{40}$/.test(manifest.source.commitSha)) throw new Error('Unexpected published manifest')
    report.integrityFiles = await step('layer integrity', () => checkIntegrity(layer, version))
    report.sourceCommit = manifest.source.commitSha
    const source = `https://raw.githubusercontent.com/${repository}/${manifest.source.commitSha}/courses/courses-nuxt-kit`
    const [recipeBytes, lock] = await step('immutable dependency recipe', () => Promise.all([
      download(`${source}/package.json`), download(`${source}/pnpm-lock.yaml`)
    ]))
    const recipe = JSON.parse(recipeBytes.toString())
    for (const group of ['dependencies', 'devDependencies']) {
      if (manifest.requirements[group].some(name => !recipe[group]?.[name])) throw new Error(`Missing dependency recipe: ${group}`)
    }
    if (!/^pnpm@\d+\.\d+\.\d+$/.test(recipe.packageManager)) throw new Error('Unexpected package manager')
    report.dependencyRecipe = `${source}/package.json`
    report.lockSha256 = sha256(lock)
    await mkdir(resolve(consumer, 'app'))
    await writeFile(resolve(consumer, 'package.json'), JSON.stringify({ name: 'published-courses-consumer', private: true,
      type: 'module', dependencies: recipe.dependencies, devDependencies: recipe.devDependencies, packageManager: recipe.packageManager }, null, 2))
    await writeFile(resolve(consumer, 'pnpm-lock.yaml'), lock)
    await writeFile(resolve(consumer, 'nuxt.config.ts'), `export default defineNuxtConfig({ extends: ['./layers/courses'], modules: ['@nuxt/ui'], ui: { colorMode: false } })\n`)
    await writeFile(resolve(consumer, 'app/app.vue'), `<template><main><Button>Выбрать курс</Button><EntityLogo name="Школа" /><CourseCard title="Frontend-разработчик" /><Carousel loop><CourseCard v-for="item in 8" :key="item" :title="'Курс ' + item" /></Carousel><AdSlot /><HeaderDropdown :model-value="true" current="courses" /><SiteFooter /></main></template>\n`)
    await step('frozen dependency install', () => pnpm(consumer, ['install', '--frozen-lockfile', '--ignore-scripts']))
    await step('production build', () => pnpm(consumer, ['exec', 'nuxt', 'build']))
    report.smoke = await step('SSR and asset smoke', () => smoke(consumer))
    report.passed = true
    console.log(`Published Courses ${version}: clean consumer install, build and SSR smoke passed.`)
  } catch (error) {
    report.error = error.message
    throw error
  } finally {
    report.finishedAt = new Date().toISOString()
    await writeFile(resolve(reportRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
    // Delete only the exact temporary directory created by this invocation.
    const child = relative(resolve(tmpdir()), consumer)
    if (!child.startsWith('courses-published-consumer-') || child.includes(sep) || child.includes('..')) {
      throw new Error('Refusing unsafe temporary directory cleanup')
    }
    await rm(consumer, { recursive: true, force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
