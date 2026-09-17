import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const dimensions = read('machine/dimension-tokens.json');
const tokens = read('machine/tokens.json');

const dimension = (category, id) => {
  const token = dimensions.tokens?.[category]?.[String(id)];
  if (!token) throw new Error(`Missing Courses dimension token ${category}/${id}`);
  return { token: token.cssVariable, value: token.$value };
};
const color = id => ({ token: tokens.color?.[id]?.$extensions?.guide?.cssVar || id, value: tokens.color?.[id]?.$value });

const foundation = {
  fontFamily: 'Inter, sans-serif',
  text: color('text-main'),
  muted: color('ui-black-500'),
  surface: color('white-background'),
  border: color('ui-black-200'),
  action: color('ui-blue-500'),
  focus: color('ui-black-400')
};

const common = (family, item) => ({
  generatedBy: 'tools/build-visual-contracts.mjs',
  specificity: item.kind === 'pattern' ? 'item-composition' : 'family-baseline',
  family,
  typography: { family: foundation.fontFamily, body: dimension('font-size', 16), small: dimension('font-size', 14) },
  colors: { text: foundation.text, muted: foundation.muted, surface: foundation.surface, border: foundation.border, action: foundation.action, focus: foundation.focus },
  states: item.states?.ui || [],
  sources: ['machine/dimension-tokens.json', 'machine/tokens.json', ...(item.implementation?.styles || []), ...(item.examples || []).map(example => example.file)]
});

function componentContract(item) {
  if (item.category === 'actions') return {
    ...common('action-control', item),
    geometry: { height: dimension('size', 40), radius: dimension('radius', 12), paddingInline: dimension('space', 16), gap: dimension('space', 8), icon: dimension('size', 24), border: dimension('border-width', 1) }
  };
  if (item.category === 'forms') return {
    ...common('form-control', item),
    geometry: {
      sizes: { m: dimension('size', 40), l: dimension('size', 48), xl: dimension('size', 56) },
      radius: dimension('radius', 12), paddingInline: { m: dimension('space', 16), xl: dimension('space', 24) },
      gap: dimension('space', 8), icon: dimension('size', 24), border: dimension('border-width', 1)
    },
    layout: { width: 'context-dependent', dropdownRow: dimension('size', 40) }
  };
  if (item.category === 'navigation') return {
    ...common('navigation-control', item),
    geometry: { minHeight: dimension('size', 40), radius: dimension('radius', 12), gap: dimension('space', 8), paddingInline: dimension('space', 16), icon: dimension('size', 24) },
    responsive: { overflow: 'wrap-or-horizontal-scroll-by-component', mobileTarget: dimension('size', 40) }
  };
  if (item.category === 'overlays') return {
    ...common('floating-surface', item),
    geometry: { radius: dimension('radius', 12), padding: dimension('space', 16), gap: dimension('space', 8), border: dimension('border-width', 1) },
    layer: { position: 'anchored', shadow: 'component-defined' }
  };
  if (item.category === 'collections') return {
    ...common('inline-collection', item),
    geometry: { gap: dimension('space', 4), overlap: dimension('space', 8), itemSize: dimension('size', 40) }
  };
  if (item.category === 'feedback') return {
    ...common('feedback-indicator', item),
    geometry: { size: dimension('size', 24), stroke: dimension('border-width', 2) },
    motion: { behavior: 'reduced-motion-aware' }
  };
  return {
    ...common('data-display', item),
    geometry: { radius: dimension('radius', 12), gap: dimension('space', 8), icon: dimension('size', 24), border: dimension('border-width', 1) },
    layout: { width: 'content-or-context-dependent' }
  };
}

