import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const oldRoot = resolve(root, '..', 'archive', 'career', 'v1');
const legacyPrefix = 'archive:career/v1/';
const readJson = path => JSON.parse(readFileSync(resolve(oldRoot, path), 'utf8'));
const readText = path => readFileSync(resolve(oldRoot, path), 'utf8');
const write = (path, value) => {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (path, value) => {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value);
};
const slug = value => value.toLowerCase().replaceAll(/[^a-zа-я0-9]+/g, '-').replace(/^-|-$/g, '');
const fileSlug = value => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function parseSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let current = { title: 'Введение', markdown: [] };
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (current.markdown.join('\n').trim()) sections.push({ title: current.title, markdown: current.markdown.join('\n').trim() });
      current = { title: heading[1].trim(), markdown: [] };
    } else {
      current.markdown.push(line);
    }
  }
  if (current.markdown.join('\n').trim()) sections.push({ title: current.title, markdown: current.markdown.join('\n').trim() });
  return sections;
}

function extractHtml(markdown) {
  return markdown.match(/```html\s*\r?\n([\s\S]*?)```/i)?.[1].trim() || null;
}

function firstParagraph(section) {
  if (!section) return '';
  return section.markdown
    .split(/\n\s*\n/)[0]
    .replaceAll(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replaceAll(/[*_`]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function bullets(section) {
  if (!section) return [];
  return section.markdown.split(/\r?\n/)
    .filter(line => /^[-*]\s+/.test(line))
    .map(line => line.replace(/^[-*]\s+/, '').replaceAll(/[*_`]/g, '').trim());
}

const sourceComponents = readJson('machine/components.json');
const sourceRules = readJson('machine/rules.json');
const sourcePatterns = readJson('machine/patterns.json');
const sourceContent = readJson('machine/content.json');
const sourceTokens = readJson('machine/tokens.json');
const catalog = [];

function walkFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory()
      ? walkFiles(resolve(directory, entry.name), relative)
      : [relative];
  });
}

const normalizePath = path => path.replaceAll('\\', '/');
const allOldFiles = walkFiles(oldRoot).map(normalizePath);
const allMarkdownFiles = allOldFiles.filter(path => path.endsWith('.md'));

const iconRoot = resolve(root, 'ui/assets/icons');
const spriteSheets = new Set(['sprite.svg', 'contacts.svg', 'reactions.svg', 'services.svg', 'social-v3.1.svg']);
const iconAssets = walkFiles(iconRoot)
  .filter(path => path.endsWith('.svg'))
  .map(path => {
    const representation = spriteSheets.has(path) ? 'sprite-sheet' : 'standalone';
    const source = readFileSync(resolve(iconRoot, path), 'utf8');
    return {
      id: path.replace(/\.svg$/, ''),
      name: basename(path, '.svg'),
      path: `ui/assets/icons/${path}`,
      group: path.includes('/') ? path.split('/').slice(0, -1).join('/') : 'root',
      representation,
      symbolCount: representation === 'sprite-sheet' ? (source.match(/<svg\s+id=/g) || []).length : 1
    };
  });
const iconInventoryFile = 'machine/foundations/icons-inventory.json';
write(iconInventoryFile, {
  id: 'icons-inventory',
  kind: 'asset-inventory',
  root: 'ui/assets/icons/',
  totals: {
    files: iconAssets.length,
    standalone: iconAssets.filter(item => item.representation === 'standalone').length,
    spriteSheets: iconAssets.filter(item => item.representation === 'sprite-sheet').length,
    spriteSymbols: iconAssets.filter(item => item.representation === 'sprite-sheet').reduce((sum, item) => sum + item.symbolCount, 0)
  },
  assets: iconAssets
});

const imageExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const extensionOf = path => `.${path.split('.').pop().toLowerCase()}`;
const uiAssetFiles = walkFiles(resolve(root, 'ui/assets')).map(normalizePath).filter(path => imageExtensions.has(extensionOf(path)));
const uiAssetInventoryFile = 'machine/assets/ui-assets.json';
write(uiAssetInventoryFile, {
  id: 'ui-assets',
  kind: 'asset-inventory',
  title: 'UI assets',
  root: 'ui/assets/',
  total: uiAssetFiles.length,
  assets: uiAssetFiles.map(path => ({
    name: basename(path),
    path: `ui/assets/${path}`,
    group: path.includes('/') ? path.split('/').slice(0, -1).join('/') : 'root',
    type: extensionOf(path).slice(1),
    previewable: !spriteSheets.has(path.replace(/^icons\//, ''))
  }))
});

const evidenceImageFiles = allOldFiles.filter(path => path.startsWith('evidence/') && imageExtensions.has(extensionOf(path)));
for (const path of evidenceImageFiles) {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(oldRoot, path), target);
}
const evidenceAssetInventoryFile = 'machine/assets/evidence-assets.json';
write(evidenceAssetInventoryFile, {
  id: 'evidence-assets',
  kind: 'asset-inventory',
  title: 'Evidence screenshots',
  root: 'evidence/',
  total: evidenceImageFiles.length,
  assets: evidenceImageFiles.map(path => ({
    name: basename(path),
    path,
    group: path.split('/').slice(0, -1).join('/').replace(/^evidence\/?/, '') || 'root',
    type: extensionOf(path).slice(1),
    previewable: true
  }))
});

const componentShowcase = readText('showcase/components.html');
const componentReferenceRoot = resolve(root, 'examples/components-reference');
mkdirSync(componentReferenceRoot, { recursive: true });
for (const entry of readdirSync(componentReferenceRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) rmSync(resolve(componentReferenceRoot, entry.name));
}
writeText('examples/components-reference/reference.css', readText('showcase/components.css'));
writeText('examples/components-reference/reference.js', readText('showcase/components.js'));
writeText('examples/components-reference/interactions.js', readText('showcase/core-interactions.js'));
const writtenComponentReferences = new Set();
const componentExampleMigration = [];

const isolatedExamplePlans = {
  accordion: { title: 'Состояния', parts: [{ className: 'accordion' }] },
  avatar: { title: 'Размеры и типы', parts: [{ className: 'variant', occurrence: 0 }, { className: 'variant__row', occurrence: 1 }] },
  'booster-gradient-wrapper': { title: 'Градиентное кольцо', parts: [{ className: 'booster-gradient-wrapper' }] },
  'button-range': { title: 'Состояния', parts: [{ className: 'button-range' }] },
  calendar: { title: 'Календарь', parts: [{ className: 'calendar' }] },
  content: { title: 'Длинный текст', parts: [{ className: 'editor__content' }] },
  'date-picker': { title: 'Открытый выбор даты', parts: [{ className: 'date-picker' }] },
  dropdown: { title: 'Открытое меню', parts: [{ className: 'base-dropdown' }] },
  'dropdown-modal': { title: 'Закрытое состояние', parts: [{ className: 'base-button' }, { className: 'dropdown-modal-popper' }] },
  dropzone: { title: 'Зона загрузки', parts: [{ className: 'dropzone' }] },
  'file-upload': { title: 'Состояния файлов', parts: [{ className: 'file-upload' }] },
  'inline-separator': { title: 'Разделитель в строке', parts: [{ className: 'inline-separator', ancestorTag: 'p' }] },
  loader: { title: 'Загрузка', parts: [{ className: 'base-loader' }] },
  popover: { title: 'Открытое состояние', parts: [{ className: 'popover' }] },
  'pretty-scroll': { title: 'Прокручиваемый список', parts: [{ className: 'pretty-scroll__viewport' }] },
  row: { title: 'Состояния', parts: [{ className: 'base-row', occurrence: 0 }, { className: 'base-row', occurrence: 1 }, { className: 'base-row', occurrence: 2 }] },
  'text-length': { title: 'Счётчики', parts: [{ className: 'text-length', occurrence: 0 }, { className: 'text-length', occurrence: 3 }] },
  'time-picker': { title: 'Открытый выбор времени', parts: [{ className: 'time-picker' }] },
  tooltip: { title: 'Открытое состояние', parts: [{ className: 'popover' }] }
};

function isolatedComponentExample(source, title) {
  const plan = isolatedExamplePlans[source.id];
  if (!plan) return null;
  const anchor = source.anchor?.split('#')[1];
  if (!anchor) throw new Error(`Missing source anchor for isolated component ${source.id}`);
  const fragment = extractElementById(componentShowcase, anchor).replaceAll('../ui/', '../../ui/');
  const parts = plan.parts.map(part => part.ancestorTag
    ? extractAncestorByClass(fragment, part.className, part.ancestorTag, part.occurrence || 0)
    : extractElementByClass(fragment, part.className, part.occurrence || 0));
  const exampleFile = `examples/components-isolated/${source.id}.html`;
  writeText(exampleFile, `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="../../ui/career.css">
  <link rel="stylesheet" href="../components-reference/reference.css">
  <style>body{margin:0;padding:20px;background:#fff}.isolated-stage{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px}</style>
</head>
<body>
  <!-- Extracted from ${legacyPrefix}${source.anchor}; supporting wrapper belongs only to this preview. -->
  <div class="isolated-stage">${parts.join('\n')}</div>
</body>
</html>
`);
  return {
    id: 'isolated-example',
    title: plan.title,
    file: exampleFile,
    covers: [...new Set(['isolated-example', anchor, ...(source.states || [])])],
    preview: { mode: 'intrinsic' },
    provenance: { source: `${legacyPrefix}${source.anchor}`, extraction: 'exact-dom-subtree' }
  };
}

function componentReferenceExample(anchorSource, title) {
  const anchor = anchorSource?.split('#')[1];
  if (!anchor) return null;
  const exampleFile = `examples/components-reference/${fileSlug(anchor)}.html`;
  if (!writtenComponentReferences.has(anchor)) {
    const fragment = extractElementById(componentShowcase, anchor).replaceAll('../ui/', '../../ui/');
    writeText(exampleFile, `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="../../ui/career.css">
  <link rel="stylesheet" href="reference.css">
  <style>body{margin:0;padding:20px;background:#fff}.site-nav{display:none}</style>
</head>
<body>
${fragment}
</body>
</html>
`);
    writtenComponentReferences.add(anchor);
  }
  return {
    id: 'legacy-visual-reference',
    title: 'Визуальная ссылка из старой витрины',
    file: exampleFile,
    covers: ['visual-reference', anchor],
    preview: { mode: 'intrinsic' }
  };
}

const existingButton = JSON.parse(readFileSync(resolve(root, 'machine/components/button.json'), 'utf8'));
const sourceButton = sourceComponents.find(item => item.id === 'button');
const buttonMarkdown = readText(normalizePath(sourceButton.spec));
existingButton.legacySource = sourceButton;
existingButton.markup = sourceButton.markup;
existingButton.implementation.markup = 'markup.html';
existingButton.markdown = buttonMarkdown;
existingButton.sourcePath = `${legacyPrefix}${normalizePath(sourceButton.spec)}`;
const existingColors = JSON.parse(readFileSync(resolve(root, 'machine/foundations/colors.json'), 'utf8'));
const existingTypography = JSON.parse(readFileSync(resolve(root, 'machine/foundations/typography.json'), 'utf8'));

const addCatalog = (item, file, tags = []) => {
  catalog.push({
    id: item.id,
    title: item.title,
    kind: item.kind,
    category: item.category,
    file,
    ...(item.sourcePath ? { sourcePath: item.sourcePath } : {}),
    tags: [...new Set(tags.filter(Boolean))]
  });
};

addCatalog(existingColors, 'machine/foundations/colors.json', ['palette', 'tokens', 'gray', 'primary', 'link', 'status']);
addCatalog(existingTypography, 'machine/foundations/typography.json', ['font', 'Inter', 'display', 'body', 'text']);

const foundationDefaults = {
  maturity: { spec: 'complete', markup: 'available' },
  knowledge: { authority: ['production-css', 'normative'], confidence: 'high', scope: 'public-guest' },
  states: { ui: [], feature: [], domain: [] },
  accessibility: [],
  unknowns: [],
  rules: []
};

const previewWidths = [320, 480, 768, 1024];

const foundations = [
  {
    id: 'spacing',
    title: 'Интервалы',
    purpose: 'Шаг 4px без отдельной системы CSS-переменных.',
    values: { primary: [4, 8, 12, 16, 24], secondary: [2, 32, 48], localOnly: [6, 10, 20, 44] },
    guidance: '4 встречается чаще всего; 12 между карточками; 24 внутри карточки.',
    unknowns: ['Отдельных spacing tokens в Career нет.']
  },
  {
    id: 'radii',
    title: 'Радиусы',
    purpose: 'Небольшая шкала радиусов, реализованная utility-классами.',
    values: [
      { value: 8, use: 'кнопка M/SM, чип' },
      { value: 12, use: 'кнопка L/XL, поле' },
      { value: 24, use: 'карточка' },
      { value: 9999, use: 'круглые контролы и аватар человека', alias: 'full' }
    ],
    unknowns: ['Отдельных radius tokens в Career нет.']
  },
  {
    id: 'borders',
    title: 'Границы',
    purpose: 'Основной способ разделения светлых поверхностей Career.',
    values: [
      { value: '1px rgba(24,46,57,.1)', use: 'карточки и поверхности' },
      { value: '1px #d4dee2', use: 'контролы' },
      { value: '1px #ededed', use: 'плотная сетка' },
      { value: '2px', use: 'обводка поверх фона и focus, не граница поверхности' }
    ]
  },
  {
    id: 'shadows',
    title: 'Тени',
    purpose: 'Тени зарезервированы для всплывающих слоёв; обычные поверхности разделяются границей.',
    values: sourceTokens.shadow,
    tokenFiles: ['machine/tokens/shadow.json'],
    unknowns: ['CSS-классы теней являются именованной шкалой, но не :root tokens.']
  },
  {
    id: 'layout-responsive',
    title: 'Сетка и адаптив',
    purpose: 'Page-превью поддерживают ширины от 320px, перестраиваются на 768px и 1024px и растут до потолка контейнера 1100px.',
    container: { maxWidth: 1100, padding: '0 12px' },
    breakpoints: [
      { value: 320, role: 'minimum-supported-width', names: ['mobile'] },
      { value: 768, role: 'mobile-to-tablet', names: ['tablet'] },
      { value: 1024, role: 'tablet-to-desktop', names: ['desktop'] }
    ],
    previewWidths: [...previewWidths, 'auto'],
    fluidRanges: [[320, 767], [768, 1023], [1024, 1100]],
    nonBreakpoints: [480, 1100],
    componentUtilityBreakpoints: [480, 768, 1024],
    rules: sourceRules.filter(rule => /^SH-|^R-/.test(rule.id)).map(rule => `machine/rules/${fileSlug(rule.id)}.json`)
  },
  {
    id: 'icons',
    title: 'Иконки',
    purpose: 'Локальная библиотека: 146 символов в 5 спрайтах, 127 отдельных файлов и pack из 21 иконки.',
    baseSize: { width: 24, height: 24 },
    behavior: 'Цвет наследуется от текста.',
    assets: 'ui/assets/icons/',
    inventoryFile: iconInventoryFile,
    unknowns: ['Инвентарь описывает доступность ассетов, но не назначение каждого символа.']
  }
].map(source => ({
  ...foundationDefaults,
  ...source,
  kind: 'foundation',
  category: 'foundations',
  implementation: { markup: 'standalone-example', cssRoots: [], styles: ['ui/career.css'], scripts: [] },
  examples: [{
    id: source.id,
    title: source.title,
    file: `examples/foundations/${source.id}.html`,
    covers: [source.id],
    preview: { mode: 'intrinsic' }
  }],
  evidence: [{ type: 'guide', ref: `${legacyPrefix}docs/guide/design.md` }, { type: 'production-css', ref: `${legacyPrefix}ui/` }]
}));

for (const item of foundations) {
  const file = `machine/foundations/${item.id}.json`;
  write(file, item);
  addCatalog(item, file, [item.id, item.title, 'foundation']);
}

for (const [name, tokens] of Object.entries(sourceTokens)) {
  if (name === 'color') continue;
  write(`machine/tokens/${name}.json`, {
    id: `tokens-${name}`,
    kind: 'token-group',
    source: `${legacyPrefix}machine/tokens.json#/${name}`,
    tokens
  });
}

for (const source of sourceComponents) {
  if (source.id === 'button') {
    write('machine/components/button.json', existingButton);
    addCatalog(existingButton, 'machine/components/button.json', ['action', 'form', sourceButton.anchor?.split('#')[1], ...sourceButton.states]);
    componentExampleMigration.push({
      component: source.id,
      source: `${legacyPrefix}${source.anchor}`,
      disposition: 'deduplicated-to-canonical-examples',
      examples: existingButton.examples.map(example => example.id)
    });
    continue;
  }
  const specPath = source.spec.replaceAll('\\', '/');
  const markdown = readText(specPath);
  const sections = parseSections(markdown);
  const purpose = firstParagraph(sections.find(section => section.title === 'Назначение')) || `${source.name} — сущность UI kit Career.`;
  const limitations = bullets(sections.find(section => section.title === 'Ограничения'));
  const documentedMarkup = extractHtml(markdown);
  const effectiveMarkup = source.markup?.html || documentedMarkup;
  const hasMarkup = Boolean(effectiveMarkup);
  const isolatedExample = hasMarkup ? null : isolatedComponentExample(source, source.name);
  const file = `machine/components/${source.id}.json`;
  const item = {
    ...source,
    legacySource: source,
    title: source.name,
    maturity: { spec: source.status === 'complete' ? 'complete' : 'partial', markup: hasMarkup ? 'available' : 'missing' },
    knowledge: {
      authority: [...new Set((source.evidence || []).map(entry => entry.type).concat('extracted-package'))],
      confidence: source.status === 'complete' ? 'high' : 'medium',
      scope: 'public-and-storybook'
    },
    purpose,
    markup: effectiveMarkup ? { ...(source.markup || {}), html: effectiveMarkup } : source.markup,
    implementation: {
      markup: hasMarkup ? 'markup.html' : null,
      cssRoots: source.cssRoots,
      styles: ['ui/career.css'],
      scripts: [],
      code: source.code,
      ...(hasMarkup ? {} : {
        missingReason: 'copy-safe-markup-not-captured',
        fallback: 'Не придумывать классы. Использовать ближайший компонент с разметкой или явно отметить пробел.'
      })
    },
    stateGroups: { ui: source.states, feature: [], domain: [] },
    examples: [...(hasMarkup ? [{
      id: 'specimen',
      title: 'Разметка',
      file: 'viewer/specimen.html',
      query: `spec=${encodeURIComponent(file)}`,
      covers: source.states,
      preview: { mode: 'intrinsic' }
    }] : []), ...(isolatedExample ? [isolatedExample] : [])],
    accessibility: [],
    unknowns: limitations,
    markdown,
    sourcePath: `${legacyPrefix}${specPath}`,
    legacyDocument: `${legacyPrefix}${specPath}`
  };
  write(file, item);
  componentExampleMigration.push({
    component: source.id,
    source: `${legacyPrefix}${source.anchor}`,
    disposition: hasMarkup
      ? 'deduplicated-to-canonical-example'
      : isolatedExample ? 'isolated-exact-dom' : 'nonvisual-behavior-no-preview',
    examples: item.examples.map(example => example.id),
    ...(isolatedExample ? { target: isolatedExample.file } : {}),
    ...(!hasMarkup && !isolatedExample ? { reason: 'Старый фрагмент показывает конечное состояние другого компонента, а не самостоятельный DOM этой сущности.' } : {})
  });
  addCatalog(item, file, [source.category, source.kind, source.anchor?.split('#')[1], ...source.states, ...source.cssRoots, ...(source.storybookNames || [])]);
}

write('machine/migration/component-examples.json', {
  schemaVersion: 1,
  sourceComponents: sourceComponents.length,
  policy: 'Одна запись каталога на компонент; общие legacy-фрагменты не публикуются как вкладки компонентов.',
  mappings: componentExampleMigration
});

const indexedComponentDocs = new Set(sourceComponents.map(source => normalizePath(source.spec)));
const additionalComponentDocs = allMarkdownFiles.filter(path =>
  path.startsWith('components/') &&
  path !== 'components/INDEX.md' &&
  path !== 'components/STATES.md' &&
  !indexedComponentDocs.has(path)
);

for (const specPath of additionalComponentDocs) {
  const markdown = readText(specPath);
  const sections = parseSections(markdown);
  const html = extractHtml(markdown);
  const id = fileSlug(basename(specPath, '.md'));
  const title = markdown.match(/^#\s+(.+)$/m)?.[1] || id;
  const category = specPath.split('/')[1];
  const purpose = firstParagraph(sections.find(section => section.title === 'Назначение')) || `Опубликованная спецификация ${title}.`;
  const limitations = bullets(sections.find(section => section.title === 'Ограничения'));
  const file = `machine/components/${id}.json`;
  const item = {
    id,
    title,
    kind: 'module',
    category,
    maturity: { spec: 'partial', markup: html ? 'available' : 'missing' },
    knowledge: { authority: ['published-spec', 'storybook-snapshot'], confidence: html ? 'medium' : 'low', scope: 'public-and-storybook' },
    purpose,
    implementation: {
      markup: html ? 'markup.html' : null,
      cssRoots: [],
      styles: ['ui/career.css'],
      scripts: [],
      ...(!html ? { missingReason: 'copy-safe-markup-not-captured', fallback: 'Не додумывать DOM; использовать ближайший подтверждённый модуль.' } : {})
    },
    markup: html ? { html } : null,
    stateGroups: { ui: [], feature: [], domain: [] },
    examples: html ? [{
      id: 'specimen',
      title: 'Разметка из спецификации',
      file: 'viewer/specimen.html',
      query: `spec=${encodeURIComponent(file)}`,
      covers: ['published-markup'],
      preview: { mode: 'viewport', widths: previewWidths, height: 560 }
    }] : [],
    accessibility: [],
    unknowns: limitations,
    evidence: [{ type: 'published-spec', ref: `${legacyPrefix}${specPath}` }],
    markdown,
    sourcePath: `${legacyPrefix}${specPath}`,
    legacyDocument: `${legacyPrefix}${specPath}`,
    legacyUnindexed: true
  };
  write(file, item);
  addCatalog(item, file, [category, title, 'published-spec', html ? 'markup' : 'missing-markup']);
}

const showcaseSectionIds = [...componentShowcase.matchAll(/<section\b[^>]*\bid=["'](s-[^"']+)["']/gi)].map(match => match[1]);
for (const anchor of showcaseSectionIds) {
  const fragment = extractElementById(componentShowcase, anchor);
  const title = fragment.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i)?.[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || anchor;
  const reference = componentReferenceExample(`showcase/components.html#${anchor}`, title);
  const id = `showcase-${fileSlug(anchor.replace(/^s-/, ''))}`;
  const file = `machine/guides/${id}.json`;
  const item = {
    id,
    title: `${title} · архивная секция витрины`,
    kind: 'guide',
    category: 'showcase-reference',
    maturity: { spec: 'complete', markup: 'available' },
    knowledge: { authority: ['legacy-showcase'], confidence: 'high', scope: 'package' },
    purpose: `Физически вырезанная секция #${anchor} старой витрины; сохраняет её пояснения и визуальные состояния без загрузки монолита.`,
    implementation: { markup: reference.file, styles: ['ui/career.css', 'examples/components-reference/reference.css'], scripts: [] },
    stateGroups: { ui: [], feature: [], domain: [] },
    examples: [{ ...reference, id: 'showcase-section', title }],
    accessibility: [],
    evidence: [{ type: 'legacy-showcase', ref: `${legacyPrefix}showcase/components.html#${anchor}` }],
    unknowns: [],
    legacyAnchor: anchor
  };
  write(file, item);
  addCatalog(item, file, [anchor, title, 'showcase', 'visual-reference']);
}

for (const source of sourceRules) {
  const isDecision = source.kind === 'decision-guide';
  const file = `machine/${isDecision ? 'decisions' : 'rules'}/${fileSlug(source.id)}.json`;
  const confidence = (source.confidence || '').toLowerCase() || (/16\/16/.test(JSON.stringify(source.evidence)) ? 'high' : 'medium');
  const item = {
    ...source,
    title: isDecision ? `${source.id} · ${source.name}` : `${source.id} · ${source.scope}`,
    category: isDecision ? 'decision-guides' : slug(source.scope),
    maturity: { spec: 'complete', markup: 'missing' },
    knowledge: { authority: [isDecision ? 'decision-guide' : 'observed-rule'], confidence, scope: 'public-guest' },
    purpose: isDecision ? source.prefer : source.statement,
    implementation: {
      markup: null,
      styles: [],
      scripts: [],
      missingReason: 'not-a-visual-entity',
      fallback: 'Применить правило к выбранному паттерну или компоненту.'
    },
    stateGroups: { ui: [], feature: [], domain: [] },
    examples: [],
    accessibility: [],
    evidence: source.evidence || [{ type: 'decision-guide', ref: source.humanDoc }],
    unknowns: isDecision && source.gap ? [source.gap] : [],
    previewMode: 'none'
  };
  write(file, item);
  addCatalog(item, file, [source.id, source.scope, source.name, isDecision ? 'decision' : 'rule']);
}

const pageShowcase = readText('showcase/pages.html');
writeText('examples/patterns/patterns.css', readText('showcase/pages.css'));
writeText('examples/patterns/patterns.js', readText('showcase/pages.js'));

function extractElementById(html, id) {
  const escapedId = id.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idMatch = new RegExp(`\\bid=["']${escapedId}["']`).exec(html);
  if (!idMatch) throw new Error(`Missing pattern element #${id}`);
  const start = html.lastIndexOf('<', idMatch.index);
  return extractElementAt(html, start);
}

function extractElementAt(html, start) {
  const opening = html.slice(start).match(/^<([a-z][a-z0-9-]*)\b/i);
  if (!opening) throw new Error(`Cannot identify tag at offset ${start}`);
  const tag = opening[1];
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tags.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tags.exec(html))) {
    const closing = match[0].startsWith('</');
    const selfClosing = /\/>$/.test(match[0]);
    if (closing) depth -= 1;
    else if (!selfClosing) depth += 1;
    if (depth === 0) return html.slice(start, tags.lastIndex);
  }
  throw new Error(`Unclosed ${tag} element at offset ${start}`);
}

