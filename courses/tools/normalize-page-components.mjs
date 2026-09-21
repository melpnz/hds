import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesRoot = path.join(root, 'examples', 'pages');
const geometryClasses = new Set([
  'h-12', 'w-12',
  'h-[var(--avatar-size)]', 'w-[var(--avatar-size)]',
  '!h-[100px]', '!w-[100px]',
  'phone:!h-[70px]', 'phone:!w-[70px]',
  'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'phone:rounded-2xl',
  'object-cover', 'overflow-hidden',
]);

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] || '';
}

function normalizeEntityLogo(tag, pageId) {
  if (tag.includes('data-component="entity-logo"')) return tag;
  const source = attribute(tag, 'src');
  const classes = attribute(tag, 'class');
  const inlineSize = attribute(tag, 'style').match(/--avatar-size:(\d+)px/)?.[1];
  const authorCompanyRow = pageId === 'author'
    && source.endsWith('/content-placeholder.svg')
    && classes.split(/\s+/).every(value => ['h-12', 'w-12', 'rounded-xl'].includes(value));
  const companyAvatar = source.endsWith('/content-placeholder.svg')
    && inlineSize
    && !classes.includes('rounded-full');
  if (!authorCompanyRow && !companyAvatar) return tag;

  const featuredSchool = pageId === 'education-center' && classes.includes('!h-[100px]');
  const size = authorCompanyRow ? '48' : featuredSchool ? '100' : inlineSize;
  const normalizedClasses = classes
    .split(/\s+/)
    .filter(Boolean)
    .filter(value => !geometryClasses.has(value));
  normalizedClasses.unshift('crs-entity-logo');
  if (featuredSchool) normalizedClasses.splice(1, 0, 'crs-entity-logo--school-header');

  return tag
    .replace(source, '../../../ui/assets/images/avatar-default-company.svg')
    .replace(/\sstyle="--avatar-size:\d+px;"/, '')
    .replace(/class="[^"]*"/, `class="${normalizedClasses.join(' ')}"`)
    .replace(/>$/, ` data-component="entity-logo" data-size="${size}">`);
}

function normalizeUserAvatar(tag) {
  if (tag.includes('data-component="entity-logo"') || !tag.includes('rounded-full')) return tag;
  const source = attribute(tag, 'src');
  if (!source.endsWith('/content-placeholder.svg') && !source.endsWith('/user_avatar_2.svg')) return tag;
  return tag
    .replace(source, '../../../ui/assets/images/avatar-default-user.svg')
    .replace(/>$/, ' data-component="avatar">');
}

function normalizeStructuralComponents(source, pageId) {
  if (pageId === 'authors') {
    source = source
      .replace('src="../../../ui/assets/images/content-placeholder.svg" alt="" class="absolute inset-y-0 right-0 h-full max-h-full w-auto rounded-xl object-contain"', 'src="../../../ui/assets/images/experts/expert-achieve.svg" alt="" class="absolute inset-y-0 right-0 h-full max-h-full w-auto rounded-xl object-contain"')
      .replace('xlink:href="#"></use></svg></div><span class="text-small">Эксперты', 'xlink:href="../../../ui/assets/images/experts/experts.svg#hat"></use></svg></div><span class="text-small">Эксперты')
      .replace('xlink:href="#"></use></svg></div><span class="text-small">Принцип', 'xlink:href="../../../ui/assets/images/experts/experts.svg#person"></use></svg></div><span class="text-small">Принцип')
      .replace('xlink:href="#"></use></svg></div><span class="text-small">Надежность', 'xlink:href="../../../ui/assets/images/experts/experts.svg#check"></use></svg></div><span class="text-small">Надежность');
  }
  if (pageId === 'courses-listing') {
    source = source.replace('class="grid grid-cols-2 gap-4 phone:grid-cols-1 tablet-only:grid-cols-2"', 'class="crs-authors-block__editors grid grid-cols-2 gap-4 tablet:grid-cols-1"');
  }
  if (pageId !== 'education-center') return source;
  const schoolGrid = 'grid grid-cols-4 gap-4 phone:grid-cols-1 tablet-only:grid-cols-3 phone:[&amp;&gt;*:nth-child(n+5)]:hidden tablet-only:[&amp;&gt;*:nth-child(n+7)]:hidden';
  const withHeaderAction = source.replace(/<button class="(?!crs-entity-header__more)([^"]*)"> Подробнее <\/button>/, '<button class="crs-entity-header__more $1"> Подробнее </button>');
  return withHeaderAction.replace(`class="${schoolGrid}"`, `class="crs-card-grid crs-card-grid--school-courses ${schoolGrid}" data-component="card-grid" data-variant="school-courses"`);
}