function moduleContract(item) {
  if (item.category === 'entities') return {
    ...common('entity-card-or-header', item),
    geometry: { radius: dimension('radius', 24), padding: dimension('space', 24), gap: dimension('space', 16), border: dimension('border-width', 1) },
    layout: { width: 'container-dependent', actionWidth: 'stretch-in-card-context' },
    responsive: { columns: { desktop: 'component-defined', mobile: 1 } }
  };
  if (item.category === 'overlays') return {
    ...common('overlay', item),
    geometry: { radius: dimension('radius', 24), padding: dimension('space', 24), gap: dimension('space', 16), closeTarget: dimension('size', 40) },
    layout: { desktop: 'dialog-or-popover', mobile: 'viewport-sheet-when-specified' },
    behavior: { bodyScroll: 'component-defined', pinnedRegions: 'component-defined' }
  };
  if (item.category === 'forms') return {
    ...common('form-composition', item),
    geometry: { controlHeight: dimension('size', 56), radius: dimension('radius', 12), gap: dimension('space', 1), sectionGap: dimension('space', 24) },
    layout: { desktop: 'single-composite-row', mobile: 'single-column' }
  };
  if (item.category === 'frame-modules') return {
    ...common('page-frame', item),
    geometry: { container: dimension('size', 1124), pageGutter: dimension('space', 24), desktopHeader: dimension('size', 64), sectionGap: dimension('space', 24) },
    responsive: { checkpoints: [320, 480, 768, 1024], mobile: 'stacked-or-collapsed-by-module' }
  };
  if (item.category === 'layout') return {
    ...common('content-layout', item),
    geometry: { container: dimension('size', 1124), pageGutter: dimension('space', 24), gridGap: dimension('space', 24), sectionGap: dimension('space', 40) },
    responsive: { columns: { desktop: [2, 3, 4], tablet: [2, 3], mobile: [1] } }
  };
  if (item.category === 'navigation') return {
    ...common('navigation-region', item),
    geometry: { minHeight: dimension('size', 40), gap: dimension('space', 8), pageGutter: dimension('space', 24) },
    responsive: { overflow: 'horizontal-scroll-without-page-overflow' }
  };
  if (item.category === 'collections') return {
    ...common('content-collection', item),
    geometry: { gridGap: dimension('space', 24), sectionGap: dimension('space', 40) },
    responsive: { columns: { desktop: 'item-dependent', mobile: 1 } }
  };
  if (item.category === 'feedback') return {
    ...common('feedback-region', item),
    geometry: { padding: dimension('space', 24), gap: dimension('space', 16), radius: dimension('radius', 24) },
    layout: { alignment: 'center' }
  };
  return {
    ...common('structured-content', item),
    geometry: { paddingBlock: dimension('space', 16), gap: dimension('space', 16), border: dimension('border-width', 1) },
    responsive: { width: 'container-dependent' }
  };
}

function patternContract(item) {
  const responsiveWidths = (item.responsive || []).map(view => view.width).filter(Number.isFinite);
  return {
    ...common('page-pattern', item),
    specificity: 'item-composition',
    frame: {
      container: dimension('size', 1124),
      pageGutter: dimension('space', 24),
      exactCompositionSource: 'frame'
    },
    responsive: { checkpoints: responsiveWidths, exactBehaviorSource: 'responsive' },
    composition: { areas: item.areas || [], sequence: (item.sequence || []).map(area => area.id), orderPreserved: true },
    typography: { ...common('page-pattern', item).typography, heading: dimension('font-size', 44) }
  };
}

export function visualContractFor(item) {
  if (item.kind === 'component') return componentContract(item);
  if (item.kind === 'module') return moduleContract(item);
  if (item.kind === 'pattern') return patternContract(item);
  return item.visual;
}

export function writeVisualContracts() {
  const catalog = read('machine/catalog.json');
  let written = 0;
  for (const entry of catalog) {
    if (entry.kind === 'foundation' || entry.id === 'button') continue;
    const target = path.join(root, entry.file);
    const item = JSON.parse(fs.readFileSync(target, 'utf8'));
    item.visual = visualContractFor(item);
    fs.writeFileSync(target, `${JSON.stringify(item, null, 2)}\n`, 'utf8');
    written += 1;
  }
  console.log(`Built ${written} Courses visual contracts.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeVisualContracts();
