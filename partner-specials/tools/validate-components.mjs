import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const read = (path) => readFile(resolve(root, path), 'utf8');
const exists = async (path) => { try { await access(resolve(root, path)); } catch { errors.push(`Missing file: ${path}`); } };
const manifest = JSON.parse(await read('components/manifest.json'));
const showcase = await read('showcase/components.html');
const cssEntry = await read('ui/partner-specials.css');
const cssFiles = [...cssEntry.matchAll(/@import\s+['"](.+?)['"]/g)].map(m => `ui/${m[1]}`);
const css = (await Promise.all(cssFiles.map(read))).join('\n');
const required = ['id', 'canonicalName', 'storybookNames', 'legacyAliases', 'category', 'kind', 'specPath', 'cssRoots', 'showcaseAnchor', 'figmaEvidence', 'status', 'requiredStates'];
const seen = new Set();
for (const item of manifest.components) {
  for (const key of required) if (!(key in item)) errors.push(`${item.id}: missing ${key}`);
  if (seen.has(item.id)) errors.push(`Duplicate id: ${item.id}`);
  seen.add(item.id);
  await exists(item.specPath);
  for (const path of item.figmaEvidence) await exists(path);
  for (const selector of item.cssRoots) if (!css.includes(selector)) errors.push(`${item.id}: absent CSS root ${selector}`);
  if (!showcase.includes(`id="${item.showcaseAnchor}"`)) errors.push(`${item.id}: missing showcase anchor`);
  for (const state of item.requiredStates) if (!showcase.includes(`data-state="${state}"`)) errors.push(`${item.id}: missing showcase state ${state}`);
  if (item.status === 'complete' && item.uncovered?.length) errors.push(`${item.id}: complete with uncovered scope`);
}
const definitions = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
for (const [, name] of css.matchAll(/var\((--[\w-]+)/g)) if (!definitions.has(name)) errors.push(`Undefined token: ${name}`);
if (/https?:\/\//.test(css.replace(/\/\*[\s\S]*?\*\//g, ''))) errors.push('External dependency in CSS');
if (/showcase-/.test(css)) errors.push('Showcase CSS leaks into ui/');
for (const path of cssFiles) if (relative(root, resolve(root, path)).startsWith('..')) errors.push(`CSS outside package: ${path}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${manifest.components.length} component; registry, CSS, local dependencies and state examples agree.`);
