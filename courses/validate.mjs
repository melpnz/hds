import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStyleProfile } from './tools/build-style-profile.mjs';
import { visualContractFor } from './tools/build-visual-contracts.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const requiredItemKeys = ['id', 'title', 'kind', 'category', 'maturity', 'knowledge', 'purpose', 'implementation', 'states', 'examples', 'evidence', 'unknowns'];
const errors = [];
const dimensionDocument = read('machine/dimension-tokens.json');
const dimensionValues = Object.fromEntries(Object.values(dimensionDocument.tokens || {}).flatMap(group =>
  Object.values(group).map(token => {
    if (token.$extensions?.unitPolicy === 'unitless') return [token.cssVariable, `${token.$extensions.lineHeightReferencePixels}px`];
    if (token.$extensions?.unitPolicy === 'semantic-full') return [token.cssVariable, '9999px'];
    if (Number.isFinite(token.$extensions?.referencePixels)) return [token.cssVariable, `${token.$extensions.referencePixels}px`];
    return [token.cssVariable, token.$value];
  })
));
const resolveDimensions = source => source.replace(/var\((--courses-[^)]+)\)/g, (match, token) => dimensionValues[token] || match);
const viewerWidths = [320, 480, 768, 1024];
const presentationLayouts = ['fit-content', 'constrained', 'canvas', 'context'];
const index = read('machine/index.json');
const catalog = read(index.files.catalog);
const ids = new Set(catalog.map(item => item.id));
const migration = read(index.files.migrationMap);
const styleProfile = read(index.files.styleProfile);
const providerCompatibility = read(index.files.providerCompatibility);
const providerMapping = read(index.files.providerMapping);
if (JSON.stringify(styleProfile) !== JSON.stringify(buildStyleProfile())) errors.push('style-profile: generated profile is stale');
const contentRules = read('machine/content.json');
const compositionGuide = readFileSync(resolve(root, 'docs/guide/composition.md'), 'utf8');
for (const contentRule of contentRules.rules || []) {
  const rulePath = `machine/rules/${contentRule.id.toLowerCase()}.json`;
  if (!existsSync(resolve(root, rulePath))) {
    errors.push(`content: ${contentRule.id} has no machine rule`);
    continue;
  }
  const machineRule = read(rulePath);
  for (const field of ['statement', 'coverage', 'exception']) {
    if (machineRule[field] !== contentRule[field]) errors.push(`content: ${contentRule.id}.${field} differs from ${rulePath}`);
  }
  const markdownRow = `| **${contentRule.id}** | ${contentRule.statement} | ${contentRule.coverage} | ${contentRule.exception} |`;
  if (!compositionGuide.includes(markdownRow)) errors.push(`content: ${contentRule.id} differs from docs/guide/composition.md`);
}
for (const [format, contract] of Object.entries(contentRules.numberFormats || {})) {
  const rule = (contentRules.rules || []).find(candidate => candidate.id === contract.rule);
  if (!rule) errors.push(`content: number format ${format} references unknown ${contract.rule}`);
  else {
    const machineRule = read(`machine/rules/${contract.rule.toLowerCase()}.json`);
    if (machineRule.predicate?.kind && machineRule.predicate.kind !== format) errors.push(`content: number format ${format} differs from ${contract.rule} predicate`);
    if (!machineRule.predicate?.type) errors.push(`content: ${contract.rule} has no executable predicate`);
    if (!rule.statement.includes(contract.example)) errors.push(`content: ${contract.rule} does not contain canonical example ${contract.example}`);
  }
}
const buttonLabelTotal = (contentRules.buttonLabels || []).reduce((sum, item) => sum + item.count, 0);
if (buttonLabelTotal !== 191) errors.push(`content: expected 191 measured button labels, got ${buttonLabelTotal}`);
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
  const archiveBase = resolve(root, '..', 'archive');
  // The v0.1 archive is intentionally local and excluded from Git. Validate
  // archive references when that optional evidence bundle is present, but do
  // not make a clean checkout depend on unpublished historical files.
  if (clean.startsWith('archive:') && !existsSync(archiveBase)) return;
  const target = clean.startsWith('archive:')
    ? resolve(archiveBase, clean.slice('archive:'.length))
    : clean.startsWith('local:')
      ? resolve(root, clean.slice('local:'.length))
      : resolve(root, clean);
  if (!existsSync(target)) errors.push(`${owner}: missing evidence ${ref}`);
}