function classElementStarts(html, className) {
  return [...html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\bclass=["']([^"']*)["'][^>]*>/gi)]
    .filter(match => match[2].split(/\s+/).includes(className))
    .map(match => match.index);
}

function extractClassElements(html, className) {
  const elements = classElementStarts(html, className).map(start => ({ start, html: extractElementAt(html, start) }));
  const cleaned = [...elements].reverse().reduce((result, element) =>
    `${result.slice(0, element.start)}${result.slice(element.start + element.html.length)}`, html);
  return { html: cleaned.replaceAll(/^[\t ]+$/gm, ''), elements: elements.map(element => element.html) };
}

function htmlToPlainText(html) {
  return html
    .replaceAll(/<br\s*\/?>/gi, ' ')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function previewNoteType(text) {
  if (/^ДОПУЩЕНИЕ(?:[.:\s]|$)/i.test(text)) return 'assumption';
  if (/^Осторожно(?:[.:\s]|$)|не удалось|не подтвержден/i.test(text)) return 'coverage-warning';
  return 'guidance';
}

function extractElementByClass(html, className, occurrence = 0) {
  const start = classElementStarts(html, className)[occurrence];
  if (start === undefined) throw new Error(`Missing .${className} occurrence ${occurrence}`);
  return extractElementAt(html, start);
}

function extractAncestorByClass(html, className, tag, occurrence = 0) {
  const childStart = classElementStarts(html, className)[occurrence];
  if (childStart === undefined) throw new Error(`Missing .${className} occurrence ${occurrence}`);
  const candidates = [...html.slice(0, childStart).matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))];
  for (const candidate of candidates.reverse()) {
    const element = extractElementAt(html, candidate.index);
    if (candidate.index + element.length > childStart) return element;
  }
  throw new Error(`Missing <${tag}> ancestor for .${className}`);
}

