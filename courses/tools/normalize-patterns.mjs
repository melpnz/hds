import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeStyleProfile } from './build-style-profile.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const definitions = {
  author: { title: 'Профиль автора', areas: ['profile-header', 'biography', 'expertise', 'qualifications', 'experience-education'] },
  authors: { title: 'Эксперты', areas: ['expert-process', 'experts-grid'] },
  'courses-listing': { title: 'Витрина курсов', areas: ['advertising', 'course-grid', 'authors', 'separator', 'reviews', 'promocodes', 'popular-directions', 'top-courses', 'school-rating'] },
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
  item.components = [...new Set([...(item.components || []), 'entity-logo'])];
  item.entityLogoUsage = entityLogoUsage[id];
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
  item.sequence = item.sequence.map((area, index) => {
    const areaId = definition.areas[index];
    const entityLogoCount = entityLogoUsage[id][areaId];
    const components = (area.components || []).filter(component => component.id !== 'entity-logo');
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

console.log(`Normalized ${Object.keys(definitions).length} page patterns.`);
writeStyleProfile();