function carouselCard(variant, index) {
  const componentId = variant === 'ad-slot' ? 'ad-slot' : variant;
  const target = path.join(root, 'examples', 'components', componentId, 'index.html');
  const html = fs.readFileSync(target, 'utf8');
  const content = html.match(/<div class="example-root">([\s\S]*)<\/div>\s*(?:<script[\s\S]*?<\/script>\s*)?<\/body>/)?.[1];
  if (!content) throw new Error(`Cannot extract ${componentId} example for Carousel`);
  const variants = {
    'course-card': [
      ['1C-программист: расширенный курс', 'Python-разработчик: расширенный курс', 'Инженер по тестированию', 'Аналитик данных', 'Веб-дизайнер'],
      ['Нетология', 'Яндекс Практикум', 'Skillbox', 'Бруноям', 'Contented'],
    ],
    'article-card': [
      ['Сколько зарабатывают разработчики в 2026&nbsp;году и куда пойти учиться', 'Как выбрать онлайн-курс и не ошибиться', 'Какие профессии востребованы в аналитике', 'Путь в дизайн: навыки и портфолио', 'Как начать карьеру в IT'],
    ],
    'review-card': [
      ['Кристина Савельева', 'Александр Цупко', 'Елизавета', 'Юрий Лифанов', 'Даниил Апухтин'],
      ['Профессия авитолог: специалист по рекламе и продажам на Авито', 'Python-разработчик: расширенный курс', 'Интегративная нутриология', 'Продвинутый Go-разработчик', 'Поколение Python: курс для начинающих'],
    ],
  };
  let localized = content;
  if (variant === 'course-card') {
    localized = localized
      .replace('1C-программист: расширенный курс', variants[variant][0][index])
      .replace(/Нетология/g, variants[variant][1][index]);
  } else if (variant === 'article-card') {
    localized = localized.replace('Сколько зарабатывают разработчики в 2026&nbsp;году и куда пойти учиться', variants[variant][0][index]);
  } else if (variant === 'review-card') {
    localized = localized
      .replace('Кристина Савельева', variants[variant][0][index])
      .replace('Профессия авитолог: специалист по рекламе и продажам на Авито', variants[variant][1][index]);
  }
  const unique = localized.replace(/id="([^"]+)"/g, (_, id) => `id="${id}-carousel-${index + 1}"`);
  return `<article class="crs-carousel__slide" data-component="${componentId}">${unique}</article>`;
}

function carouselMarkup(label, { includeTitle = false } = {}) {
  const variants = {
    'Carousel · AdSlot': 'ad-slot',
    'Carousel · CourseCard': 'course-card',
    'Carousel · ArticleCard': 'article-card',
    'Carousel · ReviewCard': 'review-card',
  };
  const variant = variants[label];
  const head = includeTitle ? `<div class="crs-carousel__head"><h2 class="crs-carousel__title">${label}</h2></div>` : '';
  const controls = `<div class="crs-carousel__controls"><button class="crs-icon-button crs-icon-button--prev crs-carousel__control crs-carousel__control--prev" type="button" aria-label="Назад"><svg><use xlink:href="../../../ui/assets/icons/sprite.svg#arrow-down-figma"></use></svg></button><button class="crs-icon-button crs-icon-button--next crs-carousel__control crs-carousel__control--next" type="button" aria-label="Вперёд"><svg><use xlink:href="../../../ui/assets/icons/sprite.svg#arrow-down-figma"></use></svg></button></div>`;
  if (variant === 'ad-slot') {
    const adSlot = carouselCard(variant, 0).replace(/^<article class="crs-carousel__slide" data-component="ad-slot">|<\/article>$/g, '');
    return `<section class="crs-carousel" data-component="carousel" data-variant="${variant}" data-generated="component-reuse">${head}<div class="crs-carousel__body">${adSlot}${controls}</div></section>`;
  }
  const slides = Array.from({ length: 5 }, (_, index) => carouselCard(variant, index)).join('');
  return `<section class="crs-carousel" data-component="carousel" data-variant="${variant}" data-generated="component-reuse">${head}<div class="crs-carousel__body"><div class="crs-carousel__track">${slides}</div>${controls}</div></section>`;
}

function carouselRuntime() {
  return '<script src="../../carousel.js"><\/script>';
}