for (const source of sourcePatterns) {
  const file = `machine/patterns/${source.id}.json`;
  const anchor = source.example.showcase.split('#')[1];
  const extractedFragment = extractClassElements(extractElementById(pageShowcase, anchor), 'note');
  const fragment = extractedFragment.html.replaceAll('../ui/', '../../ui/');
  const previewNotes = extractedFragment.elements.map(note => {
    const text = htmlToPlainText(note);
    return { type: previewNoteType(text), text };
  });
  const exampleFile = `examples/patterns/${source.id}.html`;
  writeText(exampleFile, `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${source.name}</title>
  <link rel="stylesheet" href="../../ui/career.css">
  <link rel="stylesheet" href="patterns.css">
  <link rel="stylesheet" href="page-preview.css">
  <style>
    body{min-width:0;background:#fff}
    .pattern{margin:0;padding:0}
    .pattern__head,.rules,.vp-bar{display:none!important}
    .viewport{height:auto!important;overflow:visible!important;border:0!important;background:transparent!important}
    .viewport__inner{width:auto!important;transform:none!important}
  </style>
</head>
<body>
${fragment}
<script src="patterns.js"></script>
</body>
</html>
`);
  const item = {
    ...source,
    title: source.name,
    kind: 'pattern',
    category: 'page-families',
    maturity: { spec: source.areas === null ? 'partial' : 'complete', markup: 'available' },
    knowledge: { authority: ['production-showcase', 'observed-rules'], confidence: source.id === 'dashboard' ? 'low' : 'high', scope: 'public-guest' },
    purpose: source.summary,
    previewNotes,
    implementation: { markup: exampleFile, cssRoots: [], styles: ['ui/career.css', 'examples/patterns/page-preview.css'], scripts: ['examples/patterns/patterns.js'] },
    stateGroups: { ui: [], feature: source.id.includes('empty') ? ['no-results'] : ['success'], domain: [] },
    ruleFiles: source.rules.map(id => `machine/${id.startsWith('DG-') ? 'decisions' : 'rules'}/${fileSlug(id)}.json`),
    examples: [{
      id: 'page',
      title: source.name,
      file: exampleFile,
      covers: [source.id],
      preview: { mode: 'viewport', widths: previewWidths, height: 720 }
    }],
    accessibility: [],
    evidence: [{ type: 'showcase', ref: source.example.showcase }, { type: 'rules', ref: source.rules }],
    unknowns: source.areas === null ? ['Последовательность areas пока не извлечена из ad-hoc showcase composition.'] : []
  };
  write(file, item);
  addCatalog(item, file, [source.id, source.name, 'page', 'responsive', ...source.rules]);
}

