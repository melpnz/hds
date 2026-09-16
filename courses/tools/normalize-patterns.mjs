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
  item.sequence = item.sequence.map((area, index) => ({
    ...area,
    id: definition.areas[index],
    ...(area.stub ? { stub: stubs[stubIndex++] } : {})
  }));
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
