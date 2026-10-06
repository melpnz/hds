import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { archiveTool, releaseTag, validateRelease, verifyChecksum, validateArchiveEntries } from './test-courses-published-consumer.mjs'

assert.equal(archiveTool('win32'), 'tar')
assert.equal(archiveTool('linux'), 'bsdtar')
assert.equal(archiveTool('darwin'), 'bsdtar')

const tag = 'courses-nuxt-kit-v1.4.1'
const names = [`${tag}.zip`, `${tag}.zip.sha256`]
const release = { tag_name: tag, draft: false, prerelease: false, published_at: '2026-10-06',
  assets: names.map(name => ({ name, browser_download_url: `https://github.com/melpnz/hds/releases/download/${tag}/${name}` })) }
assert.equal(releaseTag('1.4.1'), tag)
assert.equal(releaseTag(tag), tag)
for (const value of ['../1.4.1', '1.4', 'latest', '1.4.1-beta']) assert.throws(() => releaseTag(value))
assert.equal(validateRelease(release, tag).length, 2)
for (const change of [{ draft: true }, { prerelease: true }, { published_at: null }, { tag_name: 'other' }, { assets: [] }]) {
  assert.throws(() => validateRelease({ ...release, ...change }, tag))
}
assert.throws(() => validateRelease({ ...release, assets: [...release.assets, release.assets[0]] }, tag))
assert.throws(() => validateRelease({ ...release, assets: release.assets.map(asset => ({ ...asset, browser_download_url: 'https://example.com/evil' })) }, tag))
const bytes = Buffer.from('published ZIP fixture')
const hash = createHash('sha256').update(bytes).digest('hex')
assert.equal(verifyChecksum(bytes, `${hash}  ${names[0]}\n`, names[0]), hash)
for (const checksum of [`${hash}  other.zip`, `${'0'.repeat(64)}  ${names[0]}`, `${hash}  ${names[0]}\nextra`]) {
  assert.throws(() => verifyChecksum(bytes, checksum, names[0]))
}
validateArchiveEntries(['layers/courses/', 'layers/courses/app/components/Button.vue'])
for (const entries of [[], ['other/file'], ['layers/courses/../evil'], ['layers/courses/C:/evil'],
  ['layers/courses/a\\evil'], ['layers/courses/.git/config'], ['layers/courses/node_modules/foo'], ['layers/courses/./foo']]) {
  assert.throws(() => validateArchiveEntries(entries))
}
console.log('Published consumer policy: version, release, checksum and archive safety assertions passed.')