const pageAboutFragment = `<section id="about">
  <div class="callout">
    <h3>Как читать адаптив страниц</h3>
    <ul>
      <li><b>Брейкпоинты page-превью: 320 / 768 / 1024.</b> 320 — минимальная поддерживаемая ширина, 768 — переход mobile/tablet, 1024 — tablet/desktop.</li>
      <li><code>480</code> остаётся контрольной кнопкой viewer внутри мобильного диапазона. Это проверка резины, а не отдельный брейкпоинт.</li>
      <li>Между брейкпоинтами ширина и свободное место меняются непрерывно; отдельная фиксированная композиция для каждого пресета не создаётся.</li>
      <li><code>1100</code> — потолок контейнера, а не брейкпоинт. После него контент не растёт: увеличиваются только поля фоновой поверхности.</li>
      <li>Горизонтальный скролл допустим внутри специально прокручиваемой навигации, но не у документа страницы целиком.</li>
    </ul>
  </div>
  <div class="callout callout--warn">
    <h3>Техническое отличие preview</h3>
    <p>Адаптив page-примеров использует <code>@container</code>, чтобы реагировать на ширину iframe. В продукте те же переходы могут быть реализованы через <code>@media</code>.</p>
  </div>
</section>`;

const pageSupplementIds = ['about', 'rules', 'gaps'];
for (const anchor of pageSupplementIds) {
  const fragment = (anchor === 'about' ? pageAboutFragment : extractElementById(pageShowcase, anchor)).replaceAll('../ui/', '../../ui/');
  const title = fragment.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i)?.[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || anchor;
  const exampleFile = `examples/patterns/${anchor}.html`;
  writeText(exampleFile, `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="../../ui/career.css"><link rel="stylesheet" href="patterns.css"><style>body{min-width:0;padding:0;background:#fff}</style></head>
<body>${fragment}<script src="patterns.js"></script></body></html>
`);
  const id = `showcase-pages-${anchor}`;
  const file = `machine/guides/${id}.json`;
  const item = {
    id,
    title: `${title} · примечания к страницам`,
    kind: 'guide',
    category: 'showcase-reference',
    maturity: { spec: 'complete', markup: 'available' },
    knowledge: { authority: ['legacy-showcase'], confidence: 'high', scope: 'package' },
    purpose: `Отдельная секция #${anchor} старой page-витрины.`,
    implementation: { markup: exampleFile, styles: ['ui/career.css', 'examples/patterns/patterns.css'], scripts: ['examples/patterns/patterns.js'] },
    stateGroups: { ui: [], feature: [], domain: [] },
    examples: [{ id: 'showcase-section', title, file: exampleFile, covers: [anchor], preview: { mode: 'viewport', widths: previewWidths, height: 700 } }],
    accessibility: [],
    evidence: [{ type: 'legacy-showcase', ref: `${legacyPrefix}showcase/pages.html#${anchor}` }],
    unknowns: [],
    legacyAnchor: anchor
  };
  write(file, item);
  addCatalog(item, file, [anchor, title, 'showcase', 'page-reference']);
}

