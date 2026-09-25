import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeStyleProfile } from './build-style-profile.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const definitions = {
  author: { title: 'Профиль автора', areas: ['profile-header', 'biography', 'expertise', 'qualifications', 'experience-education'] },
  authors: { title: 'Эксперты', areas: ['expert-process', 'experts-grid'] },
  'courses-listing': { title: 'Витрина курсов', areas: ['rubrication-navigation', 'advertising', 'course-grid', 'authors', 'separator', 'reviews', 'promocodes', 'popular-directions', 'top-courses', 'school-rating'] },
  'education-center': { title: 'Страница школы', areas: ['page-title', 'school-header', 'courses', 'ad-slot', 'success-stories', 'reviews', 'general-info'] },
  'education-centers-listing': { title: 'Витрина организаций', areas: ['advertising', 'school-grid', 'popular-courses', 'journal', 'city-links'] },
  rating: { title: 'Рейтинг школ', areas: ['school-rating', 'recommendations'] }
};

const entityLogoUsage = {
  author: { 'profile-header': 1, 'experience-education': 22 },
  authors: { 'experts-grid': 8 },
  'courses-listing': { 'course-grid': 8, reviews: 5, 'school-rating': 5 },
  'education-center': { 'school-header': 1, courses: 8, reviews: 5 },
  'education-centers-listing': { 'school-grid': 8, 'popular-courses': 5 },
  rating: { 'school-rating': 20, recommendations: 5 },
};

const component = (id, role, options = {}) => ({ kind: 'provider-component', id, role, ...options });
const native = (element, role, options = {}) => ({ kind: 'native', element, role, ...options });
const externalSlot = (id, role, options = {}) => ({ kind: 'external-slot', id, role, ...options });