function refreshGeneratedCarousels(source) {
  const labels = { 'ad-slot': 'Carousel · AdSlot', 'course-card': 'Carousel · CourseCard', 'article-card': 'Carousel · ArticleCard', 'review-card': 'Carousel · ReviewCard' };
  let cursor = 0;
  while (cursor < source.length) {
    const tail = source.slice(cursor);
    const match = tail.match(/<section class="crs-carousel" data-component="carousel" data-variant="(ad-slot|course-card|article-card|review-card)" data-generated="component-reuse">/);
    if (!match) break;
    const start = cursor + match.index;
    const tags = /<\/?section\b[^>]*>/g;
    tags.lastIndex = start;
    let depth = 0;
    let end = -1;
    for (let tag = tags.exec(source); tag; tag = tags.exec(source)) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth === 0) { end = tags.lastIndex; break; }
    }
    if (end < 0) break;
    const replacement = carouselMarkup(labels[match[1]]);
    source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
    cursor = start + replacement.length;
  }
  return source;
}

function normalizeCarouselStubs(source) {
  const labels = {
    coursecard: 'Carousel · CourseCard',
    articlecard: 'Carousel · ArticleCard',
    reviewcard: 'Carousel · ReviewCard',
  };
  let withCarousels = source.replace(/<div class="doc-page-stub[^>]*"[^>]*>[\s\S]*?<span class="doc-page-stub__name">(Carousel · (?:AdSlot|CourseCard|ArticleCard|ReviewCard))<\/span>[\s\S]*?<\/div>/g, (_, label) => carouselMarkup(label));
  withCarousels = withCarousels.replace(/<section class="crs-carousel" data-component="carousel" data-variant="(coursecard|articlecard|reviewcard)">[\s\S]*?<\/section>/g, (_, variant) => carouselMarkup(labels[variant]));
  const canonicalLabels = { 'ad-slot': 'Carousel · AdSlot', 'course-card': 'Carousel · CourseCard', 'article-card': 'Carousel · ArticleCard', 'review-card': 'Carousel · ReviewCard' };
  withCarousels = withCarousels.replace(/<section class="crs-carousel" data-component="carousel" data-variant="(ad-slot|course-card|article-card|review-card)">[\s\S]*?<\/section>/g, (_, variant) => carouselMarkup(canonicalLabels[variant]));
  withCarousels = refreshGeneratedCarousels(withCarousels);
  if (!withCarousels.includes('data-component="carousel"') || withCarousels.includes('../../carousel.js')) return withCarousels;
  const runtime = carouselRuntime();
  return withCarousels.replace('</body>', `${runtime}</body>`);
}

let changedPages = 0;
let entityLogos = 0;
for (const pageId of fs.readdirSync(pagesRoot)) {
  const target = path.join(pagesRoot, pageId, 'index.html');
  if (!fs.existsSync(target)) continue;
  const before = fs.readFileSync(target, 'utf8');
  const withLogos = before.replace(/<img\b[^>]*>/g, tag => normalizeUserAvatar(normalizeEntityLogo(tag, pageId)));
  const after = normalizeCarouselStubs(normalizeStructuralComponents(withLogos, pageId));
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    changedPages += 1;
  }
  entityLogos += [...after.matchAll(/data-component="entity-logo"/g)].length;
}