const contentItem = {
  id: 'product-copy',
  title: 'Продуктовые тексты',
  kind: 'content',
  category: 'content',
  maturity: { spec: 'partial', markup: 'missing' },
  knowledge: { authority: ['observed-copy'], confidence: 'medium', scope: 'public-guest' },
  purpose: sourceContent.caveat,
  implementation: { markup: null, styles: [], scripts: [], missingReason: 'not-a-visual-entity', fallback: sourceContent.onUnknown },
  stateGroups: { ui: [], feature: [], domain: [] },
  examples: [],
  accessibility: [],
  evidence: [{ type: 'guide', ref: sourceContent.source }],
  unknowns: sourceContent.unknown,
  content: sourceContent,
  previewMode: 'none'
};
write('machine/content/product-copy.json', contentItem);
addCatalog(contentItem, 'machine/content/product-copy.json', ['copy', 'tone', 'labels', 'buttons', 'errors']);

const guideFiles = allMarkdownFiles.filter(path =>
  !indexedComponentDocs.has(path) && !additionalComponentDocs.includes(path)
);

const guideId = sourcePath => {
  if (sourcePath === 'components/STATES.md') return 'guide-states';
  if (sourcePath.startsWith('docs/')) return `guide-${fileSlug(basename(sourcePath, '.md'))}`;
  return `guide-${fileSlug(sourcePath.replace(/\.md$/, ''))}`;
};
const guideCategory = sourcePath => {
  if (sourcePath.startsWith('docs/development/')) return 'development';
  if (sourcePath.startsWith('docs/guide/')) return 'guide';
  if (sourcePath.startsWith('evidence/')) return 'evidence';
  if (sourcePath.startsWith('research/')) return 'research';
  if (sourcePath.startsWith('components/')) return 'registry';
  if (sourcePath.startsWith('tools/')) return 'tooling';
  if (sourcePath.startsWith('ui/assets/') || sourcePath.startsWith('showcase/assets/')) return 'assets';
  return 'repository';
};

