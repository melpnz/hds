import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const requiredItemKeys = ['id', 'title', 'kind', 'category', 'maturity', 'knowledge', 'purpose', 'implementation', 'states', 'examples', 'evidence', 'unknowns'];
const errors = [];
const viewerWidths = [320, 480, 768, 1024];
const index = read('machine/index.json');
const styleProfile = read(index.files.styleProfile);
const catalog = read(index.files.catalog);
const ids = new Set(catalog.map(item => item.id));
const tokens = read(index.files.tokens);
for (const [role, values] of Object.entries(styleProfile.colors?.roles || {})) {
  if (values.light !== tokens.themes['light-v2']?.[role] || values.dark !== tokens.themes['dark-v2']?.[role]) {
    errors.push(`style-profile: stale color role ${role}`);
  }
}
if (styleProfile.layout?.container?.desktop !== '1096px with 24px padding' || styleProfile.shape?.radii?.control !== '4px') {
  errors.push('style-profile: layout or control geometry is stale');
}
const expectedMigrationMetrics = {
  files: 362,
  componentSpecs: 23,
  showcaseSections: 34,
  pageSections: 8,
  singleIcons: 109,
  libraryIcons: 137,
  illustrations: 20
};

function filesBelow(path) {
  return readdirSync(resolve(root, path), { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()).length;
}

function pathExists(path, owner) {
  if (!existsSync(resolve(root, path))) errors.push(`${owner}: missing ${path}`);
}

function evidenceRefExists(ref, owner) {
  if (typeof ref !== 'string' || !ref.trim()) return errors.push(`${owner}: empty evidence ref`);
  if (/^https?:\/\//.test(ref)) return;
  const clean = ref.split('#')[0];
  const target = clean.startsWith('archive:')
    ? resolve(root, '..', 'archive', clean.slice('archive:'.length))
    : clean.startsWith('local:')
      ? resolve(root, clean.slice('local:'.length))
      : resolve(root, clean);
  if (!existsSync(target)) errors.push(`${owner}: missing evidence ${ref}`);
}

for (const path of Object.values(index.files)) pathExists(path, 'index');

for (const entry of catalog) {
  pathExists(entry.file, entry.id);
  if (!existsSync(resolve(root, entry.file))) continue;
  const item = read(entry.file);
  for (const key of requiredItemKeys) if (!(key in item)) errors.push(`${entry.id}: missing key ${key}`);
  if (item.id !== entry.id) errors.push(`${entry.id}: catalog/spec id mismatch`);
  if (!['complete', 'partial', 'missing'].includes(item.maturity?.spec)) errors.push(`${entry.id}: invalid spec maturity`);
  if (!['available', 'partial', 'missing'].includes(item.maturity?.markup)) errors.push(`${entry.id}: invalid markup maturity`);
  if (!['high', 'medium', 'low'].includes(item.knowledge?.confidence)) errors.push(`${entry.id}: invalid confidence`);
  if (entry.markdown) pathExists(entry.markdown, entry.id);
  if (item.markdown) pathExists(item.markdown, entry.id);
  for (const path of item.implementation.styles || []) pathExists(path, entry.id);
  for (const path of item.implementation.scripts || []) pathExists(path, entry.id);
  for (const path of item.rules || []) pathExists(path, entry.id);
  for (const evidence of item.evidence || []) if (evidence?.ref) evidenceRefExists(evidence.ref, entry.id);
  for (const example of item.examples || []) {
    pathExists(example.file, `${entry.id}/${example.id}`);
    if (entry.kind === 'pattern' && existsSync(resolve(root, example.file))) {
      const source = readFileSync(resolve(root, example.file), 'utf8');
      if (!source.includes('<habr-site-header') || !source.includes('<habr-site-footer')) {
        errors.push(`${entry.id}/${example.id}: page example must reference the shared header and footer`);
      }
      if (source.includes('<div class="tm-header"') || source.includes('<footer class="tm-footer"')) {
        errors.push(`${entry.id}/${example.id}: page example duplicates shared shell markup`);
      }
      if (!source.includes('<main class="tm-page') || !source.includes('class="tm-page-width')) {
        errors.push(`${entry.id}/${example.id}: page example must use the canonical page container`);
      }
      if (/style="[^"]*(?:max-width:(?:620|820|900)px|width:(?:180|220|240|260)px)/.test(source)) {
        errors.push(`${entry.id}/${example.id}: legacy showcase width overrides remain in page geometry`);
      }
      if (/class="[^"]*(?:page-example__(?:panel|surface|hero)|tm-articles-list__item|tm-hub-card|tm-block)[^"]*"[^>]*style="[^"]*(?:border-radius|border\s*:)/.test(source)) {
        errors.push(`${entry.id}/${example.id}: page composition blocks must not have an outer border or radius`);
      }
      if (!item.implementation.scripts?.includes('examples/site-shell.js')
        || JSON.stringify(item.shellDependencies) !== JSON.stringify(['header', 'footer'])) {
        errors.push(`${entry.id}: shared shell contract is missing`);
      }
    }
    if (!['intrinsic', 'viewport'].includes(example.preview?.mode)) errors.push(`${entry.id}/${example.id}: invalid preview mode`);
    if (example.preview?.mode === 'intrinsic' && (example.preview.widths || example.preview.height)) {
      errors.push(`${entry.id}/${example.id}: intrinsic preview must not prescribe viewport dimensions`);
    }
    if (example.preview?.mode === 'viewport') {
      if (JSON.stringify(example.preview.widths) !== JSON.stringify(viewerWidths)) errors.push(`${entry.id}/${example.id}: viewport widths must be 320/480/768/1024`);
      if (!Number.isInteger(example.preview.height) || example.preview.height < 1) errors.push(`${entry.id}/${example.id}: viewport preview needs a positive height`);
    }
  }
  for (const note of item.previewNotes || []) {
    if (!['guidance', 'assumption', 'coverage-warning'].includes(note.type) || !note.text) errors.push(`${entry.id}: invalid preview note`);
  }
  if (item.implementation.markup === null) {
    if (!item.implementation.missingReason) errors.push(`${entry.id}: null markup without missingReason`);
    if (!item.implementation.fallback) errors.push(`${entry.id}: null markup without fallback`);
  }
  for (const dependency of item.components || []) {
    if (!ids.has(dependency)) errors.push(`${entry.id}: unknown component ${dependency}`);
  }
  if (entry.kind === 'pattern' && item.sourceStatus === 'confirmed') {
    for (const key of ['areas', 'modules']) {
      if (!Array.isArray(item[key]) || item[key].length === 0) errors.push(`${entry.id}: confirmed pattern needs non-empty ${key}`);
    }
    if (!Array.isArray(item.sequence) || item.sequence.length === 0) errors.push(`${entry.id}: confirmed pattern needs a structured sequence`);
    if (item.sequence?.length && JSON.stringify(item.sequence.map(step => step.id)) !== JSON.stringify(item.areas)) {
      errors.push(`${entry.id}: sequence ids must match areas in order`);
    }
    for (const step of item.sequence || []) {
      for (const dependency of step.components || []) {
        if (!ids.has(dependency.id)) errors.push(`${entry.id}/${step.id}: unknown component ${dependency.id}`);
      }
    }
  }
  if (entry.id === 'shell') {
    const expectedLayoutContract = {
      pageBackground: 'var(--background-gray)',
      surfaceBackground: 'var(--background-primary)',
      container: {
        mobile: { maxWidth: 'none', paddingInline: '0' },
        tablet: { maxWidth: '48rem', paddingInline: '1rem' },
        desktop: { maxWidth: '68.5rem', paddingInline: '1.5rem' }
      },
      columns: {
        through1023: 'stacked',
        from1024: 'main + 1rem gap + 18.75rem sidebar',
        sidebarPosition: 'relative'
      },
      order: ['header', 'page', 'main', 'sidebar', 'footer']
    };
    if (JSON.stringify(item.layoutContract) !== JSON.stringify(expectedLayoutContract)) {
      errors.push('shell: layout contract is missing or stale');
    }
  }
  if (entry.id === 'calendar') {
    const examples = item.examples || [];
    const sources = examples
      .filter(example => existsSync(resolve(root, example.file)))
      .map(example => readFileSync(resolve(root, example.file), 'utf8'));
    const calendarCells = sources.reduce((count, source) => count + (source.match(/tm-calendar-cell/g) || []).length, 0);
    if (!sources.some(source => source.includes('class="tm-calendar')) || calendarCells < 28) {
      errors.push('calendar: preview must render a calendar panel and a complete date grid');
    }
  }
  if (entry.id === 'feed') {
    const examples = item.examples || [];
    const source = examples.length && existsSync(resolve(root, examples[0].file))
      ? readFileSync(resolve(root, examples[0].file), 'utf8')
      : '';
    const cards = source.match(/class="tm-articles-list__item"/g) || [];
    const snippets = source.match(/class="article-snippet"/g) || [];
    const footers = source.match(/class="tm-articles-list__item-footer"/g) || [];
    const iconRows = source.match(/class="tm-data-icons"/g) || [];
    const iconItems = source.match(/tm-data-icons__item/g) || [];
    if (cards.length !== 2 || snippets.length !== cards.length || footers.length !== cards.length
      || iconRows.length !== cards.length || iconItems.length < cards.length) {
      errors.push('feed: listing must use the canonical ArticleCard anatomy for every card');
    }
  }
  const pageContracts = {
    'article-detail': ['company-profile', 'article-detail__title', 'article-sidebar'],
    'article-comments': ['comments-page__tree', 'comment-thread_level-1', 'comments-page__header'],
    search: ['search-page__form', 'search-page__hint', 'search-sidebar-skeleton'],
    editor: ['editor-page__canvas', 'editor-page__cover', 'editor-page__toolbar'],
    'admin-form': ['page-example__heading-panel', 'page-example__radio', 'tm-input-text-decorated__input'],
    'admin-list': ['page-example__management-row', 'page-example__status'],
    'overlay-flows': ['overlay-page__shade', 'overlay-modal__choices', 'overlay-modal__choice'],
    'settings-forms': ['settings-page__grid', 'settings-page__avatar', 'tm-textarea-reconstructed'],
    'service-error': ['service-error__illustration', 'service-error__code', 'service-error__message']
  };
  const pageComponentContracts = {
    'article-detail': ['tm-user-info', 'tm-icon-button', 'tm-button-follow', 'tm-articles-list__item'],
    'article-comments': ['article-snippet', 'tm-notice_info', 'checkbox', 'tm-textarea-reconstructed', 'tm-icon-button'],
    search: ['tm-input-text-decorated__input', 'tm-icon-button_near-field', 'tabs-scroll-area', 'tm-notice_info'],
    'overlay-flows': ['modal-window', 'dialog-title', 'tm-radio__option', 'tm-textarea-reconstructed', 'dialog-footer'],
    'settings-forms': ['tabs-scroll-area', 'tm-input-text-decorated__input', 'tm-textarea-reconstructed', 'tm-notice_info'],
    editor: ['tm-notice_info', 'tm-chip', 'tm-icon-button', 'tm-user-info', 'btn'],
    'admin-form': ['tm-title_h2', 'tm-radio__option', 'tm-input-text-decorated__input', 'btn'],
    'admin-list': ['tm-chip']
  };
  if (pageContracts[entry.id]) {
    const sources = (item.examples || [])
      .filter(example => existsSync(resolve(root, example.file)))
      .map(example => readFileSync(resolve(root, example.file), 'utf8'));
    const combined = sources.join('\n');
    for (const marker of pageContracts[entry.id]) {
      if (!combined.includes(marker)) errors.push(`${entry.id}: page example is missing ${marker}`);
    }
    for (const marker of pageComponentContracts[entry.id] || []) {
      if (!combined.includes(marker)) errors.push(`${entry.id}: page example does not reuse ${marker}`);
    }
    if (entry.id === 'service-error' && sources.length !== 3) {
      errors.push('service-error: 403, 404 and 500 examples are required');
    }
  }
  if (entry.id === 'button') {
    const sizes = item.visual?.sizes;
    if (!sizes || sizes.small?.height !== '32px' || sizes.middle?.height !== '36px' || sizes.large?.height !== '40px') {
      errors.push('button: structured visual size contract is missing or stale');
    }
  }
  if (['foundation', 'component'].includes(entry.kind) && !item.visual) errors.push(`${entry.id}: visual contract is missing`);
}