function normalizeReviewCardExample(source) {
  let normalized = source
    .replace(/src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/user_avatar_2\.svg"/, 'src="../../../ui/assets/images/avatar-default-user.svg"')
    .replace(/ data-component="avatar"(?: data-component="avatar")+/g, ' data-component="avatar"')
    .replace(/<img src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/content-placeholder\.svg" alt="" class="[^"]*" style="--avatar-size: 24px;">/, '<img src="../../../ui/assets/images/avatar-default-company.svg" alt="" class="crs-entity-logo" data-component="entity-logo" data-size="24">')
    .replace('class="absolute bottom-0 left-0 m-0 inline w-full', 'class="crs-review-card__more absolute bottom-0 left-0 m-0 inline w-full');
  normalized = normalized.replace(/<img src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/avatar-default-user\.svg"[^>]*>/, tag => tag.includes('data-component="avatar"') ? tag : tag.replace(/>$/, ' data-component="avatar">'));
  return normalized;
}

function normalizeCourseCardExample(source) {
  return source
    .replace('class="relative box-border flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-ui-black-100"', 'class="crs-course-card relative box-border flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-ui-black-100"')
    .replace('class="flex flex-wrap items-start gap-1 self-stretch text-micro"', 'class="crs-course-card__tags flex flex-wrap items-start gap-1 self-stretch text-micro"')
    .replace('>Git</div></div><!--]--><div class="flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1"> +9</div>', '>Git</div></div><div class="crs-course-card__tag--wide flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1 max-w-[calc(100%_-48px)]"><div class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">Microsoft Excel</div></div><!--]--><div class="crs-course-card__more crs-course-card__more--compact flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1"> +9</div><div class="crs-course-card__more crs-course-card__more--wide flex items-center gap-0.5 rounded-full bg-ui-black-50 px-2 py-1"> +8</div>');
}

function normalizeEntityHeaderExample(source) {
  return source.replace(/<button class="(?!crs-entity-header__more)([^"]*)"> Подробнее <\/button>/, '<button class="crs-entity-header__more $1"> Подробнее </button>');
}

const componentExamples = {
  'ad-slot': source => source.replace(/<style>[\s\S]*?<\/style>/, '<style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:24px}</style>'),
  'course-card': source => source
    .replace(/<style>[\s\S]*?<\/style>/, '<style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:24px}.example-root{width:100%}.example-root>div>img:first-child{height:auto;aspect-ratio:260/148}@media(min-width:768px){.example-root{max-width:260px}}</style>')
    .replace(/<img src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/content-placeholder\.svg" alt="Логотип Нетология" style="--avatar-size:32px;" class="[^"]*">/, '<img src="../../../ui/assets/images/avatar-default-company.svg" alt="Логотип Нетология" class="crs-entity-logo" data-component="entity-logo" data-size="32">'),
  'school-card': source => source
    .replace(/<style>[\s\S]*?<\/style>/, '<style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:24px}.example-root{width:100%}.example-root>div>div:first-child{height:auto;aspect-ratio:260/112}.example-root>div>div:first-child>img{height:100%}@media(min-width:768px){.example-root{max-width:260px}}</style>')
    .replace(/<img src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/content-placeholder\.svg" alt="" style="--avatar-size:40px;" class="[^"]*">/, '<img src="../../../ui/assets/images/avatar-default-company.svg" alt="" class="crs-entity-logo z-2 absolute -top-[20px] border-2 border-solid border-ui-white bg-ui-white" data-component="entity-logo" data-size="40">'),
  'person-card': source => source
    .replace(/<style>[\s\S]*?<\/style>/, '<style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:24px}.example-root{width:100%}@media(min-width:768px){.example-root{max-width:260px}}</style>')
    .replace(/src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/content-placeholder\.svg"(?=[^>]*--avatar-size:68px)/, 'src="../../../ui/assets/images/avatar-default-user.svg"')
    .replace(/<img src="\.\.\/\.\.\/\.\.\/ui\/assets\/images\/content-placeholder\.svg" alt="" style="--avatar-size:24px;" class="[^"]*">/, '<img src="../../../ui/assets/images/avatar-default-company.svg" alt="" class="crs-entity-logo" data-component="entity-logo" data-size="24">'),
  'review-card': normalizeReviewCardExample,
};

const normalizeCourseCardBase = componentExamples['course-card'];
componentExamples['course-card'] = source => normalizeCourseCardExample(normalizeCourseCardBase(source));
componentExamples['entity-header'] = normalizeEntityHeaderExample;

let changedComponentExamples = 0;
for (const [id, normalize] of Object.entries(componentExamples)) {
  const target = path.join(root, 'examples', 'components', id, 'index.html');
  const before = fs.readFileSync(target, 'utf8');
  const after = normalize(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    changedComponentExamples += 1;
  }
}

const carouselTarget = path.join(root, 'examples', 'components', 'carousel', 'index.html');
if (fs.existsSync(carouselTarget)) {
  const sections = [
    carouselMarkup('Carousel · AdSlot', { includeTitle: true }),
    carouselMarkup('Carousel · CourseCard', { includeTitle: true }),
    carouselMarkup('Carousel · ArticleCard', { includeTitle: true }),
    carouselMarkup('Carousel · ReviewCard', { includeTitle: true }),
  ].join('\n');
  const runtime = carouselRuntime();
  const standalone = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Carousel — Хабр Курсы</title><link rel="icon" href="data:,"><link rel="stylesheet" href="../../../ui/courses.css"><style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:24px}.example-root{display:grid;gap:40px;min-width:0}</style></head><body data-preview-layout="viewport"><div class="example-root">${sections}</div>${runtime}</body></html>`;
  fs.writeFileSync(carouselTarget, standalone, 'utf8');
}

console.log(`Normalized EntityLogo usage in ${changedPages} page examples (${entityLogos} instances) and ${changedComponentExamples} component examples.`);