for (const path of Object.values(index.files)) pathExists(path, 'index');

const providerComponents = new Map(providerMapping.mappings.map(mapping => [mapping.guideId, mapping]));
function validateCompositionNode(node, owner, directIds) {
  if (!node || !['provider-component', 'native', 'external-slot'].includes(node.kind)) {
    errors.push(`${owner}: invalid composition node`);
    return;
  }
  if (node.kind === 'provider-component') {
    const mapping = providerComponents.get(node.id);
    directIds.push(node.id);
    if (!mapping || mapping.status !== 'direct' || mapping.visibility !== 'public') {
      errors.push(`${owner}: ${node.id} is not a direct public provider component`);
    } else {
      if (node.providerComponentId !== mapping.providerComponentId) errors.push(`${owner}: stale provider component id for ${node.id}`);
      if (node.exportName !== mapping.exportName) errors.push(`${owner}: stale provider export for ${node.id}`);
    }
  }
  if (node.kind === 'native' && !node.element) errors.push(`${owner}: native node has no element`);
  if (node.kind === 'external-slot' && !node.id) errors.push(`${owner}: external slot has no id`);
  for (const [index, child] of (node.children || []).entries()) validateCompositionNode(child, `${owner}.children[${index}]`, directIds);
}

if (ids.size !== catalog.length) errors.push('catalog: duplicate ids');
const foundationIds = ['colors', 'typography', 'spacing-grid', 'radii-borders', 'iconography', 'responsive-layout'];
if (catalog.length !== 84) errors.push(`catalog: expected 84 canonical items after page-pattern reconciliation, got ${catalog.length}`);
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
    const composition = item.providerComposition;
    if (composition?.schemaVersion !== 1) errors.push(`${entry.id}: provider composition schema is absent`);
    if (composition?.provider?.id !== providerCompatibility.activeProvider || composition?.provider?.id !== providerMapping.provider.id) {
      errors.push(`${entry.id}: provider composition does not use the active provider`);
    }
    if (composition?.provider?.version !== providerMapping.provider.version) errors.push(`${entry.id}: provider composition version is stale`);
    if (composition?.ownership?.pagePattern !== 'guide' || composition?.ownership?.componentImplementation !== 'active-provider' || composition?.ownership?.staticExample !== 'evidence-and-github-fallback') {
      errors.push(`${entry.id}: provider composition ownership boundary is incomplete`);
    }
    const compositionAreaIds = composition?.areas?.map(area => area.id) || [];
    if (JSON.stringify(compositionAreaIds) !== JSON.stringify(item.areas || [])) errors.push(`${entry.id}: provider composition area order differs from pattern`);
    const directCompositionIds = [];
    for (const [slot, node] of Object.entries(composition?.shell || {})) validateCompositionNode(node, `${entry.id}.shell.${slot}`, directCompositionIds);
    if (!composition?.shell?.header || !composition?.shell?.footer) errors.push(`${entry.id}: provider shell must contain header and footer`);
    for (const area of composition?.areas || []) {
      if (!Array.isArray(area.nodes) || area.nodes.length === 0) errors.push(`${entry.id}.${area.id}: composition area is empty`);
      for (const [index, node] of (area.nodes || []).entries()) validateCompositionNode(node, `${entry.id}.${area.id}[${index}]`, directCompositionIds);
    }
    const expectedDirectIds = [...new Set(directCompositionIds)];
    if (JSON.stringify(composition?.directComponentIds) !== JSON.stringify(expectedDirectIds)) errors.push(`${entry.id}: direct component index is stale`);
    if (composition?.directComponentIds?.some(id => ['avatar', 'entity-logo'].includes(id))) errors.push(`${entry.id}: nested avatar/logo leaked into direct page composition`);
    for (const [index, area] of (item.sequence || []).entries()) {
      if (area.id !== item.areas[index]) errors.push(`${entry.id}: sequence area ${index + 1} does not match areas`);
      if (area.stub && (area.stub.length <= 80 || !area.stub.endsWith('components/collections/carousel.md'))) errors.push(`${entry.id}: truncated or incomplete stub in ${area.id}`);
    }
    if (item.entityLogoUsage) {
      const expectedEntityLogos = Object.values(item.entityLogoUsage).reduce((sum, count) => sum + count, 0);
      if (!item.components?.includes('entity-logo')) errors.push(`${entry.id}: EntityLogo dependency is absent`);
      for (const [areaId, count] of Object.entries(item.entityLogoUsage)) {
        const area = item.sequence?.find(candidate => candidate.id === areaId);
        if (!area?.components?.some(component => component.id === 'entity-logo' && component.count === count)) {
          errors.push(`${entry.id}: EntityLogo count is not attached to ${areaId}`);
        }
      }
      const pageExample = item.examples?.[0];
      if (pageExample && existsSync(resolve(root, pageExample.file))) {
        const html = readFileSync(resolve(root, pageExample.file), 'utf8');
        const renderedEntityLogos = [...html.matchAll(/data-component="entity-logo"/g)].length;
        if (renderedEntityLogos !== expectedEntityLogos) errors.push(`${entry.id}: expected ${expectedEntityLogos} EntityLogo instances, got ${renderedEntityLogos}`);
        for (const tag of html.match(/<img\b[^>]*data-component="entity-logo"[^>]*>/g) || []) {
          if (!tag.includes('class="crs-entity-logo') || !tag.includes('avatar-default-company.svg') || !/data-size="(?:24|32|36|40|48|56|68|100)"/.test(tag)) {
            errors.push(`${entry.id}: EntityLogo markup is not canonical`);
          }
        }
      }
    }
    const pageExample = item.examples?.[0];
    if (pageExample && existsSync(resolve(root, pageExample.file))) {
      const html = readFileSync(resolve(root, pageExample.file), 'utf8');
      if (/Carousel · (?:AdSlot|CourseCard|ArticleCard|ReviewCard)/.test(html)) {
        errors.push(`${entry.id}: service Carousel label leaked into the assembled page`);
      }
    }
    if (entry.id === 'education-center') {
      const grid = item.layout?.courseGrid;
      if (grid?.component !== 'card-grid' || grid?.variant !== 'school-courses' || grid?.visibleCards?.tablet !== 6 || grid?.visibleCards?.phone !== 4) {
        errors.push('education-center: school course grid contract is incomplete');
      }
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      if (!html.includes('data-component="card-grid" data-variant="school-courses"')) {
        errors.push('education-center: page does not reuse the school-courses CardGrid variant');
      }
    }
    if (entry.id === 'courses-listing') {
      if (item.layout?.rubricationNavigation?.gap?.token !== '--courses-space-16' || item.layout?.rubricationNavigation?.gap?.sameAtAllWidths !== true) {
        errors.push('courses-listing: rubrication navigation must keep the 16px token gap at every width');
      }
      const rubricationArea = item.providerComposition?.areas?.find(area => area.id === 'rubrication-navigation');
      const rubricationNode = rubricationArea?.nodes?.[0];
      const rubricLinks = rubricationNode?.children?.[0];
      if (rubricationNode?.kind !== 'native' || rubricationNode?.element !== 'nav' || rubricationNode?.responsive !== 'single-line-horizontal-scroll-edge-to-edge') {
        errors.push('courses-listing: rubrication navigation behavior is incomplete');
      }
      if (rubricLinks?.id !== 'link' || rubricLinks?.count !== 4 || rubricLinks?.exportName !== 'Link') {
        errors.push('courses-listing: rubrication navigation must reuse four provider Links');
      }
      const html = readFileSync(resolve(root, item.examples[0].file), 'utf8');
      const rubricationMarkup = html.match(/<div class="rubrication-header[\s\S]*?<\/div>/)?.[0] || '';
      if ([...rubricationMarkup.matchAll(/<a\b/g)].length !== 4 || !rubricationMarkup.includes('overflow-x-auto')) {
        errors.push('courses-listing: production rubric links or horizontal overflow are absent');
      }
    }
  }
  if (entry.id === 'card-grid') {
    const variant = item.variants?.['school-courses'];
    if (variant?.gap?.token !== '--courses-space-16' || variant?.visibleCards?.tablet !== 6 || variant?.visibleCards?.phone !== 4) {
      errors.push('card-grid: school-courses variant contract is incomplete');
    }
    const css = readFileSync(resolve(root, 'ui/components/layout.css'), 'utf8');
    const example = readFileSync(resolve(root, item.examples[0].file), 'utf8');
    for (const marker of ['crs-card-grid--school-courses', ':nth-child(n + 7)', ':nth-child(n + 5)']) {
      if (!css.includes(marker)) errors.push(`card-grid: CSS is missing ${marker}`);
    }
    if (!example.includes('crs-card-grid--school-courses')) errors.push('card-grid: school-courses variant is absent from the canonical example');
  }
  if (entry.id === 'colors') {
    const auditTokens = item.visual?.usageAudit?.candidateUnused || [];
    const figmaOnly = item.visual?.usageAudit?.figmaOnlyEquivalent || [];
    const example = item.examples?.[0];
    const html = example ? readFileSync(resolve(root, example.file), 'utf8') : '';
    const script = readFileSync(resolve(root, 'examples/foundations/colors/colors.js'), 'utf8');
    if (!html.includes('Предположительно нигде не используются') || !html.includes('id="unused-colors"')) {
      errors.push('colors: unused-candidate block is absent from the live example');
    }
    for (const token of auditTokens) {
      const id = token.replace(/^--color-/, '');
      if (!script.includes(`['${id}',`)) errors.push(`colors: ${token} is absent from the unused-candidate block`);
    }
    if (!html.includes('Предположительно используются только в Figma') || !html.includes('id="figma-only-colors"')) {
      errors.push('colors: Figma-only block is absent from the live example');
    }
    for (const pair of figmaOnly) {
      const id = pair.token.replace(/^--color-/, '');
      if (!script.includes(`['${id}',`) || !script.includes(`'${pair.alias}'`)) {
        errors.push(`colors: ${pair.token} → ${pair.alias} is absent from the Figma-only block`);
      }
    }
    if (auditTokens.length !== 12) errors.push(`colors: expected twelve unused candidates, got ${auditTokens.length}`);
    if (figmaOnly.length !== 3) errors.push(`colors: expected three Figma-only equivalents, got ${figmaOnly.length}`);
  }
  if (entry.id === 'profile-history') {
    const example = item.examples?.[0];
    if (item.kind !== 'module' || item.category !== 'entities' || example?.id !== 'default') {
      errors.push('profile-history: catalog or example contract is incomplete');
    }
    if (!item.dependencies?.includes('entity-logo')) errors.push('profile-history: EntityLogo dependency is absent');
    if (example && existsSync(resolve(root, example.file))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if (!html.includes('data-component="profile-history"')) errors.push('profile-history: canonical component hook is absent');
      if ([...html.matchAll(/class="crs-profile-history__section"/g)].length !== 2) errors.push('profile-history: expected experience and education sections');
      if ([...html.matchAll(/class="crs-profile-history__item"/g)].length < 6) errors.push('profile-history: production-backed sample is too small');
      if ([...html.matchAll(/data-component="entity-logo"/g)].length < 6) errors.push('profile-history: rows do not reuse EntityLogo');
    }
    const author = read('machine/patterns/author.json');
    const authorHtml = readFileSync(resolve(root, author.examples[0].file), 'utf8');
    if (!author.modules?.includes('profile-history') || !authorHtml.includes('data-component="profile-history"')) {
      errors.push('profile-history: author page does not reuse the component');
    }
  }
  if (entry.id === 'catalog-menu') {
    const examplePath = item.examples?.[0]?.file;
    if (!examplePath || !existsSync(resolve(root, examplePath))) errors.push('catalog-menu: canonical example is absent');
    else {
      const html = readFileSync(resolve(root, examplePath), 'utf8');
      if (!html.includes('crs-catalog-menu__groups') || !html.includes('crs-catalog-menu__group-title')) errors.push('catalog-menu: structured second level is absent');
      if (!html.includes('crs-catalog-menu__tiles') || !html.includes('data-catalog-image')) errors.push('catalog-menu: mobile image tiles are absent');
      if (!html.includes('Может быть интересно')) errors.push('catalog-menu: mobile suggestions are absent');
    }
    const css = readFileSync(resolve(root, 'ui/components/overlays.css'), 'utf8');
    if (!css.includes('grid-template-columns: repeat(3, minmax(0, 1fr))') || !css.includes('@media (max-width: 359px)')) {
      errors.push('catalog-menu: responsive tile grid contract is absent');
    }
    for (const asset of ['neural-ai.png', 'development.png', 'analytics.png', 'design.png', 'marketing.png', 'business.png', 'languages.png', 'soft-skills.png', 'wellness.png', 'hobby.png', 'psychology.png', 'cooking.png', 'pedagogy.png', 'software.png', 'continuing-education.png', 'profession-collections.png', 'reviews.png', 'promo.png', 'rating.png', 'child-ege.png', 'child-oge.png', 'child-exam.png', 'child-dvi.png', 'child-vpr.png', 'child-olympiad.png', 'child-school.png', 'child-home-school.png', 'child-hobby.png', 'child-languages.png', 'child-horizon.png', 'child-college.png']) {
      pathExists(`ui/assets/images/catalog/${asset}`, 'catalog-menu');
    }
  }
  if (!item.visual || !Object.keys(item.visual).length) errors.push(`${entry.id}: visual contract is missing`);
  if (!['foundation'].includes(entry.kind) && entry.id !== 'button') {
    const expectedVisual = visualContractFor(item);
    if (JSON.stringify(item.visual) !== JSON.stringify(expectedVisual)) errors.push(`${entry.id}: generated visual contract is stale`);
  }
  if (entry.id === 'button') {
    if (item.examples.length !== 1 || item.examples[0].id !== 'playground') errors.push('button: expected one optimized playground example');
    if (!item.states.ui.includes('loading')) errors.push('button: Figma loading state is absent');
    const matrix = item.variantMatrix;
    const computedCombinations = Object.values(matrix?.sizes || {}).reduce((sum, size) => sum + size.tones.length, 0)
      * (matrix?.states?.length || 0) * (matrix?.icon?.length || 0);
    if (computedCombinations !== 168 || matrix?.combinations !== 168) errors.push(`button: variant matrix must retain 168 combinations, got ${computedCombinations}`);
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
    if (JSON.stringify(item.examples.map(example => example.id)) !== JSON.stringify(['figma-variants'])) errors.push('site-header: expected one consolidated SiteHeader playground');
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
      if (!html.includes('crs-tabs-group crs-tabs-group--hero') || !html.includes('class="crs-context-tab"')) errors.push('site-header: HeroTabs component is not reused');
      if (!html.includes('crs-site-header__filters-inner') || !html.includes('max-width:1124px')) errors.push('site-header: filter row is not constrained by the page container');
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
      if ([...html.matchAll(/class="crs-ad-slot-demo__card/g)].length !== 3) errors.push('ad-slot: expected three localized AdCard examples');
      const collectionsCss = readFileSync(resolve(root, 'ui/components/collections.css'), 'utf8');
      if (!collectionsCss.includes('aspect-ratio:272/280') || !collectionsCss.includes('height: var(--courses-size-232)')) errors.push('ad-slot: responsive AdCard geometry is absent');
      if (html.includes('class="flex items-center justify-center overflow-hidden -mt-4 adfox-banner rounded-3xl"></div>')) errors.push('ad-slot: empty production container leaked into the live preview');
    }
  }
  if (entry.id === 'carousel') {
    const example = item.examples[0];
    const html = readFileSync(resolve(root, example.file), 'utf8');
    const css = readFileSync(resolve(root, 'ui/components/collections.css'), 'utf8');
    if ([...html.matchAll(/data-component="carousel"/g)].length !== 4) errors.push('carousel: expected four standalone variants');
    if ([...html.matchAll(/class="crs-carousel__title"/g)].length !== 4) errors.push('carousel: standalone variant titles are incomplete');
    if ([...html.matchAll(/class="crs-icon-button/g)].length !== 8) errors.push('carousel: shared IconButton controls are incomplete');
    for (const marker of [
      'grid-auto-columns: calc((100% - var(--courses-space-32)) / 3)',
      'grid-auto-columns: calc((100% - var(--courses-space-48)) / 4)',
      'grid-auto-columns: calc((100% - var(--courses-space-16)) / 2)',
      'aspect-ratio:272/280',
      '.crs-ad-slot-demo__pagination { display: none',
    ]) if (!css.includes(marker)) errors.push(`carousel: responsive contract is missing ${marker}`);
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['course-card-columns', 'wide-card-columns', 'ad-slot-geometry', 'navigation', 'ad-slot-loop'])) errors.push('carousel: responsive layout rules are incomplete');
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
    if (example?.preview?.mode !== 'viewport' || JSON.stringify(example.preview.widths) !== JSON.stringify(viewerWidths)) errors.push('modal: responsive viewport playground is absent');
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
      if (html.includes('class="crs-modal-preset"') || !html.includes("matchMedia('(max-width:767px)')")) errors.push('modal: presentation must follow the viewer width without internal device presets');
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
    if (item.examples.length !== 1 || example?.id !== 'content-variants' || example?.preview?.mode !== 'viewport') errors.push('promo-code-modal: expected one responsive content-variants example');
    if (item.componentFamily?.id !== 'modal' || item.componentFamily?.member !== 'PromoCodeModal') errors.push('promo-code-modal: Modal family metadata is absent');
    if (!item.dependencies?.includes('modal')) errors.push('promo-code-modal: dependency on Modal is absent');
    if (entry.navGroup !== 'modals' || entry.navSection !== 'blocks') errors.push('promo-code-modal: Modal navigation grouping is absent');
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if ([...html.matchAll(/class="crs-promo-code-modal"/g)].length !== 2) errors.push('promo-code-modal: expected promo-code and promotion content variants');
      if (html.includes('device-switch') || html.includes('data-device=')) errors.push('promo-code-modal: presentation must follow the viewer width without an internal device switch');
      if (!html.includes('@media(max-width:767px)')) errors.push('promo-code-modal: responsive viewport presentation is absent');
    }
  }
  if (entry.id === 'filter-modal') {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'responsive') errors.push('filter-modal: expected one responsive example');
    for (const state of ['open', 'closed', 'body-scroll', 'mobile', 'desktop']) {
      if (!example?.covers?.includes(state)) errors.push(`filter-modal: ${state} is absent from example coverage`);
    }
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(['viewport-shell', 'body-scroll', 'mobile', 'recommendations-scroll'])) errors.push('filter-modal: viewport and scroll rules are incomplete');
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
    if (item.examples.length !== 1 || example?.id !== 'responsive-flow') errors.push(`${entry.id}: expected one responsive-flow example`);
    if (example?.preview?.mode !== 'viewport' || JSON.stringify(example.preview.widths) !== JSON.stringify(viewerWidths)) errors.push(`${entry.id}: responsive viewport preview is absent`);
    for (const state of ['open', 'closed', 'desktop', 'tablet', 'mobile', ...(isSort ? ['selected'] : ['reset', 'submit'])]) {
      if (!example?.covers?.includes(state)) errors.push(`${entry.id}: ${state} is absent from example coverage`);
    }
    const expectedRules = isSort
      ? ['responsive-presentation', 'bottom-anchor', 'dismiss']
      : ['responsive-presentation', 'responsive-padding-and-title', 'bottom-anchor', 'dismiss'];
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(expectedRules)) errors.push(`${entry.id}: responsive behavior rules are incomplete`);
    for (const nodeId of ['9094:48333', isSort ? '9356:50311' : '9356:52508']) {
      const hasNode = item.evidence?.some(source => source.data?.nodeId === nodeId || source.data?.some?.(data => data.nodeId === nodeId));
      if (!hasNode) errors.push(`${entry.id}: Figma evidence ${nodeId} is absent`);
    }
    if (!item.stateCoverage?.captured?.includes('closed') || item.stateCoverage?.uncaptured?.length) errors.push(`${entry.id}: open/closed flow is not captured`);
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if (isSort) {
        if (html.includes('device-switch') || html.includes('data-device=')) errors.push('sort-sheet: presentation must follow the viewer width without an internal device switch');
        if (!html.includes('@media(max-width:767px)')) errors.push('sort-sheet: responsive viewport presentation is absent');
        if ([...html.matchAll(/role="option"/g)].length !== 6 || !html.includes("option.setAttribute('aria-selected','true')")) errors.push('sort-sheet: selectable list behavior is incomplete');
      } else {
        if (!html.includes('role="dialog"') || !html.includes("querySelectorAll('.crs-price-sheet__input')")) errors.push('price-sheet: dialog or reset behavior is incomplete');
        if (html.includes('device-switch') || html.includes('data-device=')) errors.push('price-sheet: presentation must follow the viewer width without an internal device switch');
        if (!html.includes('@media(max-width:767px)')) errors.push('price-sheet: responsive viewport presentation is absent');
      }
    }
  }
  if (entry.id === 'filter-chip') {
    if (entry.navGroup !== 'filter-chips' || entry.navGroupTitle !== 'Filter Chips' || entry.title !== 'FilterChip') errors.push('filter-chip: family grouping or canonical title is incorrect');
    if (item.componentFamily?.id !== 'filter-chip' || item.componentFamily?.legacyId !== 'tab') errors.push('filter-chip: merged family metadata is absent');
    const extended = item.examples.find(example => example.id === 'menu-switch');
    if (item.examples.length !== 2 || !extended) errors.push('filter-chip: Basic and Menu / Switch examples are required');
    for (const state of ['default', 'hover', 'focus-visible', 'pressed', 'disabled', 'loading', 'open']) {
      if (!item.states.ui.includes(state) || !extended?.covers?.includes(state)) errors.push(`filter-chip: missing ${state} state coverage`);
    }
    if (!item.variants?.find(variant => variant.id === 'kind')?.use.includes('FilterChipMenu')) errors.push('filter-chip: Menu / Switch variants are absent');
    if (existsSync(resolve(root, extended?.file || ''))) {
      const html = readFileSync(resolve(root, extended.file), 'utf8');
      if ([...html.matchAll(/class="crs-filter-chip-matrix__row"/g)].length !== 6) errors.push('filter-chip: expected six extended state rows');
      if ([...html.matchAll(/class="crs-filter-chip crs-filter-chip--/g)].length !== 15) errors.push('filter-chip: expected fifteen extended samples');
      if (!html.includes('aria-expanded="true"') || !html.includes('role="listbox"')) errors.push('filter-chip: open Menu semantics are absent');
    }
  }
  if (entry.id === 'button-group') {
    if (entry.navGroup !== 'tabs' || entry.title !== 'ButtonGroup') errors.push('button-group: grouping or canonical title is incorrect');
    const pageExample = item.examples.find(example => example.id === 'page-tabs');
    const heroExample = item.examples.find(example => example.id === 'hero');
    if (item.examples.length !== 2 || !pageExample || !heroExample) errors.push('button-group: light and hero examples are required');
    if (item.componentFamily?.id !== 'button-group' || item.componentFamily?.legacyId !== 'segmented-control') errors.push('button-group: merged family metadata is absent');
    for (const state of ['default', 'hover', 'focus-visible', 'selected', 'disabled', 'loading']) {
      if (!item.states.ui.includes(state) || !pageExample?.covers?.includes(state) || !heroExample?.covers?.includes(state)) errors.push(`button-group: missing ${state} state coverage`);
    }
    for (const example of [pageExample, heroExample]) {
      if (!example || !existsSync(resolve(root, example.file))) continue;
      const html = readFileSync(resolve(root, example.file), 'utf8');
      if ([...html.matchAll(/class="crs-context-tab"/g)].length !== 9) errors.push(`button-group/${example.id}: expected nine tab samples`);
      if ([...html.matchAll(/class="crs-tabs-sample"/g)].length !== 6) errors.push(`button-group/${example.id}: expected six state samples`);
    }
    if (!item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === '4261:1716')) errors.push('button-group: hero evidence is absent');
    if (!item.evidence?.some(source => source.type === 'figma' && source.data?.nodeId === '4813:288')) errors.push('button-group: light evidence is absent');
  }
  if (['select', 'multi-select', 'search-input', 'text-input', 'textarea'].includes(entry.id)) {
    const example = item.examples[0];
    if (item.examples.length !== 1 || example?.id !== 'field-family') errors.push(`${entry.id}: expected one field-family overview`);
    if (!item.states.ui.includes('error')) errors.push(`${entry.id}: Figma error state is absent`);
    if (!item.variants?.some(variant => variant.id === 'state')) errors.push(`${entry.id}: shared state variants are absent`);
    if (entry.id !== 'textarea' && !item.variants?.find(variant => variant.id === 'size')?.use.includes('XL / SearchForm: 56 px')) errors.push(`${entry.id}: M/XL size scale is incomplete`);
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      const expectedControls = entry.id === 'textarea' ? 10 : ['select', 'multi-select'].includes(entry.id) ? 13 : entry.id === 'text-input' ? 14 : 12;
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
    if (entry.id === 'checkbox' && (!item.stateCoverage?.captured?.includes('indeterminate') || item.stateCoverage?.uncaptured?.includes('indeterminate'))) errors.push('checkbox: indeterminate state must be captured');
    const expectedLayoutRules = ['checkbox', 'radio-button'].includes(entry.id) ? ['control-label', 'vertical-list', 'horizontal-list'] : ['control-label'];
    if (JSON.stringify(item.layoutRules?.map(rule => rule.id)) !== JSON.stringify(expectedLayoutRules)) errors.push(`${entry.id}: control label/list spacing rules are incomplete`);
    if (!item.layoutRules?.find(rule => rule.id === 'control-label')?.implementation.includes('padding-top:1px')) errors.push(`${entry.id}: label top padding rule is not 1px`);
    if (existsSync(resolve(root, example?.file || ''))) {
      const html = readFileSync(resolve(root, example.file), 'utf8');
      const expectedControls = entry.id === 'checkbox' ? 17 : entry.id === 'radio-button' ? 16 : 10;
      if ([...html.matchAll(/class="crs-control crs-control--/g)].length !== expectedControls) errors.push(`${entry.id}: expected ${expectedControls} control samples`);
      for (const state of ['default', 'hover', 'focus', 'disabled', 'loading']) {
        if ([...html.matchAll(new RegExp(`data-state="${state}"`, 'g'))].length < 2) errors.push(`${entry.id}: ${state} off/on pair is absent`);
      }
      if ([...html.matchAll(/aria-busy="true"/g)].length !== 2) errors.push(`${entry.id}: loading semantics are incomplete`);
      if (entry.id === 'radio-button' && !html.includes('type="radio"')) errors.push('radio-button: native radio inputs are absent');
      if (entry.id === 'switch' && !html.includes('role="switch"')) errors.push('switch: switch semantics are absent');
      if (entry.id === 'checkbox' && !html.includes('ui/assets/controls/check.svg')) errors.push('checkbox: exported check asset is absent');
      if (entry.id === 'checkbox' && (!html.includes('data-state="indeterminate"') || !html.includes('.indeterminate=true'))) errors.push('checkbox: indeterminate sample or native state is absent');
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
      if (entry.id === 'entity-logo' && [...html.matchAll(/data-component="entity-logo"/g)].length !== 8) errors.push('entity-logo: canonical component hook is absent from size scale');
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

const generatedUiFiles = [
  'ui/dimension-tokens.css', 'ui/page-examples.css',
  'ui/assets/images/avatar-default-user.svg', 'ui/assets/images/avatar-default-company.svg',
  'ui/assets/images/filter-modal/recommendation-career.png', 'ui/assets/images/filter-modal/recommendation-certificate.png',
  'ui/assets/images/filter-modal/recommendation-free.png', 'ui/assets/images/filter-modal/recommendation-mentor.png',
  'ui/assets/images/modal/example.png',
  'ui/assets/images/feedback-success.png',
  'ui/assets/images/content/article-career.png',
  'ui/assets/images/carousel/ad-promo.png', 'ui/assets/images/carousel/ad-ai.png',
  'ui/assets/images/carousel/ad-previous.png', 'ui/assets/images/carousel/ad-extra-1.png',
  'ui/assets/images/carousel/ad-extra-2.png', 'ui/assets/images/carousel/ad-extra-3.png',
  'ui/assets/images/carousel/ad-promo-mobile.png', 'ui/assets/images/carousel/ad-previous-mobile.png',
  'ui/assets/images/experts/expert-achieve.svg', 'ui/assets/images/experts/experts.svg',
  ...['neural-ai.png', 'development.png', 'analytics.png', 'design.png', 'marketing.png', 'business.png', 'languages.png', 'soft-skills.png', 'wellness.png', 'hobby.png', 'psychology.png', 'cooking.png', 'pedagogy.png', 'software.png', 'continuing-education.png', 'profession-collections.png', 'reviews.png', 'promo.png', 'rating.png', 'child-ege.png', 'child-oge.png', 'child-exam.png', 'child-dvi.png', 'child-vpr.png', 'child-olympiad.png', 'child-school.png', 'child-home-school.png', 'child-hobby.png', 'child-languages.png', 'child-horizon.png', 'child-college.png'].map(name => `ui/assets/images/catalog/${name}`),
  'ui/assets/icons/filter-grade-min.svg', 'ui/assets/icons/filter-grade-mid.svg', 'ui/assets/icons/filter-grade-max.svg',
  'ui/assets/icons/contact-phone.svg',
  'ui/assets/icons/ad-dots.svg',
  'ui/assets/controls/check.svg', 'ui/assets/controls/dot.svg', 'ui/assets/controls/filter-chip-tooltip.svg',
  'ui/assets/controls/filter-chip-tooltip-selected.svg', 'ui/assets/controls/filter-chip-tooltip-disabled.svg',
  'ui/assets/controls/filter-chip-dot.svg'
];
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
