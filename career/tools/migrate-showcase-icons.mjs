import fs from 'node:fs';
import path from 'node:path';

const files = ['showcase/components.html', 'showcase/pages.html'];
const externalUse = /<svg\b([^>]*)>\s*<use\b([^>]*)\/?>(?:\s*<\/use>)?\s*<\/svg>/g;

function attribute(source, name) {
  return source.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

for (const file of files) {
  let migrated = 0;
  const source = fs.readFileSync(file, 'utf8');
  const output = source.replace(externalUse, (all, attrs, useAttrs) => {
    const href = attribute(useAttrs, 'href') ?? attribute(useAttrs, 'xlink:href');
    const match = href?.match(/assets\/icons\/(sprite|reactions|social-v3\.1)\.svg#([A-Za-z0-9_-]+)$/);
    if (!match) return all;

    const [, set, name] = match;
    const assetRelative = `../ui/assets/icons/single/${set}/${name}.svg`;
    const assetPath = path.resolve(path.dirname(file), assetRelative);
    if (!fs.existsSync(assetPath)) throw new Error(`${file}: missing ${assetRelative}`);
    const asset = fs.readFileSync(assetPath, 'utf8');
    const outer = asset.match(/<svg\b([^>]*)>/)?.[1] ?? '';
    const inner = asset.replace(/^\s*<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const viewBox = attribute(outer, 'viewBox');
    const fill = attribute(outer, 'fill');
    const className = `${attribute(attrs, 'class') ?? ''} icon-inline`.trim();
    let outAttrs = attrs.replace(/\bclass="[^"]*"/, `class="${className}"`).trim();
    if (!/\bclass=/.test(outAttrs)) outAttrs += ` class="${className}"`;
    outAttrs += ` data-icon-src="${assetRelative}"`;
    if (viewBox && !/\bviewBox=/.test(outAttrs)) outAttrs += ` viewBox="${viewBox}"`;
    if (fill && !/\bfill=/.test(outAttrs)) outAttrs += ` fill="${fill}"`;
    migrated += 1;
    return `<svg ${outAttrs}>${inner}</svg>`;
  });
  fs.writeFileSync(file, output);
  console.log(`${file}: inlined ${migrated} SVG icons`);
}
