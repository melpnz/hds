import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const legacyPrefix = 'archive:career/v1/';
const oldRoot = resolve(root, '..', 'archive', 'career', 'v1');
const hasArchive = existsSync(oldRoot);
const readArchive = path => JSON.parse(readFileSync(resolve(oldRoot, path), 'utf8'));
const requiredItemKeys = ['id', 'title', 'kind', 'category', 'maturity', 'knowledge', 'purpose', 'implementation', 'examples', 'evidence', 'unknowns'];
const errors = [];
const index = read('machine/index.json');
const catalogIndex = read(index.files.catalog);
const catalogLeafFiles = catalogIndex.sections.flatMap(section =>
  section.file ? [section.file] : (section.groups || []).map(group => group.file)
);
const catalog = catalogLeafFiles.flatMap(path => read(path));
const ids = new Set(catalog.map(item => item.id));
const oldTokens = hasArchive ? readArchive('machine/tokens.json') : null;
const oldComponents = hasArchive ? readArchive('machine/components.json') : [];
const oldIndex = hasArchive ? readArchive('machine/index.json') : null;
const iconInventory = read('machine/foundations/icons-inventory.json');
function walkSvg(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walkSvg(resolve(directory, entry.name), relative) : (entry.name.endsWith('.svg') ? [relative] : []);
  });
}
function walkAll(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walkAll(resolve(directory, entry.name), relative) : [relative];
  });
}
if (ids.size !== catalog.length) errors.push('catalog: duplicate ids');

function pathExists(path, owner) {
  if (!existsSync(resolve(root, path))) errors.push(`${owner}: missing ${path}`);
}

for (const path of Object.values(index.files)) pathExists(path, 'index');
for (const path of catalogLeafFiles) pathExists(path, 'catalog');

for (const entry of catalog) {
  pathExists(entry.file, entry.id);
  if (!existsSync(resolve(root, entry.file))) continue;
  const item = read(entry.file);
  for (const key of requiredItemKeys) if (!(key in item)) errors.push(`${entry.id}: missing key ${key}`);
  if (!item.states && !item.stateGroups) errors.push(`${entry.id}: missing states/stateGroups`);
  if (item.id !== entry.id) errors.push(`${entry.id}: catalog/spec id mismatch`);
  for (const path of item.implementation.styles || []) pathExists(path, entry.id);
  for (const path of item.implementation.scripts || []) pathExists(path, entry.id);
  for (const path of item.ruleFiles || item.rules || []) {
    if (path.includes('/')) pathExists(path, entry.id);
  }
  for (const example of item.examples || []) {
    pathExists(example.file, `${entry.id}/${example.id}`);
    if (/^showcase\/(components|pages)\.html$/.test(example.file)) {
      errors.push(`${entry.id}/${example.id}: monolithic showcase is forbidden as a preview`);
    }
    if (!['intrinsic', 'viewport'].includes(example.preview?.mode)) {
      errors.push(`${entry.id}/${example.id}: incomplete preview contract`);
    } else if (example.preview.mode === 'viewport' && (!example.preview.widths?.length || !example.preview.height)) {
      errors.push(`${entry.id}/${example.id}: viewport preview requires widths and height`);
    } else if (example.preview.mode === 'intrinsic' && (example.preview.widths || example.preview.height)) {
      errors.push(`${entry.id}/${example.id}: intrinsic preview must not prescribe viewport dimensions`);
    }
    if (example.id === 'legacy-visual-reference' || /старой витрины/i.test(example.title || '')) {
      errors.push(`${entry.id}/${example.id}: legacy visual-reference tabs are forbidden`);
    }
  }
  for (const group of item.groups || []) pathExists(group.file, entry.id);
  if (item.implementation.markup === null) {
    if (!item.implementation.missingReason) errors.push(`${entry.id}: null markup without missingReason`);
    if (!item.implementation.fallback) errors.push(`${entry.id}: null markup without fallback`);
  }
  for (const dependency of item.components || []) {
    if (!ids.has(dependency)) errors.push(`${entry.id}: unknown component ${dependency}`);
  }
}