const pageCompositions = {
  author: {
    shell: { header: component('site-header', 'global-header', { props: { family: 'simple' } }), footer: component('site-footer', 'global-footer') },
    areas: {
      'profile-header': [component('person-header', 'author-summary')],
      biography: [component('prose', 'biography')],
      expertise: [component('prose', 'expertise')],
      qualifications: [component('prose', 'qualifications')],
      'experience-education': [component('profile-history', 'experience-and-education')],
    },
  },
  authors: {
    shell: { header: component('site-header', 'global-header', { props: { family: 'simple' } }), footer: component('site-footer', 'global-footer') },
    areas: {
      'expert-process': [component('card-grid', 'process-grid', { children: [component('step-card', 'process-step', { count: 4 })] })],
      'experts-grid': [component('card-grid', 'experts-grid', { children: [component('person-card', 'expert-card', { count: 8 })] })],
    },
  },
  'courses-listing': {
    shell: { header: component('site-header', 'global-header', { props: { family: 'simple', sticky: true } }), footer: component('site-footer', 'global-footer') },
    areas: {
      'rubrication-navigation': [native('nav', 'course-rubrics', { children: [component('link', 'rubric-link', { count: 4 })], responsive: 'single-line-horizontal-scroll-edge-to-edge' })],
      advertising: [component('carousel', 'advertising-carousel', { variant: 'ad-slot', children: [component('ad-slot', 'advertising-slides')] })],
      'course-grid': [component('card-grid', 'courses-grid', { children: [component('course-card', 'course-card', { count: 8 })] })],
      authors: [component('authors-block', 'editorial-authors')],
      separator: [native('hr', 'content-separator')],
      reviews: [component('section', 'reviews-section', { children: [component('carousel', 'reviews-carousel', { variant: 'review-card', children: [component('review-card', 'review-card', { count: 5 })] })] })],
      promocodes: [component('link-grid', 'promocode-links')],
      'popular-directions': [component('link-grid', 'popular-direction-links')],
      'top-courses': [component('numbered-course-item', 'ranked-course', { count: 3 })],
      'school-rating': [component('section', 'school-rating-section', { children: [component('rating-table', 'school-rating') ] })],
    },
  },
  'education-center': {
    shell: { header: component('site-header', 'global-header', { props: { family: 'simple' } }), footer: component('site-footer', 'global-footer') },
    areas: {
      'page-title': [native('h1', 'document-title', { placement: 'visually-after-content' })],
      'school-header': [component('entity-header', 'school-summary')],
      courses: [component('section', 'courses-section', { children: [component('filter-bar', 'course-filters'), component('card-grid', 'school-courses-grid', { variant: 'school-courses', children: [component('course-card', 'course-card', { count: 8 })] })] })],
      'ad-slot': [externalSlot('adfox', 'reserved-advertising-space', { renderedContent: 'runtime-controlled', emptyHeightToken: '--courses-space-16' })],
      'success-stories': [component('section', 'success-stories-section', { children: [component('carousel', 'success-stories-carousel', { variant: 'article-card', children: [component('article-card', 'article-card', { count: 8 })] })] })],
      reviews: [component('section', 'reviews-section', { children: [component('carousel', 'reviews-carousel', { variant: 'review-card', children: [component('review-card', 'review-card', { count: 8 })] })] })],
      'general-info': [component('info-table', 'school-information')],
    },
  },
  'education-centers-listing': {
    shell: { header: component('site-header', 'global-header', { props: { family: 'simple' } }), footer: component('site-footer', 'global-footer') },
    areas: {
      advertising: [component('carousel', 'advertising-carousel', { variant: 'ad-slot', children: [component('ad-slot', 'advertising-slides')] })],
      'school-grid': [component('card-grid', 'schools-grid', { children: [component('school-card', 'school-card', { count: 8 })] })],
      'popular-courses': [component('section', 'popular-courses-section', { children: [component('filter-bar', 'course-filters'), component('carousel', 'popular-courses-carousel', { variant: 'course-card', children: [component('course-card', 'course-card', { count: 5 })] })] })],
      journal: [component('section', 'journal-section', { children: [component('carousel', 'journal-carousel', { variant: 'article-card', children: [component('article-card', 'article-card', { count: 5 })] })] })],
      'city-links': [component('link-grid', 'city-links', { count: 2 })],
    },
  },
  rating: {
    shell: { header: component('site-header', 'global-header', { props: { family: 'simple' } }), footer: component('site-footer', 'global-footer') },
    areas: {
      'school-rating': [component('rating-table', 'school-rating')],
      recommendations: [component('section', 'recommendations-section', { children: [component('carousel', 'recommended-courses-carousel', { variant: 'course-card', children: [component('course-card', 'course-card', { count: 5 })] })] })],
    },
  },
};

const providerMapping = JSON.parse(fs.readFileSync(path.join(root, 'machine', 'providers', 'courses-nuxt-kit.json'), 'utf8'));
const providerComponents = new Map(providerMapping.mappings.map(mapping => [mapping.guideId, mapping]));

function resolveCompositionNode(node, owner) {
  if (node.kind !== 'provider-component') {
    return {
      ...node,
      ...(node.children ? { children: node.children.map(child => resolveCompositionNode(child, owner)) } : {}),
    };
  }
  const mapping = providerComponents.get(node.id);
  if (!mapping || mapping.status !== 'direct' || mapping.visibility !== 'public') {
    throw new Error(`${owner}: ${node.id} is not a direct public provider component`);
  }
  return {
    ...node,
    providerComponentId: mapping.providerComponentId,
    exportName: mapping.exportName,
    ...(node.children ? { children: node.children.map(child => resolveCompositionNode(child, owner)) } : {}),
  };
}

function flattenProviderIds(nodes) {
  return nodes.flatMap(node => [
    ...(node.kind === 'provider-component' ? [node.id] : []),
    ...flattenProviderIds(node.children || []),
  ]);
}

