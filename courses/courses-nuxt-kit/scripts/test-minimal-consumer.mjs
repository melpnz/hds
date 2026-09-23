import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(resolve(kitRoot, 'package.json'), 'utf8'))
const consumerRoot = await mkdtemp(resolve(tmpdir(), 'courses-kit-consumer-'))

function run(args) {
  const executable = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm'
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'pnpm', ...args] : args
  execFileSync(executable, commandArgs, {
    cwd: consumerRoot,
    env: { ...process.env, CI: '1' },
    stdio: 'inherit'
  })
}

try {
  await mkdir(resolve(consumerRoot, 'app'), { recursive: true })
  await cp(resolve(kitRoot, 'layers', 'courses'), resolve(consumerRoot, 'layers', 'courses'), { recursive: true })
  await cp(resolve(kitRoot, 'pnpm-lock.yaml'), resolve(consumerRoot, 'pnpm-lock.yaml'))
  await writeFile(resolve(consumerRoot, 'package.json'), `${JSON.stringify({
    name: 'courses-kit-minimal-consumer',
    private: true,
    type: 'module',
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    packageManager: packageJson.packageManager
  }, null, 2)}\n`)
  await writeFile(resolve(consumerRoot, 'nuxt.config.ts'), `export default defineNuxtConfig({
  extends: ['./layers/courses'],
  modules: ['@nuxt/ui'],
  ui: { colorMode: false }
})
`)
  await writeFile(resolve(consumerRoot, 'app', 'app.vue'), `<template>
  <main>
    <Button>Выбрать курс</Button>
    <EntityLogo name="Школа" />
    <CourseCard title="Frontend-разработчик" />
  </main>
</template>
`)

  run(['install', '--offline', '--frozen-lockfile', '--ignore-scripts'])
  run(['exec', 'nuxt', 'build'])
  console.log('Minimal consumer built from a local copied Courses layer without network access.')
} finally {
  await rm(consumerRoot, { recursive: true, force: true })
}
