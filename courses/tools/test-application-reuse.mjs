import assert from 'node:assert/strict'
import { analyzeSource } from './audit-application-reuse.mjs'
const good = analyzeSource('<template><Textarea/><text-input/><Button/></template>')
assert.deepEqual(good.used, ['Button', 'TextInput', 'Textarea'])
assert.deepEqual(good.review, [])
const duplicate = analyzeSource('<template><div v-if="true"><textarea/><select/><input type="checkbox"/><button>OK</button></div><div v-else><textarea/></div></template>')
assert.equal(duplicate.review.length, 5)
assert.deepEqual(duplicate.review[0].candidates, ['Textarea'])
assert.ok(duplicate.review.every(row => row.disposition === 'needs-review-not-proven-violation'))
assert.equal(analyzeSource('<script setup>const text="<textarea/>"</script><template><!-- <textarea/> --><input type="hidden"/></template>').review.length, 0)
assert.equal(analyzeSource('<template><component :is="name"/></template>').review[0].disposition, 'resolve-dynamic-component-manually')
assert.equal(analyzeSource('<script setup>const x = 1</script>').limitations.length, 1)
assert.throws(() => analyzeSource('<template><div></template>'))
console.log('Reuse audit: public components, native duplicates, branches, comments, hidden fields, dynamic components and parse errors verified.')
