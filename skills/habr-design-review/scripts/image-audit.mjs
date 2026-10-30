// Inventory image contents separately from their container geometry; visual verdicts are supplied by the reviewer.
import fs from 'node:fs';
import path from 'node:path';
const [run, action = 'init'] = process.argv.slice(2);
if (!run || !['init', 'verify'].includes(action)) throw new Error('usage: image-audit.mjs <run> [init|verify]');
const file = path.join(run, 'image-audit.json');
const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema: 'design-review-images/1', images: [] };
if (action === 'init') {
  const groups = new Map();
  for (const name of fs.readdirSync(path.join(run, 'page')).filter(n => /^page-.*\.json$/.test(n))) {
    const data = JSON.parse(fs.readFileSync(path.join(run, 'page', name), 'utf8'));
    for (const e of data.elements || []) {
      if (e.tag !== 'img') continue;
      const id = JSON.stringify([e.src, e.sel, e.box?.width, e.box?.height, e.image?.objectFit, e.image?.objectPosition]);
      const item = groups.get(id) || { id, src: e.src, selector: e.sel, displaySize: [e.box?.width, e.box?.height], image: e.image || null, shots: [], ...(prev.images.find(p => p.id === id) || { status: 'pending', reference: null, evidence: [], note: '' }) };
      item.shots.push(name.slice(5, -5)); groups.set(id, item);
    }
  }
  prev.images = [...groups.values()];
  fs.writeFileSync(file, JSON.stringify(prev, null, 2));
}
const unresolved = prev.images.filter(i => i.status === 'not-applicable' ? !i.note : i.status !== 'checked' || !i.reference || !i.evidence?.length);
console.log(JSON.stringify({ images: prev.images.length, unresolved: unresolved.map(i => ({ src: i.src, selector: i.selector, shots: i.shots, status: i.status })) }, null, 2));
if (action === 'verify' && unresolved.length) process.exitCode = 1;
