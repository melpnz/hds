#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const value = (name, fallback = null) => {
  const index = argv.indexOf(`--${name}`);
  return index < 0 ? fallback : argv[index + 1];
};

if (argv.includes('--help')) {
  console.log('Usage: node validate-step.mjs --product <dir> --id <id[,id]> [--kind component|page|principle|machine] [--pipeline <dir>] [--json-out <file>] [--md-out <file>] [--dry-run]');
  process.exit(0);
}

const product = path.resolve(value('product', ''));
const ids = String(value('id', '')).split(',').map((id) => id.trim()).filter(Boolean);
const dryRun = argv.includes('--dry-run');
const kind = value('kind', 'component');
if (!value('product') || ids.length === 0) {
  console.error('Missing --product <dir> or --id <id[,id]>.');
  process.exit(2);
}

const checks = [];
const add = (id, gate, ok, detail) => checks.push({ id, gate, ok, detail });
const exists = (relative) => fs.existsSync(path.join(product, relative));
const manifestPath = path.join(product, 'components', 'manifest.json');
let manifest = null;

if (kind === 'component') {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    for (const id of ids) add(id, 'manifest', false, `Cannot read components/manifest.json: ${error.message}`);
  }
}

const records = Array.isArray(manifest) ? manifest
  : Array.isArray(manifest?.components) ? manifest.components
    : Array.isArray(manifest?.items) ? manifest.items : [];

const htmlFiles = exists('showcase')
  ? fs.readdirSync(path.join(product, 'showcase')).filter((name) => name.endsWith('.html'))
  : [];
const html = htmlFiles.map((name) => fs.readFileSync(path.join(product, 'showcase', name), 'utf8')).join('\n');
const cssRoot = path.join(product, 'ui');
const css = fs.existsSync(cssRoot)
  ? fs.readdirSync(cssRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => fs.readFileSync(path.join(entry.parentPath ?? entry.path, entry.name), 'utf8')).join('\n')
  : '';
const indexText = exists(path.join('components', 'INDEX.md'))
  ? fs.readFileSync(path.join(product, 'components', 'INDEX.md'), 'utf8') : '';

const pipelineOverride = value('pipeline');
for (const id of ids) {
  if (kind !== 'component') {
    const pipeline = pipelineOverride ? path.resolve(pipelineOverride) : path.join(product, '.pipeline', id);
    const reviews = fs.existsSync(pipeline)
      ? fs.readdirSync(pipeline).filter((name) => /^review-\d+\.md$/.test(name))
        .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
      : [];
    const latest = reviews.at(-1);
    const reviewText = latest ? fs.readFileSync(path.join(pipeline, latest), 'utf8') : '';
    const rejected = /ВЕРДИКТ\s*:\s*вернуть на доработку/i.test(reviewText)
      || /вердикт[^\n]*(не принято|return|reject)/i.test(reviewText);
    add(id, 'review', Boolean(latest && !rejected), latest ? `${latest}: ${rejected ? 'rejected' : 'accepted'}` : 'review missing');

    if (kind === 'page') {
      const human = [`pages/${id}.md`, `blocks/${id}.md`].find(exists);
      add(id, 'human-doc', Boolean(human), human ?? 'page/block article missing');
      add(id, 'showcase', html.includes(`p-${id}`), `expected p-${id}`);
      const patterns = exists('machine/patterns.json') ? fs.readFileSync(path.join(product, 'machine', 'patterns.json'), 'utf8') : '';
      add(id, 'machine-doc', patterns.includes(`"id"`) && patterns.includes(id), 'machine/patterns.json entry');
    } else if (kind === 'principle') {
      const docs = ['docs/guide/composition.md', 'docs/guide/decisions.md'].filter(exists)
        .map((file) => fs.readFileSync(path.join(product, file), 'utf8')).join('\n');
      add(id, 'human-doc', docs.includes(id), 'composition/decisions entry');
      add(id, 'showcase', html.includes(`data-rule="${id}"`) || html.includes(`data-rule='${id}'`), `expected data-rule=${id}`);
      const rules = exists('machine/rules.json') ? fs.readFileSync(path.join(product, 'machine', 'rules.json'), 'utf8') : '';
      add(id, 'machine-doc', rules.includes(id), 'machine/rules.json entry');
    } else if (kind === 'machine') {
      const requiredFiles = ['index.json', 'tokens.json', 'components.json', 'rules.json', 'patterns.json', 'content.json', 'assets.json'];
      const missing = requiredFiles.filter((file) => !exists(path.join('machine', file)));
      add(id, 'machine-files', missing.length === 0, `missing: ${missing.join(', ') || 'none'}`);
      add(id, 'consumer-contract', exists('AGENTS.md'), 'AGENTS.md');
    } else {
      add(id, 'kind', false, `unknown kind=${kind}`);
    }
    continue;
  }

  const record = records.find((item) => item?.id === id || item?.canonicalName === id);
  add(id, 'manifest', Boolean(record), record ? 'record found' : 'component record not found');
  if (!record) continue;

  add(id, 'status', record.status !== 'planned', `status=${record.status ?? 'missing'}`);
  const specPath = record.specPath ? path.join('components', record.specPath) : null;
  add(id, 'spec', Boolean(specPath && exists(specPath)), specPath ?? 'specPath missing');
  add(id, 'index', indexText.includes(record.id) || indexText.includes(record.canonicalName),
    indexText ? 'id or canonicalName found' : 'components/INDEX.md missing or entry absent');

  const roots = Array.isArray(record.cssRoots) ? record.cssRoots : [];
  const missingRoots = roots.filter((root) => !css.includes(root));
  add(id, 'css-roots', roots.length > 0 && missingRoots.length === 0,
    roots.length ? `missing: ${missingRoots.join(', ') || 'none'}` : 'cssRoots empty');

  const anchor = record.showcaseAnchor;
  add(id, 'showcase', Boolean(anchor && (html.includes(`id="${anchor}"`) || html.includes(`id='${anchor}'`))),
    anchor ?? 'showcaseAnchor missing');

  const required = Array.isArray(record.requiredStates) ? record.requiredStates : [];
  const covered = new Set([...(record.capturedStates ?? []), ...(record.normativeStates ?? [])]);
  const missingStates = required.filter((state) => !covered.has(state));
  const declaredMissing = new Set(record.uncapturedStates ?? []);
  const statesOk = record.status === 'complete'
    ? missingStates.length === 0
    : record.status === 'partial'
      ? missingStates.length > 0 && missingStates.every((state) => declaredMissing.has(state))
      : true;
  add(id, 'states', statesOk,
    `status=${record.status}; missing=${missingStates.join(', ') || 'none'}; declared=${[...declaredMissing].join(', ') || 'none'}`);

  if (record.sourceScope === 'production') {
    add(id, 'production-evidence', Array.isArray(record.productionEvidence) && record.productionEvidence.length > 0,
      `${record.productionEvidence?.length ?? 0} references`);
  }
  if (Array.isArray(record.figmaEvidence) && record.figmaEvidence.length > 0) {
    const addressable = record.figmaEvidence.every((item) => item.nodeId || item.componentKey || item.url);
    add(id, 'figma-evidence', addressable, addressable ? `${record.figmaEvidence.length} addressable references` : 'reference without nodeId, componentKey or URL');
  }

  const pipeline = pipelineOverride
    ? path.resolve(pipelineOverride)
    : path.join(product, '.pipeline', record.step || id);
  const reviews = fs.existsSync(pipeline)
    ? fs.readdirSync(pipeline).filter((name) => /^review-\d+\.md$/.test(name))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    : [];
  const latest = reviews.at(-1);
  if (!latest) {
    add(id, 'review', false, `no review-N.md in ${path.relative(product, pipeline)}`);
  } else {
    const review = fs.readFileSync(path.join(pipeline, latest), 'utf8');
    const rejected = /ВЕРДИКТ\s*:\s*вернуть на доработку/i.test(review)
      || /вердикт[^\n]*(не принято|return|reject)/i.test(review);
    add(id, 'review', !rejected, `${latest}: ${rejected ? 'rejected' : 'no rejecting verdict'}`);
  }
}

