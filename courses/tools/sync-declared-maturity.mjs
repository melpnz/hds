import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
if (!['--write', '--check'].includes(mode)) {
  console.error('Usage: node tools/sync-declared-maturity.mjs <--write|--check>');
  process.exit(1);
}

const directories = ['foundations', 'components', 'patterns'];
const changed = [];
const statusByFile = new Map();

for (const directory of directories) {
  const absoluteDirectory = path.join(root, 'machine', directory);
  for (const name of fs.readdirSync(absoluteDirectory).filter(value => value.endsWith('.json'))) {
    const absoluteFile = path.join(absoluteDirectory, name);
    const relativeFile = path.relative(root, absoluteFile).replaceAll('\\', '/');
    const source = fs.readFileSync(absoluteFile, 'utf8');
    const item = JSON.parse(source);
    const hasUnknowns = (item.unknowns || []).some(value => typeof value === 'string' && value.trim());
    const hasUncaptured = (item.stateCoverage?.uncaptured || []).length > 0;
    if (item.maturity?.spec === 'complete' && (hasUnknowns || hasUncaptured)) item.maturity.spec = 'partial';
    statusByFile.set(relativeFile, item.maturity?.spec);
    const next = `${JSON.stringify(item, null, 2)}\n`;
    if (next !== source) {
      changed.push(relativeFile);
      if (mode === '--write') fs.writeFileSync(absoluteFile, next, 'utf8');
    }
  }
}

const catalogPath = path.join(root, 'machine', 'catalog.json');
const catalogSource = fs.readFileSync(catalogPath, 'utf8');
const catalog = JSON.parse(catalogSource);
for (const entry of catalog) {
  const status = statusByFile.get(entry.file);
  if (!status || !Array.isArray(entry.tags)) continue;
  entry.tags = entry.tags.filter(tag => !['complete', 'partial', 'missing'].includes(tag));
  entry.tags.splice(4, 0, status);
}
const nextCatalog = `${JSON.stringify(catalog, null, 2)}\n`;
if (nextCatalog !== catalogSource) {
  changed.push('machine/catalog.json');
  if (mode === '--write') fs.writeFileSync(catalogPath, nextCatalog, 'utf8');
}

if (mode === '--check' && changed.length) {
  console.error(`Declared maturity is stale: ${changed.join(', ')}`);
  process.exit(1);
}
console.log(changed.length ? `${mode === '--write' ? 'Updated' : 'Found'} ${changed.length} maturity files.` : 'Declared maturity is aligned.');