const countedExamples = catalog.reduce((sum, entry) => sum + (existsSync(resolve(root, entry.file)) ? read(entry.file).examples.length : 0), 0);
const countKind = kind => catalog.filter(entry => entry.kind === kind).length;
const colorSpec = read('machine/foundations/colors.json');
const migratedColors = Object.assign({}, ...colorSpec.groups.map(group => read(group.file).tokens));
const typography = read('machine/foundations/typography.json');
const button = read('machine/components/button.json');
const oldButton = oldComponents.find(item => item.id === 'button');
if (index.metrics.catalogItems !== catalog.length) errors.push('index: catalogItems metric is stale');
if (index.metrics.examples !== countedExamples) errors.push('index: examples metric is stale');
for (const kind of ['foundation', 'primitive', 'component', 'adapter', 'module', 'pattern', 'decision-guide', 'rule', 'content', 'guide']) {
  if (index.metrics[`${kind}s`] !== countKind(kind)) errors.push(`index: ${kind}s metric is stale`);
}
if (index.metrics.colorTokens !== Object.keys(migratedColors).length) errors.push('index: colorTokens metric is stale');
if (index.metrics.typeStyles !== typography.typeScale.length) errors.push('index: typeStyles metric is stale');
if (button.implementation.markup !== 'markup.html') errors.push('button: canonical markup file is missing');
if (hasArchive) {
  const oldColorKeys = Object.keys(oldTokens.color);
  if (
    Object.keys(migratedColors).length !== oldColorKeys.length ||
    oldColorKeys.some(key => JSON.stringify(migratedColors[key]) !== JSON.stringify(oldTokens.color[key]))
  ) errors.push('colors: migrated values differ from archived machine tokens');
  if (button.markup.html !== oldButton.markup.html) errors.push('button: canonical markup differs from archived machine data');
  if (JSON.stringify(button.legacySource) !== JSON.stringify(oldButton)) errors.push('button: source object was not preserved');
}
const iconFiles = iconInventory.assets.filter(item => item.path.endsWith('.svg'));
const actualIconPaths = walkSvg(resolve(root, 'ui/assets/icons')).map(path => `ui/assets/icons/${path}`);
if (iconInventory.totals.files !== iconFiles.length) errors.push('icons: inventory file metric is stale');
if (iconFiles.some(item => !existsSync(resolve(root, item.path)))) errors.push('icons: inventory references a missing SVG');
if (new Set(iconFiles.map(item => item.path)).size !== iconFiles.length) errors.push('icons: duplicate asset paths in inventory');
if (actualIconPaths.length !== iconFiles.length || actualIconPaths.some(path => !iconFiles.some(item => item.path === path))) errors.push('icons: inventory does not cover every SVG asset');
if (iconInventory.totals.spriteSheets !== 5 || iconInventory.totals.spriteSymbols !== 146) errors.push('icons: sprite coverage differs from source checkpoint');
if (read('machine/foundations/icons.json').inventoryFile !== 'machine/foundations/icons-inventory.json') errors.push('icons: foundation is not linked to inventory');

const migratedById = new Map(catalog.map(entry => [entry.id, read(entry.file)]));
const searchIndex = read('viewer/search-index.json');
if (searchIndex.length !== catalog.length || catalog.some(entry => !searchIndex.some(document => document.id === entry.id && document.text))) errors.push('viewer search index does not cover the full catalog');

