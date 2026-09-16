import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStyleProfile } from './tools/build-style-profile.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const requiredItemKeys = ['id', 'title', 'kind', 'category', 'maturity', 'knowledge', 'purpose', 'implementation', 'states', 'examples', 'evidence', 'unknowns'];
const errors = [];
const dimensionDocument = read('machine/dimension-tokens.json');
const dimensionValues = Object.fromEntries(Object.values(dimensionDocument.tokens || {}).flatMap(group =>
  Object.values(group).map(token => [token.cssVariable, token.$value])
));
const resolveDimensions = source => source.replace(/var\((--courses-[^)]+)\)/g, (match, token) => dimensionValues[token] || match);
const viewerWidths = [320, 480, 768, 1024];
const presentationLayouts = ['fit-content', 'constrained', 'canvas', 'context'];
const index = read('machine/index.json');
const catalog = read(index.files.catalog);
const ids = new Set(catalog.map(item => item.id));
const migration = read(index.files.migrationMap);
const styleProfile = read(index.files.styleProfile);
if (JSON.stringify(styleProfile) !== JSON.stringify(buildStyleProfile())) errors.push('style-profile: generated profile is stale');
for (const entry of catalog.filter(entry => entry.kind === 'pattern')) {
  const item = read(entry.file);
  for (const reference of [item.source?.spec, item.source?.standalone, item.source?.showcase, item.sequenceSource?.page].filter(Boolean)) {
    if (!reference.startsWith('archive:')) errors.push(`${entry.id}: legacy source must use archive: prefix (${reference})`);
    else evidenceRefExists(reference, entry.id);
  }
  for (const unknown of item.unknowns || []) if (unknown.length <= 80 || !unknown.endsWith('components/collections/carousel.md')) errors.push(`${entry.id}: truncated unknown text`);
}
const walkFiles = path => readdirSync(resolve(root, path), { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => resolve(entry.parentPath, entry.name));

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

if (ids.size !== catalog.length) errors.push('catalog: duplicate ids');
const foundationIds = ['colors', 'typography', 'spacing-grid', 'radii-borders', 'iconography', 'responsive-layout'];
if (catalog.length !== 87) errors.push(`catalog: expected 78 preserved items plus 6 foundations, Textarea, RadioButton and Modal, got ${catalog.length}`);
if (JSON.stringify(catalog.filter(item => item.kind === 'foundation').map(item => item.id)) !== JSON.stringify(foundationIds)) {
  errors.push('catalog: foundation section is incomplete or out of order');
}
const sectionOrder = [...new Set(catalog.map(item => item.navSection))];
if (JSON.stringify(sectionOrder) !== JSON.stringify(['foundations', 'elements', 'blocks', 'patterns'])) errors.push(`catalog: invalid navigation hierarchy ${sectionOrder.join(', ')}`);
for (const entry of catalog) {
  const expectedSection = entry.kind === 'foundation' ? 'foundations' : entry.kind === 'component' ? 'elements' : entry.kind === 'module' ? 'blocks' : 'patterns';
  if (entry.navSection !== expectedSection) errors.push(`${entry.id}: expected ${expectedSection} navigation section`);
}
for (const demoId of ['notification', 'legacy-picker', 'listing']) {
  if (ids.has(demoId)) errors.push(`catalog: template demo survived migration (${demoId})`);
}

for (const entry of catalog) {
  pathExists(entry.file, entry.id);
  if (!existsSync(resolve(root, entry.file))) continue;
  const item = read(entry.file);
  for (const key of requiredItemKeys) if (!(key in item)) errors.push(`${entry.id}: missing key ${key}`);
  if (item.id !== entry.id) errors.push(`${entry.id}: catalog/spec id mismatch`);
  for (const path of item.implementation.styles || []) pathExists(path, entry.id);
  for (const path of item.implementation.scripts || []) pathExists(path, entry.id);
  for (const path of item.rules || []) pathExists(path, entry.id);
  for (const evidence of item.evidence || []) if (evidence?.ref) evidenceRefExists(evidence.ref, entry.id);
  for (const example of item.examples || []) {
    pathExists(example.file, `${entry.id}/${example.id}`);
    if (!['intrinsic', 'viewport'].includes(example.preview?.mode)) errors.push(`${entry.id}/${example.id}: invalid preview mode`);
    if (example.preview?.mode === 'intrinsic' && (example.preview.widths || example.preview.height)) {
      errors.push(`${entry.id}/${example.id}: intrinsic preview must not prescribe viewport dimensions`);
    }
    if (example.preview?.mode === 'intrinsic') {
      const presentation = example.presentation;
      if (!presentationLayouts.includes(presentation?.layout)) errors.push(`${entry.id}/${example.id}: intrinsic preview needs a valid presentation layout`);
      if (['constrained', 'canvas', 'context'].includes(presentation?.layout) && (!Number.isInteger(presentation.width) || presentation.width < 1)) {
        errors.push(`${entry.id}/${example.id}: ${presentation?.layout} presentation needs a positive width`);
      }
      if (presentation?.layout === 'context' && (!Number.isInteger(presentation.height) || presentation.height < 1)) {
        errors.push(`${entry.id}/${example.id}: context presentation needs a positive height`);
      }
    }
    if (example.preview?.mode === 'viewport' && example.presentation) errors.push(`${entry.id}/${example.id}: viewport preview must not have intrinsic presentation metadata`);
    if (example.preview?.mode === 'viewport') {
      if (JSON.stringify(example.preview.widths) !== JSON.stringify(viewerWidths)) errors.push(`${entry.id}/${example.id}: viewport widths must be 320/480/768/1024`);
      if (!Number.isInteger(example.preview.height) || example.preview.height < 1) errors.push(`${entry.id}/${example.id}: viewport preview needs a positive height`);
    }
    if (existsSync(resolve(root, example.file))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      for (const match of html.matchAll(/(?:src|href|xlink:href)=["']([^"']+)["']/g)) {
        const ref = match[1];
        if (/^(?:https?:|data:|#|\/)/.test(ref)) continue;
        const localPath = ref.split('#')[0].split('?')[0];
        if (localPath && !existsSync(resolve(root, dirname(example.file), localPath))) {
          errors.push(`${entry.id}/${example.id}: missing example asset ${ref}`);
        }
      }
    }
  }
  for (const note of item.previewNotes || []) {
    if (!['guidance', 'assumption', 'coverage-warning'].includes(note.type) || !note.text) errors.push(`${entry.id}: invalid preview note`);
  }
  if (item.kind === 'pattern') {
    if (item.title === item.id) errors.push(`${entry.id}: pattern title must be human-readable`);
    if ((item.areas || []).some(area => /^section-\d+$/.test(area))) errors.push(`${entry.id}: pattern areas must be semantic`);
    if ((item.sequence || []).length !== (item.areas || []).length) errors.push(`${entry.id}: sequence/areas length mismatch`);
    for (const [index, area] of (item.sequence || []).entries()) {
      if (area.id !== item.areas[index]) errors.push(`${entry.id}: sequence area ${index + 1} does not match areas`);
      if (area.stub && (area.stub.length <= 80 || !area.stub.endsWith('components/collections/carousel.md'))) errors.push(`${entry.id}: truncated or incomplete stub in ${area.id}`);
    }
  }
  if (entry.kind === 'foundation' && !item.visual) errors.push(`${entry.id}: visual contract is missing`);
  if (entry.id === 'button') {
    if (item.examples.length !== 1 || item.examples[0].id !== 'playground') errors.push('button: expected one optimized playground example');
    if (!item.states.ui.includes('loading')) errors.push('button: Figma loading state is absent');
    const matrix = item.variantMatrix;
    const computedCombinations = Object.values(matrix?.sizes || {}).reduce((sum, size) => sum + size.tones.length, 0)
      * (matrix?.states?.length || 0) * (matrix?.icon?.length || 0);
    if (computedCombinations !== 140 || matrix?.combinations !== 140) errors.push(`button: variant matrix must retain 140 combinations, got ${computedCombinations}`);
    const expectedLayoutRules = ['default', 'course-card', 'mobile-form', 'section-action', 'semantics'];
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(expectedLayoutRules)) errors.push('button: contextual width rules are incomplete');
    if (existsSync(resolve(root, item.examples[0]?.file || ''))) {
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if ([...html.matchAll(/class="[^"]*\bcrs-button-target\b[^"]*"/g)].length !== 1) errors.push('button: playground must render exactly one working Button');
      if ([...html.matchAll(/class="crs-figma-button crs-button-preset"/g)].length !== 6) errors.push('button: playground must render six tone presets');
      if (!html.includes('[data-state=default]:not(:disabled):hover')) errors.push('button: tone presets must expose real hover behavior');
      for (const control of ['button-size', 'button-tone', 'button-state', 'button-icon', 'button-stretch']) {
        if (!html.includes(`id="${control}"`)) errors.push(`button: playground misses ${control} control`);
      }
    }
  }
  if (entry.id === 'icon-button') {
    if (item.examples.length !== 1 || item.examples[0].id !== 'states') errors.push('icon-button: expected one compact states example');
    for (const state of ['default', 'hover', 'focus-visible', 'disabled', 'loading']) {
      if (!item.states.ui.includes(state)) errors.push(`icon-button: missing ${state} state`);
    }
    if (existsSync(resolve(root, item.examples[0]?.file || ''))) {
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if ([...html.matchAll(/class="crs-icon-button"/g)].length !== 5) errors.push('icon-button: expected five visible states');
      if ([...html.matchAll(/viewBox="0 0 24 24"/g)].length !== 5) errors.push('icon-button: every state must use a 24×24 SVG viewBox');
      for (const state of ['default', 'hover', 'focus', 'disabled', 'loading']) {
        if (!html.includes(`data-state="${state}"`)) errors.push(`icon-button: ${state} sample is absent`);
      }
    }
  }
  if (entry.id === 'site-header') {
    if (JSON.stringify(item.examples.map(example => example.id)) !== JSON.stringify(['figma-variants', 'production-current'])) errors.push('site-header: expected Figma playground and preserved production example');
    if (item.variantMatrix?.combinations !== 21) errors.push('site-header: Figma variant matrix must contain 21 device combinations');
    if (JSON.stringify(Object.keys(item.variantMatrix?.families || {})) !== JSON.stringify(['listing', 'courses', 'simple'])) errors.push('site-header: header families are incomplete');
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['breakpoints', 'sticky', 'mobile-overflow'])) errors.push('site-header: responsive layout rules are incomplete');
    for (const id of ['15071:230717', '15058:236426', '15065:242662', '15065:245602']) {
      if (!item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === id)) errors.push(`site-header: Figma evidence ${id} is absent`);
    }
    const playground = item.examples[0];
    if (existsSync(resolve(root, playground?.file || ''))) {
      const html = readFileSync(resolve(root, playground.file), 'utf8');
      for (const control of ['site-header-family', 'site-header-level', 'site-header-sticky']) {
        if (!html.includes(`id="${control}"`)) errors.push(`site-header: playground misses ${control}`);
      }
      for (const family of ['ListingHeader', 'CoursesHeader', 'SimplePageHeader']) {
        if (!html.includes(family)) errors.push(`site-header: playground misses ${family}`);
      }
      for (const query of ['@media(min-width:480px) and (max-width:1023px)', '@media(max-width:479px)']) {
        if (!html.includes(query)) errors.push(`site-header: responsive query ${query} is absent`);
      }
      if (!html.includes('position:sticky;top:0') || !html.includes('overflow-x:auto')) errors.push('site-header: sticky or horizontal overflow behavior is absent');
    }
  }
  if (entry.id === 'section') {
    if (item.examples.length !== 1 || item.examples[0].id !== 'anatomy') errors.push('section: expected one neutral anatomy example');
    if (existsSync(resolve(root, item.examples[0]?.file || ''))) {
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if (!html.includes('<section class="crs-section-demo flex flex-col gap-4">')) errors.push('section: semantic section wrapper is absent');
      if (!html.includes('Область содержимого')) errors.push('section: content slot is not explained');
      if (html.includes('Рейтинг лучших школ') || html.includes('grid-cols-[1fr_120px_120px_120px]')) errors.push('section: RatingTable leaked into the Section preview');
    }
  }
  if (entry.id === 'ad-slot') {
    if (item.examples.length !== 1 || item.examples[0].id !== 'carousel') errors.push('ad-slot: expected one visible carousel example');
    if (existsSync(resolve(root, item.examples[0]?.file || ''))) {
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if (!html.includes('crs-ad-slot-demo__track') || !html.includes('banner-swiper')) errors.push('ad-slot: Carousel structure is absent');
      if ([...html.matchAll(/class="crs-ad-slot-demo__card/g)].length !== 2) errors.push('ad-slot: expected two visible AdCard placeholders');
      if (!html.includes('aspect-ratio:272/280') || !html.includes('height:232px')) errors.push('ad-slot: responsive AdCard geometry is absent');
      if (html.includes('class="flex items-center justify-center overflow-hidden -mt-4 adfox-banner rounded-3xl"></div>')) errors.push('ad-slot: empty production container leaked into the live preview');
    }
  }
  if (entry.id === 'header-dropdown') {
    if (item.examples.length !== 1 || item.examples[0].id !== 'states') errors.push('header-dropdown: expected one interactive states example');
    for (const state of ['open', 'closed', 'hover', 'focus-visible']) {
      if (!item.examples[0]?.covers?.includes(state)) errors.push(`header-dropdown: ${state} is absent from example coverage`);
    }
    if (existsSync(resolve(root, item.examples[0]?.file || ''))) {
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if (!html.includes('id="header-dropdown-trigger"') || !html.includes('aria-expanded="true"')) errors.push('header-dropdown: accessible trigger is absent');
      if (!html.includes('id="header-dropdown-panel"') || !html.includes('Все сервисы Хабра')) errors.push('header-dropdown: visible services panel is absent');
      if (html.includes('class="hidden absolute')) errors.push('header-dropdown: hidden production root leaked into the live preview');
      if (!html.includes('headerDropdownPanel.hidden=open')) errors.push('header-dropdown: open/closed interaction is absent');
    }
  }
  if (entry.id === 'rubrication-bar') {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'production-context') errors.push('rubrication-bar: expected one production-context example');
    if (example?.preview?.mode !== 'viewport' || example?.preview?.height !== 40) errors.push('rubrication-bar: compact responsive preview is absent');
    for (const state of ['default', 'desktop', 'mobile', 'horizontal-scroll']) {
      if (!example?.covers?.includes(state)) errors.push(`rubrication-bar: ${state} is absent from example coverage`);
    }
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if (!html.includes('crs-rubrication-demo') || !html.includes('var(--color-main-gradient-second)')) errors.push('rubrication-bar: visible gradient context is absent');
      if ([...html.matchAll(/class="shrink-0 text-ui-white/g)].length !== 4) errors.push('rubrication-bar: expected four production links');
    }
  }
  if (entry.id === 'search-form') {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'select-xl-group') errors.push('search-form: expected one Select XL group example');
    if (example?.preview?.mode !== 'viewport' || example?.preview?.height !== 300) errors.push('search-form: responsive preview contract is absent');
    for (const state of ['default', 'desktop', 'mobile', 'select-xl', 'joined-fields', 'full-width-action']) {
      if (!example?.covers?.includes(state)) errors.push(`search-form: ${state} is absent from example coverage`);
    }
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['joined-fields', 'mobile-stack'])) errors.push('search-form: joined-field layout rules are incomplete');
    if (!item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === '15074:233173')) errors.push('search-form: Figma XL evidence is absent');
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if ([...html.matchAll(/role="combobox"/g)].length !== 3 || [...html.matchAll(/data-size="xl"/g)].length !== 3) errors.push('search-form: expected three Select XL controls');
      if (!html.includes('.crs-search-form__select+.crs-search-form__select{width:calc(100% + 1px);margin-left:-1px}')) errors.push('search-form: overlapping 1px desktop separators are absent');
      if (!html.includes('margin-top:-1px;margin-left:0') || !html.includes('.crs-search-form__submit{width:100%}')) errors.push('search-form: joined mobile stack or full-width action is absent');
    }
  }
  if (entry.id === 'modal') {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'playground') errors.push('modal: expected one interactive playground');
    if (example?.preview?.mode !== 'intrinsic' || example?.presentation?.layout !== 'constrained' || example?.presentation?.width !== 720) errors.push('modal: constrained playground presentation is absent');
    for (const state of ['default', 'open', 'closed', 'scroll', 'desktop', 'tablet', 'mobile', 'image', 'header-actions', 'pinned-header', 'pinned-footer', 'primary', 'secondary']) {
      if (!example?.covers?.includes(state)) errors.push(`modal: ${state} is absent from example coverage`);
    }
    if (item.componentFamily?.id !== 'modal' || item.componentFamily?.member !== 'Modal') errors.push('modal: component family metadata is absent');
    if (JSON.stringify(item.variantMatrix?.devices) !== JSON.stringify(['desktop', 'tablet', 'mobile']) || item.variantMatrix?.optional?.length !== 8 || item.variantMatrix?.slots !== 12) errors.push('modal: variant matrix is incomplete');
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['device', 'scroll-body', 'slots', 'dismiss'])) errors.push('modal: layout and interaction rules are incomplete');
    for (const nodeId of ['1144:25049', '1144:29417', '4726:1139', '1144:31171']) {
      if (!item.evidence?.some(source => source.type === 'figma' && (source.data?.nodeId === nodeId || source.data?.some?.(data => data.nodeId === nodeId)))) errors.push(`modal: Figma evidence ${nodeId} is absent`);
    }
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if ([...html.matchAll(/class="crs-modal-preset"/g)].length !== 3) errors.push('modal: desktop/tablet/mobile presets are incomplete');
      if ([...html.matchAll(/data-part="/g)].length !== 8) errors.push('modal: optional-part controls are incomplete');
      if ([...html.matchAll(/class="crs-modal__slot"/g)].length !== 6) errors.push('modal: scroll demonstration needs six slots');
      for (const fragment of ['role="dialog" aria-modal="true"', 'ui/assets/images/modal/example.png', 'sprite.svg#arrow-small', 'sprite.svg#more', "event.key==='Escape'", 'modalOpen.focus()']) {
        if (!html.includes(fragment)) errors.push(`modal: required markup or behavior is absent (${fragment})`);
      }
    }
    const overlays = resolveDimensions(readFileSync(resolve(root, 'ui/components/overlays.css'), 'utf8'));
    if (!overlays.includes('grid-template-rows:auto auto minmax(0,1fr) auto') || !overlays.includes('[data-image=false]{grid-template-rows:auto minmax(0,1fr) auto') || !overlays.includes('overflow-y:auto')) errors.push('modal: fixed shell or scroll body CSS is absent');
    if (!overlays.includes('border-radius:24px 24px 0 0') || !overlays.includes('max-height:700px')) errors.push('modal: mobile bottom-sheet geometry is absent');
  }
  if (entry.id === 'promo-code-modal') {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'content-variants' || example?.preview?.mode !== 'intrinsic') errors.push('promo-code-modal: expected one intrinsic content-variants example');
    if (item.componentFamily?.id !== 'modal' || item.componentFamily?.member !== 'PromoCodeModal') errors.push('promo-code-modal: Modal family metadata is absent');
    if (!item.dependencies?.includes('modal')) errors.push('promo-code-modal: dependency on Modal is absent');
    if (entry.navGroup !== 'modals' || entry.navSection !== 'blocks') errors.push('promo-code-modal: Modal navigation grouping is absent');
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if ([...html.matchAll(/class="crs-promo-code-modal"/g)].length !== 2) errors.push('promo-code-modal: expected promo-code and promotion content variants');
    }
  }
  if (entry.id === 'filter-modal') {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'responsive') errors.push('filter-modal: expected one responsive example');
    for (const state of ['open', 'closed', 'body-scroll', 'mobile', 'desktop']) {
      if (!example?.covers?.includes(state)) errors.push(`filter-modal: ${state} is absent from example coverage`);
    }
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['viewport-shell', 'body-scroll', 'mobile'])) errors.push('filter-modal: viewport and scroll rules are incomplete');
    for (const id of ['14627:233015', '14627:228239']) {
      if (!item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === id)) errors.push(`filter-modal: Figma evidence ${id} is absent`);
    }
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if ([...html.matchAll(/class="crs-filter-modal__group"/g)].length !== 10) errors.push('filter-modal: expected ten filter groups');
      for (const asset of ['recommendation-career.png', 'recommendation-certificate.png', 'recommendation-free.png', 'recommendation-mentor.png', 'filter-grade-min.svg', 'filter-grade-mid.svg', 'filter-grade-max.svg']) {
        if (!html.includes(asset)) errors.push(`filter-modal: local Figma asset ${asset} is absent`);
      }
      if (!html.includes('role="dialog" aria-modal="true"') || !html.includes('id="filter-modal-body" tabindex="0"')) errors.push('filter-modal: dialog or scroll-region semantics are absent');
      if (!html.includes('filterModal.hidden=true') || !html.includes("document.querySelector('#filter-modal-body').scrollTo")) errors.push('filter-modal: close or reset behavior is absent');
    }
    const overlays = readFileSync(resolve(root, 'ui/components/overlays.css'), 'utf8');
    if (!overlays.includes('grid-template-rows:72px minmax(0,1fr) 96px') || !overlays.includes('overflow-y:auto')) errors.push('filter-modal: fixed shell or body scrolling CSS is absent');
    if (!overlays.includes('grid-template-rows:72px minmax(0,1fr) 136px') || !overlays.includes('flex-direction:column')) errors.push('filter-modal: mobile footer layout is absent');
  }
  if (entry.id === 'sort-sheet' || entry.id === 'price-sheet') {
    const example = item.examples[0];
    const isSort = entry.id === 'sort-sheet';
    if (item.examples.length !== 1 || example?.id !== 'mobile-flow') errors.push(`${entry.id}: expected one mobile-flow example`);
    if (example?.preview?.mode !== 'intrinsic' || example?.presentation?.layout !== 'context' || example?.presentation?.width !== 320 || example?.presentation?.height !== 568) errors.push(`${entry.id}: mobile 320x568 context is absent`);
    for (const state of ['open', 'closed', ...(isSort ? ['selected'] : ['reset', 'submit'])]) {
      if (!example?.covers?.includes(state)) errors.push(`${entry.id}: ${state} is absent from example coverage`);
    }
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['mobile-only', 'bottom-anchor', 'dismiss'])) errors.push(`${entry.id}: mobile-only behavior rules are incomplete`);
    for (const nodeId of ['9094:48333', isSort ? '9356:50311' : '9356:52508']) {
      const hasNode = item.evidence?.some(source => source.data?.nodeId === nodeId || source.data?.some?.(data => data.nodeId === nodeId));
      if (!hasNode) errors.push(`${entry.id}: Figma evidence ${nodeId} is absent`);
    }
    if (!item.stateCoverage?.captured?.includes('closed') || item.stateCoverage?.uncaptured?.length) errors.push(`${entry.id}: open/closed flow is not captured`);
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if (!html.includes('width:320px;height:568px') || !html.includes('position:absolute;inset:0')) errors.push(`${entry.id}: mobile viewport or bottom anchoring is absent`);
      if (!html.includes(`id="${entry.id}-open"`) || !html.includes(`id="${entry.id}-target"`)) errors.push(`${entry.id}: trigger or sheet target is absent`);
      if (!html.includes("event.key==='Escape'") || !html.includes('event.target===')) errors.push(`${entry.id}: Escape or overlay dismissal is absent`);
      if (isSort) {
        if ([...html.matchAll(/role="option"/g)].length !== 6 || !html.includes("sortSheetTrigger.textContent=option.textContent")) errors.push('sort-sheet: selectable list behavior is incomplete');
      } else {
        if (!html.includes('role="dialog" aria-modal="true"') || !html.includes("querySelectorAll('input').forEach")) errors.push('price-sheet: dialog or reset behavior is incomplete');
      }
    }
  }
  if (entry.id === 'filter-chip' || entry.id === 'tab') {
    const isExtended = entry.id === 'tab';
    const expectedTitle = isExtended ? 'FilterChip · Menu / Switch' : 'FilterChip · Basic';
    if (entry.navGroup !== 'filter-chips' || entry.navGroupTitle !== 'Filter Chips' || entry.title !== expectedTitle) errors.push(`${entry.id}: FilterChip family grouping is incorrect`);
    if (item.componentFamily?.id !== 'filter-chip' || item.componentFamily?.legacyId !== (isExtended ? 'tab' : null)) errors.push(`${entry.id}: FilterChip family metadata is absent`);
    if (isExtended) {
      const example = item.examples[0];
      if (item.examples.length !== 1 || example?.id !== 'filter-chip-variants') errors.push('tab: expected one FilterChip Menu / Switch overview');
      for (const state of ['default', 'hover', 'focus-visible', 'selected', 'disabled', 'loading', 'open']) {
        if (!item.states.ui.includes(state) || !example?.covers?.includes(state)) errors.push(`tab: missing ${state} state coverage`);
      }
      if (!item.variants?.find(variant => variant.id === 'kind')?.use.includes('FilterChipMenu')) errors.push('tab: Menu / Switch variants are absent');
      if (existsSync(resolve(root, example?.file || ''))) {
        const html = readFileSync(resolve(root, example.file), 'utf8');
        if ([...html.matchAll(/class="crs-filter-chip-matrix__row"/g)].length !== 6) errors.push('tab: expected six FilterChip state rows');
        if ([...html.matchAll(/class="crs-filter-chip crs-filter-chip--/g)].length !== 15) errors.push('tab: expected fifteen FilterChip samples');
        for (const state of ['default', 'hover', 'focus', 'selected', 'disabled', 'loading', 'open']) {
          if (!html.includes(`data-state="${state}"`)) errors.push(`tab: ${state} sample is absent`);
        }
        if (!html.includes('filter-chip-tooltip.svg') || !html.includes('filter-chip-dot.svg')) errors.push('tab: exact local Figma assets are absent');
        if (!html.includes('aria-expanded="true"') || !html.includes('role="listbox"')) errors.push('tab: open Menu semantics are absent');
        if ([...html.matchAll(/aria-busy="true"/g)].length !== 2) errors.push('tab: loading semantics are incomplete');
      }
    }
  }
  if (entry.id === 'segmented-control' || entry.id === 'button-group') {
    const isHero = entry.id === 'segmented-control';
    const expectedTitle = isHero ? 'HeroTabs' : 'PageTabs';
    const expectedExample = isHero ? 'hero-tabs' : 'page-tabs';
    if (entry.navGroup !== 'tabs' || entry.title !== expectedTitle) errors.push(`${entry.id}: tab grouping or title is incorrect`);
    if (item.examples[0]?.id !== expectedExample) errors.push(`${entry.id}: contextual tab example is absent`);
    if (item.componentFamily?.id !== 'tabs' || item.componentFamily?.member !== expectedTitle || item.componentFamily?.legacyId !== entry.id) errors.push(`${entry.id}: Tabs family metadata is absent`);
    for (const state of ['default', 'hover', 'focus-visible', 'selected', 'disabled', 'loading']) {
      if (!item.states.ui.includes(state) || !item.examples[0]?.covers?.includes(state)) errors.push(`${entry.id}: missing ${state} state coverage`);
    }
    if (existsSync(resolve(root, item.examples[0]?.file || ''))) {
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if ([...html.matchAll(/class="crs-context-tab"/g)].length !== 9) errors.push(`${entry.id}: expected nine tab samples`);
      if ([...html.matchAll(/class="crs-tabs-sample"/g)].length !== 6) errors.push(`${entry.id}: expected six state samples`);
      if ([...html.matchAll(/aria-busy="true"/g)].length !== 1) errors.push(`${entry.id}: loading semantics are incomplete`);
      if (isHero && !html.includes('.crs-tabs-context--hero .crs-tabs-group{border-radius:12px;background:rgba(0,0,0,.12)}')) errors.push('segmented-control: shared HeroTabs group background is absent');
      if (!isHero && !html.includes('.crs-tabs-context--page .crs-tabs-group{padding:4px;border-radius:16px;background:#f1f1f1}')) errors.push('button-group: shared PageTabs group background is absent');
    }
    if (isHero && !item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === '4261:1716')) errors.push('segmented-control: HeroTabs group evidence is absent');
    if (!isHero && !item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === '4813:288')) errors.push('button-group: PageTabs group evidence is absent');
  }
  if (['select', 'multi-select', 'search-input', 'text-input', 'textarea'].includes(entry.id)) {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'field-family') errors.push(`${entry.id}: expected one field-family overview`);
    if (!item.states.ui.includes('error')) errors.push(`${entry.id}: Figma error state is absent`);
    if (!item.variants?.some(variant => variant.id === 'state')) errors.push(`${entry.id}: shared state variants are absent`);
    if (entry.id !== 'textarea' && !item.variants?.find(variant => variant.id === 'size')?.use.includes('XL / SearchForm: 56 px')) errors.push(`${entry.id}: M/XL size scale is incomplete`);
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      const expectedControls = entry.id === 'textarea' ? 10 : ['select', 'multi-select'].includes(entry.id) ? 13 : 12;
      if ([...html.matchAll(/class="crs-field(?: |")/g)].length !== expectedControls) errors.push(`${entry.id}: expected ${expectedControls} field samples`);
      for (const state of ['default', 'hover', 'focus', 'disabled', 'error']) {
        if (!html.includes(`data-state="${state}"`)) errors.push(`${entry.id}: ${state} sample is absent`);
      }
      if (entry.id !== 'textarea' && (!html.includes('data-size="m"') || !html.includes('data-size="xl"'))) errors.push(`${entry.id}: M/XL samples are absent`);
      if (entry.id === 'select' && !html.includes('role="combobox"')) errors.push('select: combobox semantics are absent');
      if (entry.id === 'multi-select' && (!html.includes('crs-field-chip') || !html.includes('sprite.svg#cross-small'))) errors.push('multi-select: selected chip example is absent');
      if (['select', 'multi-select'].includes(entry.id)) {
        if (!html.includes('class="crs-field-dropdown"') || !html.includes('role="listbox"')) errors.push(`${entry.id}: open dropdown is absent`);
        if (!html.includes('aria-expanded="true"')) errors.push(`${entry.id}: open combobox state is absent`);
        if (!example.covers?.includes('open') || item.stateCoverage?.uncaptured?.includes('open')) errors.push(`${entry.id}: open state coverage is incorrect`);
      }
      if (entry.id === 'search-input' && (!html.includes('type="search"') || !html.includes('sprite.svg#search'))) errors.push('search-input: search control is malformed');
      if (entry.id === 'text-input' && !html.includes('type="text"')) errors.push('text-input: native input is absent');
      if (entry.id === 'textarea' && !html.includes('<textarea')) errors.push('textarea: native control is absent');
      if (html.includes('courses-filter-search-top-panel-placeholder')) errors.push(`${entry.id}: SSR skeleton leaked into field overview`);
    }
  }
  if (['checkbox', 'radio-button', 'switch'].includes(entry.id)) {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'states') errors.push(`${entry.id}: expected one control states overview`);
    for (const state of ['default', 'hover', 'focus-visible', 'checked', 'disabled', 'loading']) {
      if (!item.states.ui.includes(state)) errors.push(`${entry.id}: missing ${state} state`);
    }
    if (item.stateCoverage?.uncaptured?.some(state => ['hover', 'focus-visible', 'checked', 'disabled', 'loading'].includes(state))) errors.push(`${entry.id}: Figma states remain uncaptured`);
    if (entry.id === 'checkbox' && !item.stateCoverage?.uncaptured?.includes('indeterminate')) errors.push('checkbox: unverified indeterminate gap must remain explicit');
    const expectedLayoutRules = ['checkbox', 'radio-button'].includes(entry.id) ? ['control-label', 'vertical-list', 'horizontal-list'] : ['control-label'];
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(expectedLayoutRules)) errors.push(`${entry.id}: control label/list spacing rules are incomplete`);
    if (!item.layoutRules?.find(rule => rule.id === 'control-label')?.implementation.includes('padding-top:1px')) errors.push(`${entry.id}: label top padding rule is not 1px`);
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      const expectedControls = ['checkbox', 'radio-button'].includes(entry.id) ? 16 : 10;
      if ([...html.matchAll(/class="crs-control crs-control--/g)].length !== expectedControls) errors.push(`${entry.id}: expected ${expectedControls} control samples`);
      for (const state of ['default', 'hover', 'focus', 'disabled', 'loading']) {
        if ([...html.matchAll(new RegExp(`data-state="${state}"`, 'g'))].length < 2) errors.push(`${entry.id}: ${state} off/on pair is absent`);
      }
      if ([...html.matchAll(/aria-busy="true"/g)].length !== 2) errors.push(`${entry.id}: loading semantics are incomplete`);
      if (entry.id === 'radio-button' && !html.includes('type="radio"')) errors.push('radio-button: native radio inputs are absent');
      if (entry.id === 'switch' && !html.includes('role="switch"')) errors.push('switch: switch semantics are absent');
      if (entry.id === 'checkbox' && !html.includes('ui/assets/controls/check.svg')) errors.push('checkbox: exported check asset is absent');
      if (entry.id === 'switch' && !html.includes('ui/assets/controls/dot.svg')) errors.push('switch: exported dot asset is absent');
      if (['checkbox', 'radio-button'].includes(entry.id) && (!html.includes('crs-control-list--vertical') || !html.includes('crs-control-list--horizontal'))) errors.push(`${entry.id}: control list examples are absent`);
      if (!html.includes('.crs-control__label{padding-top:1px;white-space:nowrap}')) errors.push(`${entry.id}: rendered label top padding is not 1px`);
    }
  }
  if (entry.id === 'avatar' || entry.id === 'entity-logo') {
    if (JSON.stringify(item.examples.map(example => example.id)) !== JSON.stringify(['sizes', 'production-context'])) errors.push(`${entry.id}: expected size scale and preserved production context`);
    if (!item.variants?.find(variant => variant.id === 'size')?.use.includes('24, 32, 36, 40, 48, 56, 68 и 100')) errors.push(`${entry.id}: Courses Figma size scale is incomplete`);
    const sizesExample = item.examples.find(example => example.id === 'sizes');
    if (sizesExample && existsSync(resolve(root, sizesExample.file))) {
      const html = readFileSync(resolve(root, sizesExample.file), 'utf8');
      if ([...html.matchAll(/class="crs-avatar-default /g)].length !== 8) errors.push(`${entry.id}: expected eight default avatar sizes`);
      const asset = entry.id === 'avatar' ? 'avatar-default-user.svg' : 'avatar-default-company.svg';
      if (!html.includes(`ui/assets/images/${asset}`)) errors.push(`${entry.id}: wrong default avatar asset`);
    }
  }
  if (item.implementation.markup === null) {
    if (!item.implementation.missingReason) errors.push(`${entry.id}: null markup without missingReason`);
    if (!item.implementation.fallback) errors.push(`${entry.id}: null markup without fallback`);
  }
  for (const dependency of item.components || []) {
    if (!ids.has(dependency)) errors.push(`${entry.id}: unknown component ${dependency}`);
  }
  if (item.source?.spec) evidenceRefExists(item.source.spec, `${entry.id}/source`);
}

const countedExamples = catalog.reduce((sum, entry) => sum + (existsSync(resolve(root, entry.file)) ? read(entry.file).examples.length : 0), 0);
if (index.metrics.catalogItems !== catalog.length) errors.push('index: catalogItems metric is stale');
if (index.metrics.examples !== countedExamples) errors.push('index: examples metric is stale');
for (const kind of ['foundation', 'component', 'module', 'pattern']) {
  const key = kind === 'foundation' ? 'foundations' : kind === 'component' ? 'components' : `${kind}s`;
  const count = catalog.filter(entry => entry.kind === kind).length;
  if (index.metrics[key] !== count) errors.push(`index: ${key} metric is stale`);
}

const ruleFiles = walkFiles('machine/rules').filter(path => path.endsWith('.json'));
if (index.metrics.rules !== ruleFiles.length) errors.push('index: rules metric is stale');
const ruleIds = new Set(ruleFiles.map(path => JSON.parse(readFileSync(path, 'utf8')).id));
if (ruleIds.size !== ruleFiles.length) errors.push('rules: duplicate ids');

const mappedComponents = migration.entities.components;
const mappedPatterns = migration.entities.patterns;
const mappedRules = migration.entities.rules;
if (mappedComponents.length !== index.metrics.components + index.metrics.modules) errors.push('migration: not every source component/module is mapped');
if (mappedPatterns.length !== index.metrics.patterns) errors.push('migration: not every source pattern is mapped');
if (mappedRules.length !== index.metrics.rules) errors.push('migration: not every source rule is mapped');
for (const mapping of [...mappedComponents, ...mappedPatterns, ...mappedRules]) {
  if (mapping.status !== 'migrated') errors.push(`migration: unresolved ${mapping.id}`);
  pathExists(mapping.target, `migration/${mapping.id}`);
  if (mapping.example) pathExists(mapping.example, `migration/${mapping.id}`);
}
for (const document of migration.preservedDocuments || []) {
  if (document.target.includes(' + ')) continue;
  pathExists(document.target, `migration/document/${document.source}`);
}

const generatedUiFiles = ['ui/dimension-tokens.css', 'ui/page-examples.css', 'ui/assets/images/avatar-default-user.svg', 'ui/assets/images/avatar-default-company.svg', 'ui/assets/images/filter-modal/recommendation-career.png', 'ui/assets/images/filter-modal/recommendation-certificate.png', 'ui/assets/images/filter-modal/recommendation-free.png', 'ui/assets/images/filter-modal/recommendation-mentor.png', 'ui/assets/images/modal/example.png', 'ui/assets/icons/filter-grade-min.svg', 'ui/assets/icons/filter-grade-mid.svg', 'ui/assets/icons/filter-grade-max.svg', 'ui/assets/controls/check.svg', 'ui/assets/controls/dot.svg', 'ui/assets/controls/filter-chip-tooltip.svg', 'ui/assets/controls/filter-chip-tooltip-selected.svg', 'ui/assets/controls/filter-chip-tooltip-disabled.svg', 'ui/assets/controls/filter-chip-dot.svg'];
for (const path of generatedUiFiles) pathExists(path, 'generated-ui');
for (const path of generatedUiFiles.filter(path => path.includes('avatar-default') && path.endsWith('.svg'))) {
  if (!existsSync(resolve(root, path))) continue;
  const svg = readFileSync(resolve(root, path), 'utf8').toLowerCase();
  if (!svg.includes('#f1f1f1') || !svg.includes('#d3d3d4')) errors.push(`${path}: Courses placeholder palette is incomplete`);
  if (svg.includes('#e4edf8') || svg.includes('#c7d5e5')) errors.push(`${path}: legacy Career placeholder colors remain`);
}

const typographyGuidePath = resolve(root, 'docs/guide/typography.md');
if (existsSync(typographyGuidePath)) {
  const typographyGuide = readFileSync(typographyGuidePath, 'utf8');
  if (!typographyGuide.includes('Inter — единственный интерфейсный шрифт Courses')) errors.push('typography: the global Inter rule is absent');
  if (!typographyGuide.includes('Моноширинный шрифт разрешён только')) errors.push('typography: semantic monospace exception is absent');
}
const typographySpecPath = resolve(root, 'machine/foundations/typography.json');
if (existsSync(typographySpecPath)) {
  const typography = JSON.parse(readFileSync(typographySpecPath, 'utf8'));
  if (!typography.purpose?.startsWith('Inter — единственный интерфейсный шрифт Courses')) errors.push('typography: machine-readable Inter rule is absent');
  const examplePath = typography.examples?.[0]?.file;
  if (!examplePath || !existsSync(resolve(root, examplePath))) {
    errors.push('typography: live example is absent');
  } else {
    const example = readFileSync(resolve(root, examplePath), 'utf8');
    if (!example.includes('foundation-font-rule') || !example.includes('Inter — единый шрифт Courses')) errors.push('typography: visible Inter rule is absent');
  }
}
for (const path of [...walkFiles('examples'), ...walkFiles('ui')].filter(path => /\.(?:html|css)$/i.test(path))) {
  const source = readFileSync(path, 'utf8');
  if (/(?:font-family|font)\s*:[^;{}]*(?:Arial|PT Sans)/i.test(source)) errors.push(`typography: forbidden fallback in ${path}`);
}
if (existsSync(resolve(root, 'ui/assets/icons/sprite.svg'))) {
  const sprite = readFileSync(resolve(root, 'ui/assets/icons/sprite.svg'), 'utf8');
  if (!sprite.includes('id="arrow-down-figma"') || !sprite.includes('M6.22922 9.23657')) errors.push('icon-button: exact Figma arrow asset is absent from the sprite');
}
for (const layer of migration.copiedLayers.filter(layer => ['ui', 'evidence'].includes(layer.target))) {
  const count = walkFiles(layer.target).length;
  if (count !== layer.files + (layer.target === 'ui' ? generatedUiFiles.length : 0)) {
    errors.push(`migration: ${layer.target} file count differs (${count})`);
  }
}

const archiveRoot = resolve(root, '../archive/courses/v0.1');
if (existsSync(archiveRoot)) {
  const archiveFiles = readdirSync(archiveRoot, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => resolve(entry.parentPath, entry.name));
  const archiveBytes = archiveFiles.reduce((sum, path) => sum + statSync(path).size, 0);
  if (archiveFiles.length !== migration.archiveInventory.files) errors.push('archive: file count differs from migration inventory');
  if (archiveBytes !== migration.archiveInventory.bytes) errors.push('archive: byte count differs from migration inventory');
}

for (const docsRoot of ['guide', 'docs/guide']) {
  for (const path of walkFiles(docsRoot).filter(path => path.endsWith('.md') && !path.endsWith('SPEC-TEMPLATE.md'))) {
    const markdown = readFileSync(path, 'utf8');
    for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const ref = match[1].split('#')[0];
      if (!ref || /^(?:https?:|mailto:|URL$)/.test(ref)) continue;
      if (!existsSync(resolve(dirname(path), decodeURIComponent(ref)))) errors.push(`docs: broken link ${match[1]} in ${path}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${catalog.length} items, ${countedExamples} examples, all references resolve`);