const countedExamples = catalog.reduce((sum, entry) => sum + (existsSync(resolve(root, entry.file)) ? read(entry.file).examples.length : 0), 0);
if (index.metrics.catalogItems !== catalog.length) errors.push('index: catalogItems metric is stale');
if (index.metrics.examples !== countedExamples) errors.push('index: examples metric is stale');
for (const [kind, metric] of [['foundation', 'foundations'], ['component', 'components'], ['pattern', 'patterns'], ['document', 'documents']]) {
  if (index.metrics[metric] !== catalog.filter(entry => entry.kind === kind).length) errors.push(`index: ${metric} metric is stale`);
}
for (const [key, value] of Object.entries(expectedMigrationMetrics)) {
  if (index.migration?.inventory?.[key] !== value) errors.push(`migration: ${key} baseline is missing or stale`);
}
if (filesBelow('components') !== expectedMigrationMetrics.componentSpecs + 1) errors.push('migration: component documentation count differs');
if (filesBelow('ui/assets/icons/single') !== expectedMigrationMetrics.singleIcons) errors.push('migration: production icon count differs');
if (filesBelow('ui/assets/icons/library') !== expectedMigrationMetrics.libraryIcons) errors.push('migration: editor icon count differs');
if (filesBelow('ui/assets/illustrations') !== expectedMigrationMetrics.illustrations) errors.push('migration: illustration count differs');
const assets = read('machine/assets.json');
if (assets.total !== filesBelow('ui/assets')) errors.push('assets: inventory count is stale');
const mapping = read('machine/migration-map.json');
if (mapping.catalogTargets.length !== catalog.length) errors.push('migration: mapping does not cover the catalog');
if (mapping.showcaseComponents.length !== expectedMigrationMetrics.showcaseSections) errors.push('migration: old component showcase sections are not fully mapped');
if (mapping.showcasePages.length !== expectedMigrationMetrics.pageSections) errors.push('migration: old page showcase sections are not fully mapped');
if (mapping.componentDocuments.length !== expectedMigrationMetrics.componentSpecs || mapping.componentDocuments.some(entry => entry.status !== 'migrated')) errors.push('migration: old component specs are not fully referenced');
if (mapping.ruleDocuments.length !== 28) errors.push('migration: RULES sections and Decision Guides are not fully split');
if (catalog.filter(entry => entry.kind === 'pattern' && entry.markdown).length !== 14) errors.push('migration: pattern taxonomy is not fully split');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${catalog.length} items, ${countedExamples} examples, all references resolve`);