let sourceSummary = 'archive checks skipped';
if (hasArchive) {
const oldRules = readArchive('machine/rules.json');
const oldPatterns = readArchive('machine/patterns.json');
const oldContent = readArchive('machine/content.json');
const oldFiles = walkAll(oldRoot);
const oldMarkdownPaths = oldFiles.filter(path => path.endsWith('.md'));
const markdownItems = catalog.map(entry => migratedById.get(entry.id)).filter(item => item?.markdown);
const mappedMarkdownPaths = markdownItems.map(item => item.sourcePath?.replace(legacyPrefix, '')).filter(Boolean);
for (const sourcePath of oldMarkdownPaths) {
  const matches = sourcePath === 'ROADMAP.md'
    ? markdownItems.filter(item => item.sourcePath === 'ROADMAP.md')
    : markdownItems.filter(item => item.sourcePath === `${legacyPrefix}${sourcePath}`);
  if (matches.length !== 1) errors.push(`markdown ${sourcePath}: expected one catalog item, found ${matches.length}`);
  else if (sourcePath === 'ROADMAP.md') {
    if (matches[0].markdown !== readFileSync(resolve(root, 'ROADMAP.md'), 'utf8')) errors.push('roadmap: current content differs');
    if (matches[0].legacyMarkdown !== readFileSync(resolve(oldRoot, sourcePath), 'utf8')) errors.push('roadmap: archived content was not preserved');
  } else if (matches[0].markdown !== readFileSync(resolve(oldRoot, sourcePath), 'utf8')) errors.push(`markdown ${sourcePath}: content differs`);
}
for (const sourcePath of mappedMarkdownPaths) if (!oldMarkdownPaths.includes(sourcePath)) errors.push(`markdown ${sourcePath}: source file is missing`);

const oldJsonPaths = oldFiles.filter(path => path.endsWith('.json'));
const sourceDataItems = catalog.map(entry => migratedById.get(entry.id)).filter(item => item?.sourceDataFile);
for (const sourcePath of oldJsonPaths) {
  const item = sourceDataItems.find(candidate => candidate.sourcePath === `${legacyPrefix}${sourcePath}`);
  if (!item) errors.push(`json ${sourcePath}: source-data item is missing`);
  else if (readFileSync(resolve(root, item.sourceDataFile), 'utf8') !== readFileSync(resolve(oldRoot, sourcePath), 'utf8')) errors.push(`json ${sourcePath}: copied content differs`);
}

for (const path of walkAll(resolve(oldRoot, 'ui'))) {
  const oldFile = resolve(oldRoot, 'ui', path);
  const nextFile = resolve(root, 'ui', path);
  if (!existsSync(nextFile)) errors.push(`ui/${path}: missing from new package`);
  else if (!readFileSync(oldFile).equals(readFileSync(nextFile))) errors.push(`ui/${path}: differs from archived source`);
}
const evidenceImages = oldFiles.filter(path => path.startsWith('evidence/') && /\.(png|jpe?g|svg|webp|gif)$/i.test(path));
for (const path of evidenceImages) {
  if (!existsSync(resolve(root, path))) errors.push(`${path}: evidence image is missing from new package`);
  else if (!readFileSync(resolve(oldRoot, path)).equals(readFileSync(resolve(root, path)))) errors.push(`${path}: evidence image differs`);
}

const migrationAudit = read('machine/migration-audit.json');
const componentExampleMap = read('machine/migration/component-examples.json');
if (migrationAudit.markdown.source !== oldMarkdownPaths.length || migrationAudit.markdown.mapped !== markdownItems.length) errors.push('migration audit: markdown metrics are stale');
if (migrationAudit.json.source !== oldJsonPaths.length || sourceDataItems.length !== oldJsonPaths.length) errors.push('migration audit: JSON metrics are stale');
const oldComponentShowcase = readFileSync(resolve(oldRoot, 'showcase/components.html'), 'utf8');
const componentShowcaseSections = [...oldComponentShowcase.matchAll(/<section\b[^>]*\bid=["'](s-[^"']+)["']/gi)].map(match => match[1]);
for (const anchor of componentShowcaseSections) {
  const item = migratedById.get(`showcase-${anchor.replace(/^s-/, '')}`);
  if (!item?.examples?.some(example => readFileSync(resolve(root, example.file), 'utf8').includes(`id="${anchor}"`))) errors.push(`showcase/components.html#${anchor}: sliced section is missing`);
}
for (const anchor of ['about', 'rules', 'gaps']) {
  const item = migratedById.get(`showcase-pages-${anchor}`);
  if (!item?.examples?.some(example => readFileSync(resolve(root, example.file), 'utf8').includes(`id="${anchor}"`))) errors.push(`showcase/pages.html#${anchor}: supplemental section is missing`);
}
for (const [sourcePath, copiedPath] of [
  ['showcase/components.css', 'examples/components-reference/reference.css'],
  ['showcase/components.js', 'examples/components-reference/reference.js'],
  ['showcase/core-interactions.js', 'examples/components-reference/interactions.js'],
  ['showcase/pages.css', 'examples/patterns/patterns.css'],
  ['showcase/pages.js', 'examples/patterns/patterns.js']
]) if (!readFileSync(resolve(oldRoot, sourcePath)).equals(readFileSync(resolve(root, copiedPath)))) errors.push(`${sourcePath}: shared showcase asset differs`);
for (const source of oldComponents) {
  const migrated = migratedById.get(source.id);
  if (!migrated || (source.id !== 'button' && JSON.stringify(migrated.legacySource) !== JSON.stringify(source))) {
    errors.push(`component ${source.id}: source fields were not preserved`);
  }
  if (source.anchor) {
    const [page, anchor] = source.anchor.split('#');
    const html = readFileSync(resolve(oldRoot, page), 'utf8');
    if (anchor && !html.includes(`id="${anchor}"`)) errors.push(`component ${source.id}: anchor #${anchor} is missing`);
    const mappings = componentExampleMap.mappings.filter(item => item.component === source.id && item.source === `${legacyPrefix}${source.anchor}`);
    if (mappings.length !== 1) errors.push(`component ${source.id}: expected one example-migration decision, found ${mappings.length}`);
  }
}
if (componentExampleMap.sourceComponents !== oldComponents.length || componentExampleMap.mappings.length !== oldComponents.length) {
  errors.push('component example migration does not cover the complete source registry');
}
const isolatedMappings = componentExampleMap.mappings.filter(item => item.disposition === 'isolated-exact-dom');
const deduplicatedMappings = componentExampleMap.mappings.filter(item => item.disposition.startsWith('deduplicated'));
const nonvisualMappings = componentExampleMap.mappings.filter(item => item.disposition === 'nonvisual-behavior-no-preview');
if (isolatedMappings.length !== 19 || deduplicatedMappings.length !== 52 || nonvisualMappings.length !== 1) {
  errors.push(`component example migration: expected 52 deduplicated, 19 isolated and 1 nonvisual; got ${deduplicatedMappings.length}/${isolatedMappings.length}/${nonvisualMappings.length}`);
}
if (new Set(isolatedMappings.map(item => item.target)).size !== isolatedMappings.length) errors.push('isolated component examples share target files');
for (const mapping of isolatedMappings) {
  const item = migratedById.get(mapping.component);
  const example = item?.examples?.find(candidate => candidate.file === mapping.target && candidate.provenance?.extraction === 'exact-dom-subtree');
  if (!example) errors.push(`component ${mapping.component}: isolated example is not attached to its canonical item`);
  else pathExists(mapping.target, mapping.component);
}
for (const mapping of deduplicatedMappings) {
  if (!migratedById.get(mapping.component)?.examples?.length) errors.push(`component ${mapping.component}: deduplicated source has no canonical example`);
}
for (const mapping of nonvisualMappings) {
  if (!mapping.reason || migratedById.get(mapping.component)?.examples?.length) errors.push(`component ${mapping.component}: nonvisual decision is incomplete`);
}
for (const source of oldRules) {
  const migrated = migratedById.get(source.id);
  if (!migrated || Object.keys(source).some(key => JSON.stringify(migrated[key]) !== JSON.stringify(source[key]))) {
    errors.push(`rule ${source.id}: source fields were not preserved`);
  }
}
for (const source of oldPatterns) {
  const migrated = migratedById.get(source.id);
  if (!migrated || Object.keys(source).some(key => JSON.stringify(migrated[key]) !== JSON.stringify(source[key]))) {
    errors.push(`pattern ${source.id}: source fields were not preserved`);
  }
  const [page, anchor] = source.example.showcase.split('#');
  const html = readFileSync(resolve(oldRoot, page), 'utf8');
  if (anchor && !html.includes(`id="${anchor}"`)) errors.push(`pattern ${source.id}: anchor #${anchor} is missing`);
  const example = migrated.examples?.find(candidate => candidate.covers?.includes(source.id));
  if (!example || !readFileSync(resolve(root, example.file), 'utf8').includes(`id="${anchor}"`)) errors.push(`pattern ${source.id}: sliced page reference is missing`);
}
if (JSON.stringify(migratedById.get('product-copy')?.content) !== JSON.stringify(oldContent)) errors.push('content: source object was not preserved');
for (const [name, source] of Object.entries(oldTokens)) {
  if (name === 'color') continue;
  if (JSON.stringify(read(`machine/tokens/${name}.json`).tokens) !== JSON.stringify(source)) errors.push(`tokens ${name}: source values differ`);
}
for (const entry of catalog.filter(entry => entry.kind === 'guide')) {
  const item = migratedById.get(entry.id);
  if (!item.markdown) continue;
  if (item.sourcePath === 'ROADMAP.md') continue;
  const sourcePath = item.sourcePath.replace(legacyPrefix, '');
  if (item.markdown !== readFileSync(resolve(oldRoot, sourcePath), 'utf8')) errors.push(`${entry.id}: guide markdown differs`);
}
if (oldIndex.coverage.componentsTotal !== oldComponents.length) errors.push('source checkpoint: component total changed');
if (oldIndex.coverage.patterns !== oldPatterns.length) errors.push('source checkpoint: pattern total changed');
if (oldIndex.coverage.rules !== oldRules.filter(item => item.kind === 'rule').length) errors.push('source checkpoint: rule total changed');
if (oldIndex.coverage.decisionGuides !== oldRules.filter(item => item.kind === 'decision-guide').length) errors.push('source checkpoint: Decision Guide total changed');
if (index.metrics.sourceMarkdownDocuments !== oldMarkdownPaths.length) errors.push('index: sourceMarkdownDocuments metric is stale');
if (index.metrics.sourceJsonDocuments !== oldJsonPaths.length) errors.push('index: sourceJsonDocuments metric is stale');
if (index.metrics.evidenceImageAssets !== evidenceImages.length) errors.push('index: evidenceImageAssets metric is stale');
sourceSummary = `${oldMarkdownPaths.length} markdown docs, ${oldJsonPaths.length} JSON sources, ${evidenceImages.length} evidence images, ${oldRules.length} rules/decisions and ${oldPatterns.length} patterns preserved`;
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const uiEntities = ['primitive', 'component', 'adapter', 'module'].reduce((sum, kind) => sum + countKind(kind), 0);
console.log(`OK: ${catalog.length} items; ${uiEntities} component specs, 121 variables; ${sourceSummary}`);
