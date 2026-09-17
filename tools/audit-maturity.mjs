import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const products = new Set(['habr', 'career', 'courses', 'landings']);
const product = process.argv[2];
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');
if (!products.has(product) || (!write && !check)) {
  console.error('Usage: node tools/audit-maturity.mjs <habr|career|courses|landings> <--write|--check>');
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productRoot = path.join(repoRoot, product);
const read = relative => JSON.parse(fs.readFileSync(path.join(productRoot, relative), 'utf8'));

function catalogEntries() {
  const catalog = read('machine/catalog.json');
  if (Array.isArray(catalog)) return catalog;
  if (Array.isArray(catalog.items)) {
    const entries = catalog.items.flatMap(item => [
      { ...item, file: `machine/${item.spec}` },
      ...(item.members || []).map(id => ({ id, file: `machine/specs/${id}.json` }))
    ]);
    return [...new Map(entries.map(entry => [entry.file, entry])).values()];
  }
  const references = (catalog.sections || []).flatMap(section => [section.file, ...(section.groups || []).map(group => group.file)]).filter(Boolean);
  return references.flatMap(reference => read(reference));
}

const normalizeSpec = value => ['complete', 'stable'].includes(value) ? 'complete' : value === 'missing' ? 'missing' : 'partial';
const normalizeMarkup = value => value === 'available' ? 'available' : value === 'missing' ? 'missing' : value ? 'partial' : null;

function diagnose(entry) {
  const item = read(entry.file);
  const declaredSpec = typeof item.maturity === 'object' ? item.maturity.spec : item.maturity;
  const declaredMarkup = typeof item.maturity === 'object' ? item.maturity.markup : null;
  const unknowns = (item.unknowns || []).filter(value => typeof value === 'string' && value.trim());
  const uncapturedStates = (item.stateCoverage?.uncaptured || []).filter(Boolean);
  const reasons = [];
  if (unknowns.length) reasons.push({ type: 'unknowns', count: unknowns.length });
  if (uncapturedStates.length) reasons.push({ type: 'uncaptured-states', count: uncapturedStates.length });

  const normalizedDeclaredSpec = normalizeSpec(declaredSpec);
  const computedSpec = normalizedDeclaredSpec === 'missing'
    ? 'missing'
    : reasons.length || normalizedDeclaredSpec === 'partial' ? 'partial' : 'complete';
  const implementationMarkup = item.implementation?.markup;
  const computedMarkup = normalizeMarkup(declaredMarkup)
    || (implementationMarkup === null || implementationMarkup === 'missing' ? 'missing' : implementationMarkup ? 'available' : 'partial');
  const mismatch = normalizedDeclaredSpec === 'complete' && computedSpec !== 'complete';

  return {
    id: item.id || entry.id,
    file: entry.file,
    declared: { spec: declaredSpec ?? null, markup: declaredMarkup ?? null },
    computed: { spec: computedSpec, markup: computedMarkup },
    gapCount: unknowns.length + uncapturedStates.length,
    reasons,
    mismatch
  };
}

const items = catalogEntries().map(diagnose).sort((left, right) => left.file.localeCompare(right.file));
const countBy = (field, value) => items.filter(item => item[field].spec === value).length;
const report = {
  schemaVersion: 1,
  product,
  mode: 'diagnostic-only',
  policy: {
    mutatesDeclaredStatus: false,
    blocksValidationOnMismatch: false,
    rule: 'complete/stable with non-empty unknowns or stateCoverage.uncaptured is computed as partial'
  },
  summary: {
    items: items.length,
    declaredComplete: countBy('declared', 'complete') + countBy('declared', 'stable'),
    computedComplete: countBy('computed', 'complete'),
    computedPartial: countBy('computed', 'partial'),
    computedMissing: countBy('computed', 'missing'),
    mismatches: items.filter(item => item.mismatch).length,
    totalGaps: items.reduce((sum, item) => sum + item.gapCount, 0)
  },
  items
};

const json = `${JSON.stringify(report, null, 2)}\n`;
const mismatchRows = items.filter(item => item.mismatch)
  .map(item => `| \`${item.id}\` | \`${item.declared.spec}\` | \`${item.computed.spec}\` | ${item.gapCount} | \`${item.file}\` |`)
  .join('\n');
const markdown = `# Maturity diagnostics · ${product}\n\n` +
  `Режим: диагностический. Исходные статусы не изменяются, расхождения не блокируют валидацию.\n\n` +
  `- записей: ${report.summary.items}\n- computed complete: ${report.summary.computedComplete}\n- computed partial: ${report.summary.computedPartial}\n- computed missing: ${report.summary.computedMissing}\n- расхождений declared/computed: ${report.summary.mismatches}\n- найденных пробелов: ${report.summary.totalGaps}\n\n` +
  `## Объявлено complete/stable, вычислено partial/missing\n\n` +
  (mismatchRows ? `| id | declared | computed | gaps | file |\n|---|---|---|---:|---|\n${mismatchRows}\n` : 'Расхождений нет.\n');

const reportDir = path.join(productRoot, 'machine', 'reports');
const jsonPath = path.join(reportDir, 'maturity-diagnostics.json');
const markdownPath = path.join(reportDir, 'maturity-diagnostics.md');
if (write) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(jsonPath, json, 'utf8');
  fs.writeFileSync(markdownPath, markdown, 'utf8');
}
if (check) {
  const failures = [];
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== json) failures.push('maturity-diagnostics.json is stale');
  if (!fs.existsSync(markdownPath) || fs.readFileSync(markdownPath, 'utf8') !== markdown) failures.push('maturity-diagnostics.md is stale');
  if (failures.length) {
    failures.forEach(failure => console.error(`ERROR: ${failure}`));
    process.exitCode = 1;
  }
}
console.log(`${product}: maturity ${report.summary.computedComplete} complete, ${report.summary.computedPartial} partial, ${report.summary.computedMissing} missing; ${report.summary.mismatches} declared/computed warnings`);