for (const sourcePath of guideFiles) {
  const archivedMarkdown = readText(sourcePath);
  const isCurrentRoadmap = sourcePath === 'ROADMAP.md';
  const markdown = isCurrentRoadmap ? readFileSync(resolve(root, 'ROADMAP.md'), 'utf8') : archivedMarkdown;
  const firstLine = markdown.match(/^#\s+(.+)$/m)?.[1] || basename(sourcePath, '.md');
  const id = guideId(sourcePath);
  const assetInventory = sourcePath === 'evidence/README.md'
    ? { file: evidenceAssetInventoryFile, title: 'Evidence screenshots' }
    : sourcePath === 'ui/assets/README.md'
      ? { file: uiAssetInventoryFile, title: 'UI assets' }
      : null;
  const examples = assetInventory ? [{
    id: 'asset-gallery',
    title: assetInventory.title,
    file: 'examples/assets/gallery.html',
    query: `inventory=${encodeURIComponent(assetInventory.file)}&title=${encodeURIComponent(assetInventory.title)}`,
    covers: ['asset-inventory'],
    preview: { mode: 'intrinsic' }
  }] : [];
  const item = {
    id,
    title: firstLine,
    kind: 'guide',
    category: guideCategory(sourcePath),
    maturity: { spec: 'complete', markup: 'missing' },
    knowledge: { authority: ['published-guide'], confidence: 'high', scope: 'package' },
    purpose: `Адресная машинная копия документа ${sourcePath}.`,
    implementation: { markup: null, styles: [], scripts: [], missingReason: 'document-only', fallback: 'Читайте sections выбранного документа.' },
    stateGroups: { ui: [], feature: [], domain: [] },
    examples,
    accessibility: [],
    evidence: [isCurrentRoadmap
      ? { type: 'current-document', ref: 'ROADMAP.md' }
      : { type: 'legacy-document', ref: `${legacyPrefix}${sourcePath}` }],
    unknowns: [],
    sourcePath: isCurrentRoadmap ? 'ROADMAP.md' : `${legacyPrefix}${sourcePath}`,
    markdown,
    ...(isCurrentRoadmap ? { legacyMarkdown: archivedMarkdown } : {}),
    previewMode: examples.length ? 'viewport' : 'none',
    ...(assetInventory ? { assetInventoryFile: assetInventory.file } : {})
  };
  const file = `machine/guides/${id.replace('guide-', '')}.json`;
  write(file, item);
  addCatalog(item, file, [firstLine, sourcePath, 'documentation']);
}

const sourceDataPaths = allOldFiles.filter(path => path.endsWith('.json'));
for (const sourcePath of sourceDataPaths) {
  const raw = readText(sourcePath);
  const data = JSON.parse(raw);
  const copiedFile = `source-data/${sourcePath}`;
  writeText(copiedFile, raw);
  const id = `data-${fileSlug(sourcePath.replace(/\.json$/, ''))}`;
  const title = data.title || data.slug || basename(sourcePath, '.json');
  const file = `machine/source-data/${id.replace('data-', '')}.json`;
  const item = {
    id,
    title: `${title} · исходные данные`,
    kind: 'guide',
    category: 'source-data',
    maturity: { spec: 'complete', markup: 'missing' },
    knowledge: { authority: ['archived-source-data'], confidence: 'high', scope: 'package' },
    purpose: `Точная копия ${sourcePath}; загружается только по запросу.`,
    implementation: { markup: null, styles: [], scripts: [], missingReason: 'data-only', fallback: 'Открыть исходные данные в разделе ниже.' },
    stateGroups: { ui: [], feature: [], domain: [] },
    examples: [],
    accessibility: [],
    evidence: [{ type: 'legacy-json', ref: `${legacyPrefix}${sourcePath}` }],
    unknowns: [],
    sourcePath: `${legacyPrefix}${sourcePath}`,
    sourceDataFile: copiedFile,
    previewMode: 'none'
  };
  write(file, item);
  addCatalog(item, file, [sourcePath, title, data.url, data.slug, 'json']);
}

const stateNames = ['default', 'hover', 'focus-visible', 'pressed', 'selected', 'current', 'checked', 'indeterminate', 'expanded', 'collapsed', 'open', 'closed', 'disabled', 'readOnly', 'loading', 'invalid', 'error', 'success', 'empty', 'dragActive'];
write('machine/states.json', {
  ui: stateNames,
  feature: ['idle', 'loading', 'empty-before-search', 'no-results', 'success', 'validation', 'error', 'retry', 'forbidden'],
  domain: ['archived', 'applied', 'unread', 'sent', 'rejected', 'expired', 'promoted', 'paymentFailed'],
  guides: ['machine/guides/feature-states.json', 'machine/guides/states.json'],
  note: 'Domain values are examples owned by modules, not a closed global enum.'
});

catalog.sort((a, b) => {
  const order = ['foundation', 'primitive', 'component', 'adapter', 'module', 'pattern', 'decision-guide', 'rule', 'content', 'guide'];
  return order.indexOf(a.kind) - order.indexOf(b.kind) || a.category.localeCompare(b.category, 'ru') || a.title.localeCompare(b.title, 'ru');
});

const searchableDocuments = catalog.map(entry => {
  const item = JSON.parse(readFileSync(resolve(root, entry.file), 'utf8'));
  const compactItem = { ...item };
  delete compactItem.markup;
  delete compactItem.legacySource;
  delete compactItem.markdown;
  delete compactItem.sections;
  delete compactItem.guideSections;
  return {
    id: entry.id,
    text: [entry.title, entry.category, ...(entry.tags || []), item.markdown || '', JSON.stringify(compactItem)].join(' ')
  };
});
write('viewer/search-index.json', searchableDocuments);

const markdownMappings = catalog.flatMap(entry => {
  const item = JSON.parse(readFileSync(resolve(root, entry.file), 'utf8'));
  if (!item.markdown) return [];
  if (item.sourcePath?.startsWith(legacyPrefix)) return [{ source: item.sourcePath.replace(legacyPrefix, ''), item: entry.id, file: entry.file }];
  if (item.sourcePath === 'ROADMAP.md') return [{ source: 'ROADMAP.md', item: entry.id, file: entry.file }];
  return [];
});
write('machine/migration-audit.json', {
  schemaVersion: 1,
  markdown: { source: allMarkdownFiles.length, mapped: markdownMappings.length, mappings: markdownMappings },
  json: { source: sourceDataPaths.length, copied: sourceDataPaths.length },
  assets: {
    uiImages: uiAssetFiles.length,
    evidenceImages: evidenceImageFiles.length,
    icons: iconAssets.length
  },
  components: { indexed: sourceComponents.length, additionalPublishedSpecs: additionalComponentDocs.length },
  componentExamples: {
    mappings: componentExampleMigration.length,
    deduplicated: componentExampleMigration.filter(item => item.disposition.startsWith('deduplicated')).length,
    isolated: componentExampleMigration.filter(item => item.disposition === 'isolated-exact-dom').length,
    nonvisual: componentExampleMigration.filter(item => item.disposition === 'nonvisual-behavior-no-preview').length,
    file: 'machine/migration/component-examples.json'
  },
  showcase: { componentSections: showcaseSectionIds.length, componentAnchors: writtenComponentReferences.size, pagePatterns: sourcePatterns.length, pageSupplementSections: pageSupplementIds.length },
  ruleAndDecisionRecords: sourceRules.length,
  patterns: sourcePatterns.length,
  tokenGroups: Object.keys(sourceTokens).length
});

const writeLeaf = (path, entries) => {
  write(path, entries);
  return { file: path, count: entries.length };
};
const categoryTitles = {
  actions: 'Кнопки и действия',
  forms: 'Поля и выбор',
  navigation: 'Навигация',
  collections: 'Метки и коллекции',
  'data-display': 'Отображение данных',
  feedback: 'Обратная связь и статусы',
  overlays: 'Оверлеи и модальные слои',
  layout: 'Базовая разметка',
  banners: 'Баннеры',
  cards: 'Карточки',
  'frame-modules': 'Каркас страницы',
  modules: 'Продуктовые модули',
  entities: 'Карточки сущностей',
  development: 'Разработка',
  evidence: 'Доказательства',
  guide: 'Основной гайд',
  registry: 'Реестры',
  repository: 'Репозиторий',
  research: 'Исследования',
  'showcase-reference': 'Архивные витрины',
  'source-data': 'Исходные JSON',
  assets: 'Ассеты',
  tooling: 'Инструменты'
};
const byCategory = entries => {
  const groups = entries.reduce((result, entry) => {
    (result[entry.category] ||= []).push(entry);
    return result;
  }, {});
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ru')).map(([category, items]) => ({
    id: category,
    title: categoryTitles[category] || category.replaceAll('-', ' '),
    ...writeLeaf(`machine/catalog/${category}.json`, items)
  }));
};
const componentKinds = new Set(['primitive', 'component', 'adapter', 'module']);
const foundationEntries = catalog.filter(entry => entry.kind === 'foundation');
const componentEntries = catalog.filter(entry => componentKinds.has(entry.kind));
const patternEntries = catalog.filter(entry => entry.kind === 'pattern');
const decisionEntries = catalog.filter(entry => entry.kind === 'decision-guide');
const ruleEntries = catalog.filter(entry => entry.kind === 'rule');
const contentEntries = catalog.filter(entry => entry.kind === 'content');
const guideEntries = catalog.filter(entry => entry.kind === 'guide');
const catalogIndex = {
  schemaVersion: 2,
  readOrder: 'Выбрать section, затем один file или один groups[].file. Не загружать остальные каталоги.',
  sections: [
    { id: 'foundations', title: 'Основы', ...writeLeaf('machine/catalog/foundations.json', foundationEntries) },
    { id: 'components', title: 'Компоненты', count: componentEntries.length, groups: byCategory(componentEntries) },
    { id: 'patterns', title: 'Паттерны', ...writeLeaf('machine/catalog/patterns.json', patternEntries) },
    { id: 'decisions', title: 'Decision Guides', ...writeLeaf('machine/catalog/decisions.json', decisionEntries) },
    { id: 'rules', title: 'Правила', count: ruleEntries.length, groups: byCategory(ruleEntries) },
    { id: 'content', title: 'Контент', ...writeLeaf('machine/catalog/content.json', contentEntries) },
    { id: 'guides', title: 'Документы', count: guideEntries.length, groups: byCategory(guideEntries) }
  ]
};
write('machine/catalog.json', catalogIndex);

