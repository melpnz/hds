import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const requiredItemKeys = ['id', 'title', 'kind', 'category', 'maturity', 'knowledge', 'purpose', 'implementation', 'states', 'examples', 'evidence', 'unknowns'];
const errors = [];
const viewerWidths = [320, 480, 768, 1024];
const index = read('machine/index.json');
const catalog = read(index.files.catalog);
const ids = new Set(catalog.map(item => item.id));
const expectedMigrationMetrics = {
  files: 362,
  componentSpecs: 23,
  showcaseSections: 34,
  pageSections: 8,
  singleIcons: 109,
  libraryIcons: 137,
  illustrations: 20
};

function filesBelow(path) {
  return readdirSync(resolve(root, path), { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()).length;
}

function pathExists(path, owner) {
  if (!existsSync(resolve(root, path))) errors.push(`${owner}: missing ${path}`);
}

for (const path of Object.values(index.files)) pathExists(path, 'index');

for (const entry of catalog) {
  pathExists(entry.file, entry.id);
  if (!existsSync(resolve(root, entry.file))) continue;
  const item = read(entry.file);
  for (const key of requiredItemKeys) if (!(key in item)) errors.push(`${entry.id}: missing key ${key}`);
  if (item.id !== entry.id) errors.push(`${entry.id}: catalog/spec id mismatch`);
  if (!['complete', 'partial', 'missing'].includes(item.maturity?.spec)) errors.push(`${entry.id}: invalid spec maturity`);
  if (!['available', 'partial', 'missing'].includes(item.maturity?.markup)) errors.push(`${entry.id}: invalid markup maturity`);
  if (!['high', 'medium', 'low'].includes(item.knowledge?.confidence)) errors.push(`${entry.id}: invalid confidence`);
  if (entry.markdown) pathExists(entry.markdown, entry.id);
  if (item.markdown) pathExists(item.markdown, entry.id);
  for (const path of item.implementation.styles || []) pathExists(path, entry.id);
  for (const path of item.implementation.scripts || []) pathExists(path, entry.id);
  for (const path of item.rules || []) pathExists(path, entry.id);
  for (const example of item.examples || []) {
    pathExists(example.file, `${entry.id}/${example.id}`);
    if (!['intrinsic', 'viewport'].includes(example.preview?.mode)) errors.push(`${entry.id}/${example.id}: invalid preview mode`);
    if (example.preview?.mode === 'intrinsic' && (example.preview.widths || example.preview.height)) {
      errors.push(`${entry.id}/${example.id}: intrinsic preview must not prescribe viewport dimensions`);
    }
    if (example.preview?.mode === 'viewport') {
      if (JSON.stringify(example.preview.widths) !== JSON.stringify(viewerWidths)) errors.push(`${entry.id}/${example.id}: viewport widths must be 320/480/768/1024`);
      if (!Number.isInteger(example.preview.height) || example.preview.height < 1) errors.push(`${entry.id}/${example.id}: viewport preview needs a positive height`);
    }
  }
  for (const note of item.previewNotes || []) {
    if (!['guidance', 'assumption', 'coverage-warning'].includes(note.type) || !note.text) errors.push(`${entry.id}: invalid preview note`);
  }
  if (item.implementation.markup === null) {
    if (!item.implementation.missingReason) errors.push(`${entry.id}: null markup without missingReason`);
    if (!item.implementation.fallback) errors.push(`${entry.id}: null markup without fallback`);
  }
  for (const dependency of item.components || []) {
    if (!ids.has(dependency)) errors.push(`${entry.id}: unknown component ${dependency}`);
  }
}

const countedExamples = catalog.reduce((sum, entry) => sum + (existsSync(resolve(root, entry.file)) ? read(entry.file).examples.length : 0), 0);
if (index.metrics.catalogItems !== catalog.length) errors.push('index: catalogItems metric is stale');
if (index.metrics.examples !== countedExamples) errors.push('index: examples metric is stale');
for (const [kind, metric] of [['foundation', 'foundations'], ['component', 'components'], ['pattern', 'patterns'], ['document', 'documents']]) {
  if (index.metrics[metric] !== catalog.filter(entry => entry.kind === kind).length) errors.push(`index: ${metric} metric is stale`);
}
for (const [key, value] of Object.entries(expectedMigrationMetrics)) {
  if (index.migration?.inventory?.[key] !== value) errors.push(`migration: ${key} baseline is missing or stale`);
}
if (filesBelow('components') !== expectedMigrationMetrics.componentSpecs + 1) errors.push('migration: component documentation count differs');
if (filesBelow('ui/assets/icons/single') !== expectedMigrationMetrics.singleIcons) errors.push('migration: production icon count differs');
if (filesBelow('ui/assets/icons/library') !== expectedMigrationMetrics.libraryIcons) errors.push('migration: editor icon count differs');
if (filesBelow('ui/assets/illustrations') !== expectedMigrationMetrics.illustrations) errors.push('migration: illustration count differs');
const assets = read('machine/assets.json');
if (assets.total !== filesBelow('ui/assets')) errors.push('assets: inventory count is stale');
const mapping = read('machine/migration-map.json');
if (mapping.catalogTargets.length !== catalog.length) errors.push('migration: mapping does not cover the catalog');
if (mapping.showcaseComponents.length !== expectedMigrationMetrics.showcaseSections) errors.push('migration: old component showcase sections are not fully mapped');
if (mapping.showcasePages.length !== expectedMigrationMetrics.pageSections) errors.push('migration: old page showcase sections are not fully mapped');
if (mapping.componentDocuments.length !== expectedMigrationMetrics.componentSpecs || mapping.componentDocuments.some(entry => entry.status !== 'migrated')) errors.push('migration: old component specs are not fully referenced');
if (mapping.ruleDocuments.length !== 28) errors.push('migration: RULES sections and Decision Guides are not fully split');
if (catalog.filter(entry => entry.kind === 'pattern' && entry.markdown).length !== 14) errors.push('migration: pattern taxonomy is not fully split');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${catalog.length} items, ${countedExamples} examples, all references resolve`);
