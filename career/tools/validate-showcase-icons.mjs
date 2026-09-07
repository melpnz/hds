import fs from 'node:fs';
import path from 'node:path';

const showcaseFiles = ['showcase/components.html', 'showcase/pages.html'];
const standaloneRoot = path.resolve('ui/assets/icons/single');
const standalonePathPattern = /\.\.\/ui\/assets\/icons\/single\/([^/'"\s]+)\/([^/'"\s]+\.svg)/g;
const legacySpritePattern = /(?:xlink:)?href=["'][^"']*ui\/assets\/icons\/(?:sprite|reactions|social-v3\.1)\.svg#/;

let references = 0;
const missing = [];
const legacyReferences = [];

for (const file of showcaseFiles) {
  const source = fs.readFileSync(file, 'utf8');
  let match;

  while ((match = standalonePathPattern.exec(source))) {
    references += 1;
    const assetPath = path.join(standaloneRoot, match[1], match[2]);
    if (!fs.existsSync(assetPath)) missing.push(`${file}: ${match[1]}/${match[2]}`);
  }

  if (/<use\b/.test(source) || legacySpritePattern.test(source)) legacyReferences.push(file);
}

if (missing.length || legacyReferences.length) {
  if (missing.length) console.error(`Missing standalone icons:\n${missing.join('\n')}`);
  if (legacyReferences.length) console.error(`Legacy external sprite references remain: ${legacyReferences.join(', ')}`);
  process.exit(1);
}

console.log(`Validated ${references} standalone icon references in ${showcaseFiles.length} showcase files.`);
