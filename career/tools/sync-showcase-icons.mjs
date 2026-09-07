/**
 * Пересобирает встроенные в витрину иконки из файлов на диске.
 *
 * tools/inline-showcase-icons.mjs переносит иконку в разметку один раз —
 * из legacy-спана в inline SVG. После этого содержимое живёт в HTML копией,
 * и правка самого файла в ui/assets/ до витрины не доходит. Этот скрипт
 * обновляет копии: для каждого <svg data-icon-src="..."> он перечитывает файл
 * и заменяет внутренность, viewBox и fill.
 *
 * Запуск: node tools/sync-showcase-icons.mjs [--check]
 * --check ничего не пишет и выходит с ненулевым кодом, если копии разошлись.
 */
import fs from 'node:fs';
import path from 'node:path';

const files = ['showcase/components.html', 'showcase/pages.html'];
const check = process.argv.includes('--check');
const inlinedIcon = /<svg\b([^>]*\bdata-icon-src="([^"]+)"[^>]*)>([\s\S]*?)<\/svg>/g;

const attribute = (source, name) => source.match(new RegExp(`\b${name}="([^"]*)"`))?.[1];

let stale = 0;
let synced = 0;
const missing = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  // Витрина хранится с CRLF, ассеты — с LF. Сравнивать и подставлять надо
  // в переводах строк самой витрины, иначе синхронной она не будет никогда.
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const output = source.replace(inlinedIcon, (all, attrs, iconPath, inner) => {
    const assetPath = path.resolve(path.dirname(file), iconPath);
    if (!fs.existsSync(assetPath)) { missing.push(`${file}: ${iconPath}`); return all; }

    const asset = fs.readFileSync(assetPath, 'utf8');
    const outer = asset.match(/<svg\b([^>]*)>/)?.[1] ?? '';
    const nextInner = asset
      .replace(/^\s*<svg\b[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/\r\n|\n/g, eol);
    const viewBox = attribute(outer, 'viewBox');
    const fill = attribute(outer, 'fill');

    let nextAttrs = attrs;
    for (const [name, value] of [['viewBox', viewBox], ['fill', fill]]) {
      const present = new RegExp(`\s${name}="[^"]*"`);
      if (value) nextAttrs = present.test(nextAttrs) ? nextAttrs.replace(present, ` ${name}="${value}"`) : `${nextAttrs} ${name}="${value}"`;
      else nextAttrs = nextAttrs.replace(present, '');
    }

    const next = `<svg ${nextAttrs.trim()}>${nextInner}</svg>`;
    if (next !== all) stale += 1;
    synced += 1;
    return next;
  });

  if (!check && output !== source) fs.writeFileSync(file, output);
}

if (missing.length) {
  console.error(`Missing icon assets referenced by showcase:\n${missing.join('\n')}`);
  process.exit(1);
}
if (check && stale) {
  console.error(`${stale} inlined icons are out of sync with ui/assets. Run: node tools/sync-showcase-icons.mjs`);
  process.exit(1);
}
console.log(check ? `Checked ${synced} inlined icons, all in sync.` : `Synced ${synced} inlined icons (${stale} updated).`);
