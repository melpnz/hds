import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { realpath } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appRequire = createRequire(resolve(kitRoot, 'package.json'))
const nuxtRequire = createRequire(await realpath(resolve(kitRoot, 'node_modules/nuxt/package.json')))
function checkVersions(appVersion, nuxtVersion) {
  if (appVersion !== nuxtVersion) throw new Error(`Mixed Vue runtimes: application ${appVersion}, Nuxt ${nuxtVersion}; align the dependency recipe and lockfile before SSR acceptance`)
}
assert.throws(() => checkVersions('3.5.21', '3.5.43'), /Mixed Vue runtimes/)
checkVersions('3.5.43', '3.5.43')
const appVersion = appRequire('vue/package.json').version
const nuxtVersion = nuxtRequire('vue/package.json').version
checkVersions(appVersion, nuxtVersion)
console.log(`Vue runtime check passed: application and Nuxt both use ${appVersion}; mixed-runtime regression is rejected.`)