const countedKinds = ['foundation', 'primitive', 'component', 'adapter', 'module', 'pattern', 'decision-guide', 'rule', 'content', 'guide'];
const counts = Object.fromEntries(countedKinds.map(kind => [`${kind}s`, catalog.filter(entry => entry.kind === kind).length]));
const examples = catalog.reduce((sum, entry) => {
  const item = JSON.parse(readFileSync(resolve(root, entry.file), 'utf8'));
  return sum + (item.examples?.length || 0);
}, 0);
write('machine/index.json', {
  schemaVersion: 3,
  product: { id: 'career', title: 'Хабр Карьера', guideVersion: '1.2', status: 'active' },
  readOrder: ['machine/catalog.json', 'один section.file или groups[].file', 'только выбранный item.file', 'ruleFiles, groups, implementation и examples — только при необходимости'],
  files: {
    catalog: 'machine/catalog.json',
    states: 'machine/states.json',
    schema: 'schema.json',
    roadmap: 'ROADMAP.md',
    audit: 'machine/migration-audit.json',
    componentExamples: 'machine/migration/component-examples.json'
  },
  coverage: {
    boundary: 'Полный перенос опубликованного Career v1.2; evidence ограничен публичным гостевым срезом.',
    known: ['foundations', 'components', 'page-families', 'composition-rules', 'decision-guides', 'feature-states', 'content'],
    unknown: ['личный кабинет', 'живые формы ввода', 'модальные потоки', 'ошибки форм', 'авторизованные сценарии'],
    onUnknown: { action: 'use-nearest-known-pattern-and-disclose-assumption', doc: 'machine/guides/coverage.json' }
  },
  provenance: {
    legacyPrefix,
    archivePublished: false,
    note: 'Legacy locators document migration origin; all consumable knowledge is copied into this package.'
  },
  checks: ['npm run validate', 'npm run validate:viewer'],
  metrics: {
    catalogItems: catalog.length,
    ...counts,
    sourceComponents: sourceComponents.length,
    sourceRules: sourceRules.filter(item => item.kind === 'rule').length,
    sourceDecisionGuides: sourceRules.filter(item => item.kind === 'decision-guide').length,
    sourcePatterns: sourcePatterns.length,
    sourceMarkdownDocuments: allMarkdownFiles.length,
    additionalPublishedSpecs: additionalComponentDocs.length,
    sourceJsonDocuments: sourceDataPaths.length,
    uiImageAssets: uiAssetFiles.length,
    evidenceImageAssets: evidenceImageFiles.length,
    showcaseSections: showcaseSectionIds.length,
    componentReferenceFragments: writtenComponentReferences.size,
    pageSupplementSections: pageSupplementIds.length,
    variables: Object.values(sourceTokens).reduce((sum, group) => sum + Object.keys(group).length, 0),
    colorTokens: Object.keys(sourceTokens.color).length,
    typeStyles: existingTypography.typeScale.length,
    examples
  },
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'tools/migrate-all.mjs'
});

console.log(`Migrated ${catalog.length} catalog items: ${sourceComponents.length} components, ${sourceRules.length} rules/decisions, ${sourcePatterns.length} patterns`);
