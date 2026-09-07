import fs from 'node:fs';
import path from 'node:path';

const files = ['showcase/components.html', 'showcase/pages.html'];
const legacyIconSpan = /<span\b([^>]*\bclass="[^"]*\bicon-mask\b[^"]*"[^>]*)><\/span>/g;

function attribute(source, name) {
  return source.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function cleanStyle(style = '') {
  return style
    .replace(/--icon-(?:src|width|height):[^;]+;?/g, '')
    .replace(/;;+/g, ';')
    .trim();
}

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  let inlined = 0;
  const output = source.replace(legacyIconSpan, (all, attrs) => {
    const style = attribute(attrs, 'style') ?? '';
    const iconPath = style.match(/--icon-src:url\(['"]?([^'")]+)['"]?\)/)?.[1];
    if (!iconPath) return all;

    const assetPath = path.resolve(path.dirname(file), iconPath);
    if (!fs.existsSync(assetPath)) throw new Error(`${file}: missing ${iconPath}`);
    const asset = fs.readFileSync(assetPath, 'utf8');
    const outer = asset.match(/<svg\b([^>]*)>/)?.[1] ?? '';
    const inner = asset.replace(/^\s*<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const viewBox = attribute(outer, 'viewBox');
    const fill = attribute(outer, 'fill');
    const className = (attribute(attrs, 'class') ?? '').replace(/\bicon-mask\b/, 'icon-inline');
    const cleaned = cleanStyle(style);
    let svgAttrs = attrs
      .replace(/\bclass="[^"]*"/, `class="${className}"`)
      .replace(/\s+style="[^"]*"/, cleaned ? ` style="${cleaned}"` : '')
      .trim();
    svgAttrs += ` data-icon-src="${iconPath}"`;
    if (viewBox && !/\bviewBox=/.test(svgAttrs)) svgAttrs += ` viewBox="${viewBox}"`;
    if (fill && !/\bfill=/.test(svgAttrs)) svgAttrs += ` fill="${fill}"`;
    inlined += 1;
    return `<svg ${svgAttrs}>${inner}</svg>`;
  });
  fs.writeFileSync(file, output);
  console.log(`${file}: inlined ${inlined} SVG icons`);
}
