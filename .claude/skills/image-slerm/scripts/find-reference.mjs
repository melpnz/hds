#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const argv = process.argv.slice(2);
const query = argv.filter((item) => !item.startsWith('--')).join(' ').toLocaleLowerCase();
const limitArg = argv.indexOf('--limit');
const limit = limitArg >= 0 ? Math.max(1, Number(argv[limitArg + 1]) || 5) : 5;

if (!query || argv.includes('--help')) {
  console.log('Usage: node scripts/find-reference.mjs <topic emotion props> [--limit 5]');
  process.exit(query ? 0 : 2);
}

const tokens = query.split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 1);
const lines = fs.readFileSync(path.join(root, 'references', 'catalog.tsv'), 'utf8').trim().split(/\r?\n/).slice(1);
const rows = lines.map((line) => {
  const [id, tags, content, constraints] = line.split('\t');
  const haystack = `${tags} ${content} ${constraints}`.toLocaleLowerCase();
  const words = haystack.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2);
  const score = tokens.reduce((sum, token) => sum
    + (words.some((word) => word.includes(token) || token.includes(word)) ? 1 : 0), 0);
  return { id, score, content, constraints, path: path.join(root, 'assets', 'originals', `${id}.png`) };
}).filter((row) => fs.existsSync(row.path));

const ranked = rows.filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const fallback = rows.find((row) => row.id === '32');
const result = (ranked.length ? ranked : [fallback]).filter(Boolean).slice(0, limit);

for (const row of result) {
  console.log(`${row.id}\tscore=${row.score}\t${row.content}\t${row.constraints}\t${row.path}`);
}