const validatorName = kind === 'machine' ? 'validate-machine.mjs' : 'validate-components.mjs';
const validator = path.join(product, 'tools', validatorName);
let validatorExit = null;
let validatorLog = 'Validator not found; skipped.\n';
if (fs.existsSync(validator)) {
  const run = spawnSync(process.execPath, [validator, '--strict'], { cwd: product, encoding: 'utf8' });
  validatorExit = run.status ?? 1;
  validatorLog = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  for (const id of ids) add(id, 'validator', validatorExit === 0, `exit=${validatorExit}`);
} else {
  for (const id of ids) add(id, 'validator', false, `tools/${validatorName} not found`);
}

const pipelineBase = pipelineOverride
  ? path.resolve(pipelineOverride)
  : path.join(product, '.pipeline', ids.length === 1
    ? (records.find((item) => item?.id === ids[0])?.step || ids[0])
    : `batch-${ids.join('-')}`);
const logPath = path.join(pipelineBase, 'validate.log');
if (!dryRun) {
  fs.mkdirSync(pipelineBase, { recursive: true });
  fs.writeFileSync(logPath, validatorLog, 'utf8');
}

const failed = checks.filter((check) => !check.ok);
const result = {
  product,
  ids,
  passed: failed.length === 0,
  validatorExit,
  log: dryRun ? null : path.relative(product, logPath),
  checks,
};

const jsonPath = value('json-out');
if (jsonPath && !dryRun) {
  fs.mkdirSync(path.dirname(path.resolve(jsonPath)), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

const markdown = [
  `# Автоматические гейты: ${ids.join(', ')}`,
  '',
  `Итог: **${result.passed ? 'PASS' : 'FAIL'}**`,
  '',
  '| ID | Гейт | Результат | Детали |',
  '|---|---|---|---|',
  ...checks.map((check) => `| ${check.id} | ${check.gate} | ${check.ok ? 'PASS' : 'FAIL'} | ${String(check.detail).replaceAll('|', '\\|')} |`),
  '',
  `Полный лог валидатора: \`${result.log ?? 'dry-run: не записан'}\``,
  '',
].join('\n');
const mdPath = value('md-out');
if (mdPath && !dryRun) {
  fs.mkdirSync(path.dirname(path.resolve(mdPath)), { recursive: true });
  fs.writeFileSync(mdPath, markdown, 'utf8');
}

const failedNames = failed.map((check) => `${check.id}:${check.gate}`).join(', ') || 'none';
console.log(`${result.passed ? 'PASS' : 'FAIL'}: ${checks.length - failed.length}/${checks.length} gates; failed=${failedNames}; log=${result.log ?? 'not-written'}`);
process.exit(result.passed ? 0 : 1);
