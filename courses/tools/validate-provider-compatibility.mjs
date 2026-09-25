import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'))
const readText = async path => readFile(resolve(root, path), 'utf8')
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compatibility = await readJson('machine/compatibility.json')
const index = await readJson('machine/index.json')
const guidePackage = await readJson(compatibility.guide.package)
const consumerWorkflow = await readJson(index.files.consumerWorkflow)

if (compatibility.schemaVersion !== 1) throw new Error('Unsupported compatibility schema version.')
if (compatibility.guide.id !== index.product.id || compatibility.guide.version !== index.product.guideVersion) {
  throw new Error('Compatibility matrix and machine/index.json describe different guide versions.')
}
if (guidePackage.version.split('.').slice(0, 2).join('.') !== compatibility.guide.version) {
  throw new Error('Guide package version and compatibility matrix describe different guide versions.')
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
const providerPackage = await readJson(provider.package)
const changelog = await readText(provider.changelog)
const mapping = await readJson(provider.componentMapping)
const tokenMapping = await readJson(provider.tokenMapping)

if (manifest.provider.id !== provider.id || mapping.provider.id !== provider.id || tokenMapping.provider.id !== provider.id) {
  throw new Error('Provider ids differ across compatibility, manifest or generated mappings.')
}
if (!provider.compatibleVersions.includes(manifest.version)) {
  throw new Error(`Provider ${provider.id}@${manifest.version} is not verified for guide ${compatibility.guide.version}.`)
}
if (providerPackage.version !== manifest.version) {
  throw new Error('Provider package and manifest versions differ.')
}
if (manifest.version !== index.activeImplementationProvider.version || mapping.provider.version !== manifest.version || tokenMapping.provider.version !== manifest.version) {
  throw new Error('Provider versions differ across index, manifest or generated mappings.')
}
if (manifest.guide.id !== compatibility.guide.id || manifest.guide.compatibleVersion !== compatibility.guide.version) {
  throw new Error('Provider manifest declares a different compatible guide version.')
}
const releaseHeading = new RegExp(`^## ${escapeRegExp(manifest.version)} — ${escapeRegExp(manifest.releasedAt)}$`, 'm')
if (!releaseHeading.test(changelog) || !changelog.includes(`Courses guide v${compatibility.guide.version}`)) {
  throw new Error('Provider changelog does not describe the verified provider/guide release pair.')
}
const expectedArchive = `courses-nuxt-kit-v${manifest.version}.zip`
if (manifest.distribution.archiveName !== expectedArchive || manifest.distribution.releaseTag !== `courses-nuxt-kit-v${manifest.version}`) {
  throw new Error('Provider release artifact names are not derived from the manifest version.')
}
if (consumerWorkflow.guide.id !== compatibility.guide.id || consumerWorkflow.guide.version !== compatibility.guide.version) {
  throw new Error('Consumer workflow describes a different guide version.')
}
if (consumerWorkflow.provider.id !== provider.id || consumerWorkflow.provider.version !== manifest.version) {
  throw new Error('Consumer workflow describes a different provider version.')
}
if (consumerWorkflow.distribution.mode !== manifest.distribution.mode
  || consumerWorkflow.distribution.archive !== manifest.distribution.archiveName
  || consumerWorkflow.distribution.copiedDirectory !== manifest.distribution.copiedDirectory
  || consumerWorkflow.distribution.checksum !== `${manifest.distribution.archiveName}.sha256`) {
  throw new Error('Consumer workflow distribution data differs from the provider manifest.')
}
if (JSON.stringify(consumerWorkflow.installation.dependencies) !== JSON.stringify(manifest.requirements.dependencies)
  || JSON.stringify(consumerWorkflow.installation.devDependencies) !== JSON.stringify(manifest.requirements.devDependencies)) {
  throw new Error('Consumer workflow dependencies differ from the provider manifest.')
}
if (consumerWorkflow.ownership.copiedLayer !== 'vendored-read-only'
  || consumerWorkflow.ownership.canonicalKitChanges !== 'maintainer-only'
  || consumerWorkflow.usage.applicationComponentsLocation !== 'outside layers/courses'
  || consumerWorkflow.updates.automatic !== false
  || consumerWorkflow.updates.checkOnlyOnExplicitRequest !== true
  || consumerWorkflow.updates.mutatesFiles !== false) {
  throw new Error('Consumer workflow weakens the ownership or explicit-update boundary.')
}

console.log(`Verified compatibility: ${compatibility.guide.id}@${compatibility.guide.version} <-> ${provider.id}@${manifest.version}.`)