const sharedLayoutContract = {
  shell: {
    root: 'app-container',
    content: 'app-content',
    behavior: 'sticky-footer',
  },
  container: {
    classes: 'mx-auto max-w-[1124px] px-6 py-0 tablet:px-6',
    maxWidth: { token: '--courses-size-1124', value: '70.25rem' },
    paddingInline: { token: '--courses-space-24', value: '1.5rem' },
    contentWidthAtMax: '67.25rem',
  },
  surfaces: {
    page: { token: '--color-white-background', value: '{color.ui-white}' },
    work: { token: '--color-ui-white', value: '#ffffff' },
    contentBlock: {
      background: { token: '--color-ui-white', value: '#ffffff' },
      border: { widthToken: '--courses-border-width-1', colorToken: '--color-ui-black-100' },
      radius: { token: '--courses-radius-24', value: '1.5rem' },
    },
  },
  breakpoints: {
    smallPhoneMax: 479,
    phoneMax: 767,
    tabletMax: 1023,
    desktopMin: 1024,
    previewWidths: [320, 480, 768, 1024],
  },
};

function pageStubs(id) {
  const html = fs.readFileSync(path.join(root, 'examples', 'pages', id, 'index.html'), 'utf8');
  const names = [...html.matchAll(/<span class="doc-page-stub__name">([\s\S]*?)<\/span>/g)].map(match => match[1].trim());
  const texts = [...html.matchAll(/<span class="doc-page-stub__text">([\s\S]*?)<\/span>/g)].map(match => match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  return names.map((name, index) => `${name} · ${texts[index]}`);
}

for (const [id, definition] of Object.entries(definitions)) {
  const target = path.join(root, 'machine', 'patterns', `${id}.json`);
  const item = JSON.parse(fs.readFileSync(target, 'utf8'));
  const stubs = pageStubs(id);
  let stubIndex = 0;
  item.title = definition.title;
  item.areas = definition.areas;
  item.components = [...new Set([...(item.components || []), 'entity-logo', ...(id === 'courses-listing' ? ['link'] : [])])];
  item.entityLogoUsage = entityLogoUsage[id];
  const composition = pageCompositions[id];
  const resolvedShell = Object.fromEntries(Object.entries(composition.shell).map(([slot, node]) => [slot, resolveCompositionNode(node, `${id}.shell.${slot}`)]));
  const resolvedAreas = definition.areas.map(areaId => ({
    id: areaId,
    nodes: composition.areas[areaId].map(node => resolveCompositionNode(node, `${id}.${areaId}`)),
  }));
  const directComponentIds = [...new Set([
    ...flattenProviderIds(Object.values(resolvedShell)),
    ...flattenProviderIds(resolvedAreas.flatMap(area => area.nodes)),
  ])];
  item.providerComposition = {
    schemaVersion: 1,
    provider: {
      id: providerMapping.provider.id,
      version: providerMapping.provider.version,
      mapping: 'machine/providers/courses-nuxt-kit.json',
    },
    ownership: {
      pagePattern: 'guide',
      componentImplementation: 'active-provider',
      staticExample: 'evidence-and-github-fallback',
    },
    shell: resolvedShell,
    areas: resolvedAreas,
    directComponentIds,
  };
  item.layout = {
    ...sharedLayoutContract,
    sectionStack: ['author', 'authors'].includes(id)
      ? {
          classes: 'flex flex-col gap-10',
          gap: { token: '--courses-space-40', value: '2.5rem' },
          exceptionToDefault: true,
        }
      : {
          classes: 'relative grid grid-cols-[minmax(0,1fr)] gap-12 px-0',
          columns: 'minmax(0,1fr)',
          gap: { token: '--courses-space-48', value: '3rem' },
          exceptionToDefault: false,
        },
  };
  if (id === 'education-center') {
    item.layout.courseGrid = {
      component: 'card-grid',
      variant: 'school-courses',
      columns: { desktop: 4, tablet: 3, phone: 1 },
      visibleCards: { desktop: 'all', tablet: 6, phone: 4 },
      gap: { token: '--courses-space-16', value: '1rem' },
    };
  }
  if (id === 'courses-listing') {
    item.layout.rubricationNavigation = {
      gap: { token: '--courses-space-16', value: '1rem', sameAtAllWidths: true },
      mobile: 'edge-to-edge-horizontal-scroll',
    };
  }
  const previousSequence = new Map(item.sequence.map(area => [area.id, area]));
  item.sequence = definition.areas.map(areaId => {
    const area = previousSequence.get(areaId) || {
      tag: areaId === 'rubrication-navigation' ? 'nav' : 'div',
      heading: null,
      modules: [],
      components: [],
    };
    const entityLogoCount = entityLogoUsage[id][areaId];
    const components = (area.components || []).filter(component => component.id !== 'entity-logo');
    if (areaId === 'rubrication-navigation' && !components.some(component => component.id === 'link')) components.push({ id: 'link', count: 4 });
    if (entityLogoCount) components.push({ id: 'entity-logo', count: entityLogoCount });
    return {
      ...area,
      id: areaId,
      components,
      ...(area.stub ? { stub: stubs[stubIndex++] } : {})
    };
  });
  item.unknowns = item.sequence.filter(area => area.stub).map(area => area.stub);
  const archiveRef = value => value && !value.startsWith('archive:') ? `archive:courses/v0.1/${value}` : value;
  if (item.source) {
    item.source.spec = `archive:courses/v0.1/pages/${id}.md`;
    item.source.standalone = archiveRef(item.source.standalone);
    item.source.showcase = archiveRef(item.source.showcase);
  }
  if (item.sequenceSource?.page) item.sequenceSource.page = archiveRef(item.sequenceSource.page);
  const placeholderText = 'Пользовательские изображения, логотипы и обложки в preview заменены нейтральными локальными заглушками; это ограничение примера, а не правило компонента.';
  if (!item.previewNotes?.some(note => note.text === placeholderText)) {
    item.previewNotes = [...(item.previewNotes || []), { type: 'coverage-warning', text: placeholderText }];
  }
  fs.writeFileSync(target, `${JSON.stringify(item, null, 2)}\n`, 'utf8');
}

function describeNode(node) {
  if (node.kind === 'provider-component') {
    const details = [node.variant && `variant=${node.variant}`, node.count && `×${node.count}`].filter(Boolean).join(', ');
    const children = (node.children || []).map(describeNode).join(' + ');
    return `\`${node.exportName}\`${details ? ` (${details})` : ''}${children ? ` → ${children}` : ''}`;
  }
  if (node.kind === 'external-slot') return `внешний слот \`${node.id}\` (не компонент kit)`;
  const children = (node.children || []).map(describeNode).join(' + ');
  return `нативный \`<${node.element}>\`${children ? ` → ${children}` : ''}`;
}

const reportRows = Object.keys(definitions).flatMap(id => {
  const pattern = JSON.parse(fs.readFileSync(path.join(root, 'machine', 'patterns', `${id}.json`), 'utf8'));
  return pattern.providerComposition.areas.map(area =>
    `| \`${id}\` | \`${area.id}\` | ${area.nodes.map(describeNode).join('<br>')} |`
  );
});
const report = `# Courses · композиция page-pattern через active provider

Отчёт генерируется \`tools/normalize-patterns.mjs\`. Page-pattern хранит порядок,
роль областей и поведение страницы; конкретную реализацию компонентов берём из
\`${providerMapping.provider.id}@${providerMapping.provider.version}\` через provider mapping.
Статические HTML-страницы сохраняются только как evidence и GitHub fallback.

Общая оболочка всех шести страниц: \`SiteHeader\` + \`SiteFooter\` активного
provider. Вложенные \`Avatar\` и \`EntityLogo\` принадлежат карточкам и другим
компонентам, поэтому не дублируются как прямые дети page-pattern.

| Pattern | Область | Прямая композиция |
|---|---|---|
${reportRows.join('\n')}
`;
fs.writeFileSync(path.join(root, 'machine', 'reports', 'page-pattern-composition.md'), report, 'utf8');

console.log(`Normalized ${Object.keys(definitions).length} page patterns.`);
writeStyleProfile();
