import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const readText = path => readFileSync(resolve(root, path), 'utf8');
const readJson = path => JSON.parse(readText(path));

const entryFiles = [
  'README.md', 'AGENTS.md', 'VERSIONING.md', 'MAINTENANCE.md', 'PUBLICATION.md', 'RESEARCH-MIGRATION.md', 'ROUTING-TESTS.md',
  'habr/README.md', 'habr/AGENTS.md',
  'career/README.md', 'career/AGENTS.md',
  'courses/README.md', 'courses/AGENTS.md',
  'landings/README.md', 'landings/AGENTS.md'
];

for (const file of entryFiles) {
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) {
    errors.push(`${file}: entry file is missing`);
    continue;
  }
  const source = readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1].trim().replace(/^<|>$/g, '');
    if (!href || /^(?:https?:|mailto:|#)/i.test(href)) continue;
    const target = decodeURIComponent(href.split('#')[0].split('?')[0]);
    if (target && !existsSync(resolve(dirname(absolute), target))) errors.push(`${file}: broken link ${href}`);
  }
}

const versions = {
  habr: readJson('habr/machine/index.json').product.guideVersion,
  career: readJson('career/machine/index.json').product.guideVersion,
  courses: readJson('courses/machine/index.json').product.guideVersion,
  landings: readJson('landings/machine/index.json').version.replace(/\.0$/, '')
};
const versioning = readText('VERSIONING.md');
const readme = readText('README.md');
for (const [product, version] of Object.entries(versions)) {
  if (!versioning.includes(`v${version}`)) errors.push(`VERSIONING.md: ${product} v${version} is absent`);
  if (!readme.includes(`v${version}`)) errors.push(`README.md: ${product} v${version} is absent`);
}

const packageVersions = [
  ['courses', 'courses/package.json'],
  ['landings', 'landings/package.json']
];
for (const [product, path] of packageVersions) {
  const packageVersion = readJson(path).version?.replace(/\.0$/, '');
  if (packageVersion !== versions[product]) errors.push(`${path}: ${packageVersion} differs from machine ${versions[product]}`);
}

const localReviewPath = resolve(root, '.review-quiz');
const publication = readText('PUBLICATION.md');
const gitignore = readText('.gitignore');
if (!gitignore.includes('/.review-quiz/')) errors.push('.gitignore: local review quiz is not excluded');
if (existsSync(localReviewPath) && !publication.includes('.review-quiz')) errors.push('PUBLICATION.md: local review quiz policy is absent');

if (errors.length) {
  console.error(errors.map(error => `ERROR: ${error}`).join('\n'));
  process.exit(1);
}
console.log(`OK: ${entryFiles.length} entry documents and ${Object.keys(versions).length} guide versions are consistent`);
