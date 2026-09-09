#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const value = (name, fallback = null) => {
  const index = argv.indexOf(`--${name}`);
  return index < 0 ? fallback : argv[index + 1];
};

if (argv.includes('--help')) {
  console.log('Usage: node query-evidence.mjs --computed <file> [--selector <text>] [--props a,b] [--limit 20] [--out <file>]');
  process.exit(0);
}

const source = value('computed');
if (!source) {
  console.error('Missing --computed <file>.');
  process.exit(2);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(source, 'utf8'));
} catch (error) {
  console.error(`Cannot read ${source}: ${error.message}`);
  process.exit(2);
}

const entries = Array.isArray(parsed) ? parsed : parsed.computed;
if (!Array.isArray(entries)) {
  console.error('Expected an array or an object with a computed array.');
  process.exit(2);
}

const needle = String(value('selector', '')).toLocaleLowerCase();
const props = String(value('props', '')).split(',').map((item) => item.trim()).filter(Boolean);
const limit = Math.max(1, Number(value('limit', 20)) || 20);

const matches = entries.filter((entry) => {
  if (!needle) return true;
  return [entry.path, entry.tag, entry.classes]
    .filter(Boolean)
    .some((item) => String(item).toLocaleLowerCase().includes(needle));
}).slice(0, limit).map((entry) => {
  const styles = entry.styles ?? {};
  const selected = props.length
    ? Object.fromEntries(props.filter((prop) => styles[prop] !== undefined).map((prop) => [prop, styles[prop]]))
    : styles;
  return { path: entry.path, tag: entry.tag, classes: entry.classes, box: entry.box, styles: selected };
});

const result = {
  source: path.resolve(source),
  query: needle || null,
  requestedProperties: props,
  totalNodes: entries.length,
  returned: matches.length,
  truncated: entries.filter((entry) => !needle || [entry.path, entry.tag, entry.classes]
    .filter(Boolean).some((item) => String(item).toLocaleLowerCase().includes(needle))).length > matches.length,
  matches,
};

const json = `${JSON.stringify(result, null, 2)}\n`;
const out = value('out');
if (out) {
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, json, 'utf8');
  console.log(`Evidence slice: ${matches.length}/${entries.length} nodes -> ${out}`);
} else {
  process.stdout.write(json);
}
