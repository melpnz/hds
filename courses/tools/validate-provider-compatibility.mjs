import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'))

const compatibility = await readJson('machine/compatibility.json')
const index = await readJson('machine/index.json')

if (compatibility.schemaVersion !== 1) throw new Error('Unsupported compatibility schema version.')
if (compatibility.guide.id !== index.product.id || compatibility.guide.version !== index.product.guideVersion) {
  throw new Error('Compatibility matrix and machine/index.json describe different guide versions.')
}
if (compatibility.activeProvider !== index.activeImplementationProvider.id) {
  throw new Error('Compatibility matrix and machine/index.json select different active providers.')
}

const provider = compatibility.providers.find(item => item.id === compatibility.activeProvider)
if (!provider) throw new Error('The active provider is absent from the compatibility matrix.')
if (!provider.verified) throw new Error('The active provider compatibility has not been verified.')
if (!/^https?:\/\/127\.0\.0\.1:\d+$/.test(provider.localCatalogBaseUrl)) {
  throw new Error('The active provider must declare an explicit local catalog base URL.')
}

const manifest = await readJson(provider.manifest)
const mapping = await readJson(provider.componentMapping)
const tokenMapping = await readJson(provider.tokenMapping)

if (manifest.provider.id !== provider.id || mapping.provider.id !== provider.id || tokenMapping.provider.id !== provider.id) {
  throw new Error('Provider ids differ across compatibility, manifest or generated mappings.')
}
if (!provider.compatibleVersions.includes(manifest.version)) {
  throw new Error(`Provider ${provider.id}@${manifest.version} is not verified for guide ${compatibility.guide.version}.`)
}
if (manifest.version !== index.activeImplementationProvider.version || mapping.provider.version !== manifest.version || tokenMapping.provider.version !== manifest.version) {
  throw new Error('Provider versions differ across index, manifest or generated mappings.')
}
if (manifest.guide.id !== compatibility.guide.id || manifest.guide.compatibleVersion !== compatibility.guide.version) {
  throw new Error('Provider manifest declares a different compatible guide version.')
}

console.log(`Verified compatibility: ${compatibility.guide.id}@${compatibility.guide.version} <-> ${provider.id}@${manifest.version}.`)
