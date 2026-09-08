/**
 * Разбор дампов `get_metadata` в таблицу «узел → член стопки → тип блока».
 *
 * Зачем. Правила L-1…L-16 задали рамку страницы, но порядок содержательных
 * блоков между hero и футером не выводился: имена секций у большинства узлов —
 * `Frame 123457234`, и смысла в них нет. Смысл лежит уровнем ниже: имена
 * текстовых узлов в Figma равны самому тексту. Скрипт спускается внутрь каждого
 * члена стопки, собирает наблюдаемые признаки — тексты, поля ввода, даты,
 * повторяющиеся карточки, ленты, вылезающие за ширину фрейма, — и по ним
 * ставит тип. Признак записывается рядом с типом: без него таблица
 * не проверяема.
 *
 * Дампы велики (14 … 198 КБ), читать их в контексте модели нельзя. Скрипт —
 * единственное, что их читает; наружу отдаётся сводка на 18 узлов.
 *
 * Запуск:
 *   node .pipeline/section-map/parse.mjs                   сводка + sections.json
 *   node .pipeline/section-map/parse.mjs --node 10929:505   одна стопка
 *   node .pipeline/section-map/parse.mjs --why              с признаками и текстами
 *   node .pipeline/section-map/parse.mjs --counts           покрытия дробью
 *   node .pipeline/section-map/parse.mjs --order            порядок: пары, доли, соседства
 *
 * Вход: `.pipeline/section-map/raw-*.xml` и `.pipeline/R0-00/raw-*.txt`.
 * Формат — построчный XML `get_metadata`: отступ в два пробела на уровень,
 * `<tag id name x y width height [hidden]>`. Дампы `get_design_context`
 * (JSX с `data-node-id`) разбираются вторым режимом: имя слоя в `data-name`,
 * текст — телом элемента, высота — из класса `h-[NNNpx]`.
 *
 * Выход: `.pipeline/section-map/sections.json`.
 *
 * Тип `?` означает, что признаков не хватило. Пустая клетка честнее
 * выдуманного типа, поэтому `?` не заполняется «ближайшим похожим»
 * и уходит в отчёт отдельным списком.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const args = process.argv.slice(2);
const only = args.includes('--node') ? args[args.indexOf('--node') + 1] : null;
const why = args.includes('--why');
const counts = args.includes('--counts');
const order = args.includes('--order');

// --------------------------------------------------------------------------
// 1. Чтение дампов
// --------------------------------------------------------------------------

const sources = [];
for (const dir of ['.pipeline/section-map', '.pipeline/R0-00']) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of fs.readdirSync(abs)) {
    if (!/^raw-.*\.(xml|txt)$/.test(file)) continue;
    sources.push(path.join(abs, file));
  }
}

const NUM = '([-\\d.e]+)';
const OPEN = new RegExp(
  `^(\\s*)<([a-z-]+) id="([^"]+)" name="([^"]*)"(?: x="${NUM}")?(?: y="${NUM}")?` +
  `(?: width="${NUM}")?(?: height="${NUM}")?(.*)$`,
);

/** Построчный XML `get_metadata` → дерево. Уровень задаётся отступом. */
function parseXmlDump(text) {
  const stack = [];
  let tree = null;
  for (const line of text.split('\n')) {
    const m = OPEN.exec(line);
    if (!m) continue;
    const [, indent, tag, id, name, x, y, w, h, tail] = m;
    const depth = indent.length / 2;
    const node = {
      tag,
      id,
      name,
      x: x === undefined ? null : Number(x),
      y: y === undefined ? null : Number(y),
      w: w === undefined ? null : Number(w),
      h: h === undefined ? null : Number(h),
      hidden: /hidden="true"/.test(tail),
      children: [],
    };
    stack.length = depth;
    if (depth === 0) tree = node;
    else stack[depth - 1]?.children.push(node);
    stack[depth] = node;
  }
  return tree;
}

const JSX_OPEN = /^(\s*)<(\w+)\b([^>]*)>?/;

/**
 * Дамп `get_design_context` (JSX). Узел — элемент с `data-node-id`;
 * имя слоя — `data-name`, текст — тело элемента. Координат в JSX нет,
 * высота берётся из `h-[NNNpx]`, если класс есть; иначе остаётся null,
 * и такой член в счёт высот не идёт.
 */
function parseJsxDump(text) {
  const stack = [];
  let tree = null;
  let pending = null;
  for (const line of text.split('\n')) {
    const m = JSX_OPEN.exec(line);
    if (m) {
      const [, indent, , attrs] = m;
      const idMatch = /data-node-id="([^"]+)"/.exec(attrs);
      if (idMatch) {
        const depth = Math.round(indent.length / 2);
        const nameMatch = /data-name="([^"]+)"/.exec(attrs);
        const hMatch = /\bh-\[([\d.]+)px\]/.exec(attrs);
        const node = {
          tag: 'frame',
          id: idMatch[1],
          name: nameMatch ? nameMatch[1] : '',
          x: null,
          y: null,
          w: null,
          h: hMatch ? Number(hMatch[1]) : null,
          hidden: false,
          children: [],
        };
        stack.length = depth;
        if (!tree) tree = node;
        else if (stack[depth - 1]) stack[depth - 1].children.push(node);
        else tree.children.push(node);
        stack[depth] = node;
        pending = node;
        continue;
      }
    }
    const body = line.trim();
    if (pending && body && !body.startsWith('<') && !body.startsWith('/')) {
      const clean = body.replace(/[{}`]/g, '').trim();
      if (clean && !clean.startsWith('const ') && !/^[\w-]+=/.test(clean) && clean.length < 400) {
        pending.children.push({
          tag: 'text', id: `${pending.id}~t`, name: clean,
          x: null, y: null, w: null, h: null, hidden: false, children: [],
        });
      }
    }
  }
  return tree;
}

function loadDump(file) {
  const text = fs.readFileSync(file, 'utf8');
  const isXml = text.trimStart().startsWith('<frame');
  const tree = isXml ? parseXmlDump(text) : parseJsxDump(text);
  return tree ? { file, tree, kind: isXml ? 'metadata' : 'design-context' } : null;
}

// --------------------------------------------------------------------------
// 2. Признаки члена стопки
// --------------------------------------------------------------------------

const walk = function* (node) {
  yield node;
  for (const child of node.children) yield* walk(child);
};

const lower = (s) => s.toLocaleLowerCase('ru');
const has = (hay, ...words) => words.filter((w) => hay.includes(w));

// Плейсхолдеры макета — метки слоёв дизайн-системы, а не текст страницы.
// В счёт «сколько текстов в секции» они не идут: `20572:37377`
// и `19319:7049` набиты `Heading_1` и `H4`, и по ним пустая секция
// выглядела бы содержательной.
const PLACEHOLDER = /^(h[1-5](_centre)?|heading_\d|body_[sml]|caption|nubmer|placeholder|question|faq answer|title|text|label|subtitle)$/i;

const FIELD = /(электропочта|e-?mail|почта|телефон|имя|фамилия|компания|должность|мессенджер|input|поле|placeholder|ссылка на)/;
const SUBMIT = /(участвовать|отправить|подписаться|зарегистр|зарега|получить|подать|записаться|хочу консультацию|оставить заявку|button|кнопка)/;
const DATE = /(\d{1,2}\s*[-–—]\s*\d{1,2}\s+(январ|феврал|март|апрел|ма[йя]|июн|июл|авгус|сентябр|октябр|ноябр|декабр)|\d{1,2}\s+(январ|феврал|март|апрел|мая|июн|июл|август|сентябр|октябр|ноябр|декабр)|\d{1,2}:\d{2}|day\s?\d|день \d)/;

/**
 * Лента — ряд, который шире своего фрейма: правый край содержимого выходит
 * за границу, либо ребёнок сам шире родителя. Наблюдаемый признак бегущей
 * строки, не зависящий от имени слоя.
 */
function ribbonInside(section) {
  let best = null;
  for (const node of walk(section)) {
    if (node.w === null || node.w <= 0 || node.children.length === 0) continue;
    const right = Math.max(...node.children.map((c) => (c.x ?? 0) + (c.w ?? 0)));
    const widest = Math.max(...node.children.map((c) => c.w ?? 0));
    const over = Math.max(right, widest) / node.w;
    const enough = node.children.length >= 3 || over > 1.15;
    if (enough && over > 1.05 && (!best || over > best.over)) {
      best = { id: node.id, name: node.name, over, w: node.w };
    }
  }
  return best;
}

/**
 * Зацикленный текст — строка, в которой её же начало встречается дважды:
 * «шок новость 💥 … шок новость 💥 …». Так набирают бегущую строку,
 * когда она не собрана из отдельных элементов.
 */
function loopedText(section) {
  for (const node of walk(section)) {
    if (node.tag !== 'text' || node.name.length < 40) continue;
    const head = node.name.slice(0, 16);
    if (node.name.split(head).length - 1 >= 2) return { id: node.id, head };
  }
  return null;
}

function profile(section) {
  const all = [...walk(section)];
  const sectionName = section.name;
  const rawTexts = all.filter((n) => n.tag === 'text' && !n.hidden).map((n) => n.name).filter(Boolean);
  const texts = rawTexts.filter((t) => !PLACEHOLDER.test(t.trim()));
  const names = all.map((n) => n.name).filter(Boolean);

  // Повторяющиеся карточки: сколько одинаково названных детей у одного
  // родителя. Сетка спикеров, партнёров, номинаций видна именно так.
  let maxRepeat = 0;
  let repeatKey = null;
  for (const node of all) {
    const byName = new Map();
    for (const child of node.children) {
      const key = child.name.replace(/[\s\d]+$/, '').trim();
      if (!key || key.length < 2) continue;
      byName.set(key, (byName.get(key) ?? 0) + 1);
    }
    for (const [key, count] of byName) {
      if (count > maxRepeat) { maxRepeat = count; repeatKey = key; }
    }
  }

  const nearNames = [];
  const collectNear = (node, depth) => {
    if (node.name) nearNames.push(node.name);
    if (depth >= 2) return;
    for (const child of node.children) collectNear(child, depth + 1);
  };
  collectNear(section, 0);

  const hay = lower([...texts, ...names].join(' | '));
  const nameHay = lower(names.join(' | '));
  const textHay = lower(texts.join(' | '));
  // Ключевые слова ищутся в заголовках и именах слоёв, а не в абзацах:
  // слово «жюри», один раз попавшее в середину абзаца, объявляло секцию
  // блоком спикеров. Заголовок — текст не длиннее 60 знаков.
  const headHay = lower([...texts.filter((t) => t.length <= 60), ...names].join(' | '));

  // Поле ввода — короткий узел с именем поля, а не абзац, в котором
  // попалось слово «компания».
  const shortNamed = (re, limit) => all.filter((n) => n.name.length <= limit && re.test(lower(n.name)));
  const fieldNodes = shortNamed(FIELD, 30);
  const submitNodes = shortNamed(SUBMIT, 40);
  const emailNodes = all.filter((n) => /^(электропочта|e-?mail|почта|рабочая почта\*?)$/i.test(n.name.trim()));
  // Слой-плейсхолдер поля ввода. Слова «имя», «компания», «должность» сами
  // по себе полем не считаются: у `20216:120` и `18085:3890` они стоят
  // подписями в карточках спикеров, и по ним секция спикеров объявлялась
  // формой на двенадцать полей.
  const inputNodes = all.filter((n) => /(input|placeholder)/i.test(n.name));
  const logoNodes = all.filter((n) => /(лого|logo|imgcompany)/i.test(n.name));
  const longTexts = texts.filter((x) => x.length >= 90);
  const questions = texts.filter((x) => x.length <= 120 && x.trim().endsWith('?'));
  const years = new Set(hay.match(/20[0-2]\d/g) ?? []);

  return {
    name: sectionName,
    all, texts, rawTexts, names, hay, nameHay, textHay, headHay,
    nearHay: lower(nearNames.join(' | ')),
    maxRepeat, repeatKey,
    fields: fieldNodes.length,
    submits: submitNodes.length,
    emails: emailNodes.length,
    inputs: inputNodes.length,
    logos: logoNodes.length,
    longTexts: longTexts.length,
    questions: questions.length,
    years: years.size,
    times: (hay.match(/\d{1,2}:\d{2}/g) ?? []).length,
    weekdays: (hay.match(/(\bпн\b|\bвт\b|\bср\b|\bчт\b|\bпт\b|\bсб\b|\bвс\b|понедельник|вторник|сред[ау]|четверг|пятниц|суббот|воскрес|день \d)/g) ?? []).length,
    dates: (hay.match(/(январ|феврал|март|апрел|мая|июн|июл|август|сентябр|октябр|ноябр|декабр|\bянв\b|\bфев\b|\bмар\b|\bапр\b|\bиюн\b|\bиюл\b|\bавг\b|\bсен\b|\bокт\b|\bноя\b|\bдек\b)/g) ?? []).length,
    ribbon: ribbonInside(section),
    looped: loopedText(section),
    placeholderOnly: rawTexts.length > 0 && texts.length === 0,
    height: section.h,
    width: section.w,
    // Ссылки-разделы шапки: короткие тексты без точки на конце.
    navish: texts.filter((t) => t.length <= 24 && !/[.!?]$/.test(t)).length,
  };
}

// --------------------------------------------------------------------------
// 3. Словарь типов
// --------------------------------------------------------------------------
// Правило возвращает строку-признак, если сработало, и null, если нет.
// Порядок значим: первое сработавшее ставит тип. Сначала правила,
// привязанные к позиции (шапка, футер, hero), потом содержательные.

const RULES = [
  {
    type: 'site-header',
    hit: (p, c) => (c.index <= 1 && p.height !== null && p.height <= 180
      && (/(navbar|header|меню|menu)/.test(p.nameHay) || p.texts.length === 0 || p.navish >= 3))
      ? `член ${c.index + 1}, высота ${Math.round(p.height)} px — полоса ниже 180 px над hero`
        + (/(navbar|header)/.test(p.nameHay) ? `, имя слоя «${c.name}»` : '')
        + (p.navish >= 3 ? `, ${p.navish} коротких ссылок` : '')
      : null,
  },
  {
    type: 'marquee',
    hit: (p) => {
      const thin = p.height !== null && p.width !== null && p.height / p.width <= 0.09;
      if (thin && p.looped) {
        return `полоса ${Math.round(p.height)} px, текст ${p.looped.id} повторён внутри себя: «${p.looped.head}…»`;
      }
      if (thin && p.ribbon) {
        return `полоса ${Math.round(p.height)} px при ширине ${Math.round(p.width)}, ряд ${p.ribbon.id} шире своего фрейма в ${p.ribbon.over.toFixed(2)} раза`;
      }
      return null;
    },
  },
  {
    type: 'footer-corporate',
    hit: (p, c) => (c.last && /(ооо «хабр»|реквизит|услуги|о компании|правовая)/.test(p.hay))
      ? `последний член, корпоративный блок: ${has(p.hay, 'ооо «хабр»', 'реквизит', 'услуги', 'о компании').join(', ')}`
      : null,
  },
  {
    type: 'footer-social',
    hit: (p, c) => (c.last && /(соцсет|социальных сетях|подпишись|подписывайтесь|присоединяйтесь|telegram|телеграм|\bvk\b|youtube|дзен|подвал|footer|сделано в хабре)/.test(p.hay))
      ? `последний член, соцсети и копирайт: ${has(p.hay, 'социальных сетях', 'подпишись', 'подписывайтесь', 'присоединяйтесь', 'telegram', 'телеграм', 'сделано в хабре', 'подвал').join(', ')}`
      : null,
  },
  {
    type: 'hero',
    hit: (p, c) => (!c.heroTaken && c.index <= 2 && p.height !== null && p.height >= 400)
      ? `первый член стопки выше 400 px (${Math.round(p.height)} px), позиция ${c.index + 1}`
        + (c.navInside ? '; строка разделов лежит внутри него, отдельной шапки нет' : '')
      : null,
  },
  {
    type: 'form',
    hit: (p) => ((p.emails >= 1 || p.inputs >= 2) && (p.submits >= 1 || /подпис/.test(p.headHay)))
      ? `${p.emails} поле почты, ${p.inputs} плейсхолдеров ввода, кнопка `
        + `${has(p.headHay, 'участвовать', 'подписаться', 'зарегистр', 'отправить', 'подать', 'хочу консультацию', 'получить').join('/') || 'отправки'}`
      : null,
  },
  {
    type: 'faq',
    hit: (p) => {
      if (p.questions >= 4 && p.height !== null && p.height >= 600) {
        return `${p.questions} строк, оканчивающихся вопросительным знаком, в блоке ${Math.round(p.height)} px`;
      }
      if ((/\bfaq\b/.test(p.headHay) || /(вопрос|question)/.test(String(p.repeatKey).toLowerCase())) && p.maxRepeat >= 4) {
        return `${p.maxRepeat} × «${p.repeatKey}»${/\bfaq\b/.test(p.headHay) ? ' под заголовком FAQ' : ''}`;
      }
      return null;
    },
  },
  {
    type: 'nominations',
    hit: (p) => (/номинаци/.test(p.headHay) && (p.maxRepeat >= 3 || /\(\s?1\s?\)/.test(p.headHay)))
      ? `слово «номинации» в заголовке и нумерованный перечень${p.maxRepeat >= 3 ? `, ${p.maxRepeat} × «${p.repeatKey}»` : ''}`
      : null,
  },
  {
    type: 'program',
    hit: (p) => {
      const word = /(программа|расписание|schedule|этап|даты|таймлайн|заезд)/.test(p.headHay);
      if (word && (p.dates >= 1 || p.times >= 1 || DATE.test(p.headHay))) {
        return `слово ${has(p.headHay, 'программа', 'расписание', 'schedule', 'этап', 'даты', 'заезд').join('/')} в заголовке,`
          + ` ${p.dates} упоминаний месяцев и ${p.times} отметок времени`;
      }
      if (p.times >= 2 && p.dates >= 2) return `${p.dates} дат и ${p.times} отметок времени в одном блоке`;
      if (p.dates >= 3 && p.weekdays >= 2) return `${p.dates} дат и ${p.weekdays} обозначений дней недели`;
      if (/(program schedule|programm-section|schedule day|program overview)/.test(p.nameHay)) return 'имя слоя расписания';
      return null;
    },
  },
  {
    type: 'rules',
    hit: (p) => (/(правила|критерии оценки|условия участия)/.test(p.headHay) && /(_0\d|\(\s?\d\s?\))/.test(p.headHay))
      ? `слово ${has(p.headHay, 'правила', 'критерии оценки', 'условия участия').join('/')} в заголовке и нумерованные пункты вида _01 или ( 1 )`
      : null,
  },
  {
    type: 'interactive',
    hit: (p) => (/(квиз|quiz|настолк|кликер|clicker|доска жалоб|фреймворк|game|играй)/.test(p.nearHay)
      || ((p.headHay.match(/(квиз|quiz|кликер|доска жалоб|фреймворк)/g) ?? []).length >= 2 && p.maxRepeat < 3))
      ? `слово ${has(`${p.nearHay} | ${p.headHay}`, 'квиз', 'quiz', 'настолк', 'кликер', 'clicker', 'доска жалоб', 'фреймворк', 'game', 'играй').join('/')} в имени секции или её ближних слоёв`
      : null,
  },
  {
    type: 'timeline',
    hit: (p) => (p.years >= 4) ? `${p.years} разных годов в одном блоке` : null,
  },
  {
    type: 'speakers',
    hit: (p) => {
      const heads = p.texts.filter((x) => x.length <= 30 && /(спикер|жюри|преподавател|модератор)/i.test(x));
      if ((heads.length >= 1 || /(спикер|жюри|преподавател)/.test(p.nearHay)) && p.maxRepeat >= 2) {
        return `строка-заголовок «${heads[0] ?? p.name}» и ${p.maxRepeat} карточек`;
      }
      return null;
    },
  },
  {
    type: 'jobs',
    hit: (p) => {
      const titles = p.texts.filter((t) => t.length <= 90
        && /(разработчик|инженер|frontend|backend|developer|engineer|аналитик|тестировщик|менеджер|дизайнер)/i.test(t)).length;
      if (/хочу тут работать/.test(p.headHay) && titles >= 2) return `${titles} названий вакансий и кнопка «хочу тут работать»`;
      if (/ваканси/.test(p.headHay) && titles >= 2) return `${titles} названий вакансий под заголовком со словом «вакансии»`;
      if (/(jobs_section|вакансии)/.test(p.nameHay) && titles >= 1) return `имя слоя со словом «вакансии», ${titles} названий должностей`;
      return null;
    },
  },
  {
    type: 'ecosystem-list',
    hit: (p) => (has(p.hay, 'хабр карьер', 'хабр фриланс', 'хабр курс', 'хабр q&a', 'экосистем', 'семейство продуктов', 'калькулятор зарплат', 'место встречи айтишников').length >= 2)
      ? `перечень продуктов Хабра: ${has(p.hay, 'хабр карьер', 'хабр фриланс', 'хабр курс', 'экосистем', 'семейство продуктов', 'калькулятор зарплат', 'место встречи айтишников').join(', ')}`
      : null,
  },
  {
    type: 'winners',
    hit: (p) => (/(победител|шорт-лист)/.test(p.headHay) && p.maxRepeat >= 3)
      ? `слово ${has(p.headHay, 'победител', 'шорт-лист').join('/')} в заголовке, ${p.maxRepeat} × «${p.repeatKey}»`
      : null,
  },
  {
    type: 'gallery',
    hit: (p) => (/(галере|gallery|музей|артефакт|экспонат|коллекци)/.test(p.headHay))
      ? `слово ${has(p.headHay, 'галере', 'музей', 'артефакт', 'экспонат', 'коллекци').join('/')} в заголовке`
      : null,
  },
  {
    type: 'testimonials',
    hit: (p) => ((/(отзыв|testimonial|мы спросили)/.test(p.headHay) || (p.textHay.match(/«/g) ?? []).length >= 3))
      ? `${(p.textHay.match(/«/g) ?? []).length} прямых цитат в кавычках`
        + (/отзыв|мы спросили/.test(p.headHay) ? ` и слово ${has(p.headHay, 'отзыв', 'мы спросили').join('/')}` : '')
      : null,
  },
  {
    type: 'partners',
    hit: (p) => (/(партнёр|партнер|организатор|участники|компани|работодател|кому подойд)/.test(p.headHay)
      && (p.logos >= 2 || p.longTexts >= 2))
      ? `слово ${has(p.headHay, 'партнёр', 'организатор', 'участники', 'компани', 'работодател', 'кому подойд').join('/')} в заголовке,`
        + ` ${p.logos} логотипов и ${p.longTexts} развёрнутых описаний`
      : null,
  },
  {
    type: 'stats',
    hit: (p) => (/(stat card|stats|в цифрах|в числах)/.test(`${p.nearHay} | ${p.headHay}`) && p.maxRepeat >= 2)
      ? `${p.maxRepeat} × «${p.repeatKey}» под словом «в цифрах» или именем слоя Stat`
      : null,
  },
  {
    type: 'company-callout',
    hit: (p) => ((/(вы из компании|для компаний|компаниям)/.test(p.headHay) || /чат-бот/.test(p.headHay))
      && /(чат-бот|напишите нам|свяжитесь|обсудить|перейти)/.test(p.headHay))
      ? `обращение к компаниям и канал связи: ${has(p.headHay, 'вы из компании', 'чат-бот', 'напишите нам', 'свяжитесь').join(', ')}`
      : null,
  },
  {
    type: 'features',
    hit: (p) => ((/(benefit|преимуществ|что получ|что будет|почему|зачем|бонус|берите от|вас ждёт|участвуйте, если|кому подойд|для кого|формат|как это работает)/.test(p.headHay) && p.maxRepeat >= 2)
      || /(benefits-section|audience-section|preparation-section|personas_section|section_bonus|section-offer)/.test(p.nameHay))
      ? (p.maxRepeat >= 2 ? `${p.maxRepeat} × «${p.repeatKey}»` : 'перечень')
        + ` под словом ${has(p.headHay, 'преимуществ', 'что получ', 'что будет', 'почему', 'бонус', 'вас ждёт', 'участвуйте, если', 'кому подойд', 'формат').join('/') || `имени слоя «${p.names[0]}»`}`
      : null,
  },
  {
    type: 'cta',
    hit: (p) => (p.height !== null && p.height <= 700 && p.submits >= 1)
      ? `короткая секция ${Math.round(p.height)} px, кнопка ${has(p.headHay, 'участвовать', 'зарегистр', 'отправить', 'подать', 'хочу консультацию', 'получить').join('/')}, полей ввода меньше двух`
      : null,
  },
  {
    // Врезка-заголовок: секция, которая только объявляет следующий раздел.
    // Ни карточек, ни полей, ни кнопки — три-четыре строки крупным кеглем.
    type: 'lead-in',
    hit: (p) => (p.height !== null && p.height <= 800 && p.texts.length >= 1 && p.texts.length <= 6
      && p.maxRepeat <= 2 && p.fields === 0 && p.submits === 0)
      ? `${p.texts.length} строк текста, ни карточек, ни полей, ни кнопки, высота ${Math.round(p.height)} px`
      : null,
  },
];

// Имена слоёв, у которых смысл есть. Работают запасным ходом — только там,
// где содержательных признаков не нашлось: у `6509:20474` одно имя
// «победители» носят четыре разные секции, включая hero, и доверять
// имени вперёд содержимого нельзя.
const NAMED = [
  [/navbar|^header_section|^header$/, 'site-header'],
  [/hero/, 'hero'],
  [/benefit|преимуществ|audience|аудитор|personas|preparation|подготовк|^do it$|^offer|bonus/, 'features'],
  [/programm|program schedule|program overview|расписание|^даты$/, 'program'],
  [/contact|контакты|lid-form|^form/, 'form'],
  [/номинации/, 'nominations'],
  [/жюри|спикер|speaker/, 'speakers'],
  [/правила|критери/, 'rules'],
  [/подвал|^footer/, 'footer-social'],
  [/победител/, 'winners'],
  [/faq/, 'faq'],
  [/jobs|вакансии/, 'jobs'],
  [/^registration cta|^cta/, 'cta'],
  [/courses_section|habr courses/, 'ecosystem-list'],
];

// Имена, совпавшие с типом блока целиком. Такое имя — наблюдение не хуже
// текста. В список не входит «победители»: у `6509:20474` его носят четыре
// разные секции, включая hero и форму подписки.
const STRONG_NAMED = [
  [/^даты$/, 'program'],
  [/^программа$/, 'program'],
  [/^расписание$/, 'program'],
  [/^номинации$/, 'nominations'],
  [/^жюри$/, 'speakers'],
  [/^спикеры$/, 'speakers'],
  [/^преподаватели$/, 'speakers'],
  [/^правила$/, 'rules'],
  [/^подвал$/, 'footer-social'],
];

const POSITIONAL = new Set(['site-header', 'marquee', 'footer-corporate', 'footer-social', 'hero']);

function classify(section, ctx) {
  const p = profile(section);
  for (const rule of RULES) {
    if (!POSITIONAL.has(rule.type)) break;
    const sign = rule.hit(p, ctx);
    if (sign) return { type: rule.type, sign, profile: p, by: 'признак' };
  }
  const strongName = STRONG_NAMED.find(([re]) => re.test(lower(section.name).trim()));
  if (strongName) {
    return { type: strongName[1], sign: `имя секции целиком — «${section.name.trim()}»`, profile: p, by: 'имя' };
  }
  for (const rule of RULES) {
    if (POSITIONAL.has(rule.type)) continue;
    const sign = rule.hit(p, ctx);
    if (sign) return { type: rule.type, sign, profile: p, by: 'признак' };
  }
  const named = NAMED.find(([re]) => re.test(lower(section.name)));
  if (named) return { type: named[1], sign: `содержательных признаков нет; имя слоя «${section.name}»`, profile: p, by: 'имя' };
  return {
    type: '?',
    sign: `не хватило: текстов ${p.texts.length}${p.placeholderOnly ? ' (только плейсхолдеры макета)' : ''},`
      + ` повторов ${p.maxRepeat}, полей ${p.fields}, высота ${p.height === null ? '—' : Math.round(p.height)}`,
    profile: p,
    by: '—',
  };
}

// --------------------------------------------------------------------------
// 4. Сборка
// --------------------------------------------------------------------------

/**
 * Член стопки — ребёнок верхнего уровня во всю ширину артборда при x ≈ 0
 * (определение L-1). Плавающие окна, накладки и декор этому не отвечают
 * и возвращаются отдельным списком: их нельзя ни потерять, ни посчитать
 * секцией.
 */
function splitMembers(tree) {
  const kids = tree.children.filter((n) => !n.hidden);
  if (tree.w === null) return { members: kids, outside: [] }; // JSX-дамп: координат нет
  const members = [];
  const outside = [];
  for (const kid of kids) {
    const full = kid.w !== null && kid.w >= tree.w * 0.96 && Math.abs(kid.x ?? 0) <= tree.w * 0.02;
    (full ? members : outside).push(kid);
  }
  members.sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  outside.sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  return { members, outside };
}

const NAV_WORDS = /(программа|о нас|контакты|о проекте|спикеры|номинации|что будет|вакансии|about|program|jobs|personas|меню|чат|трансляц|правила|жюри|заявка)/;

const result = {};
for (const file of sources.sort()) {
  const dump = loadDump(file);
  if (!dump) continue;
  const { tree, kind } = dump;
  if (only && tree.id !== only) continue;
  const { members, outside } = splitMembers(tree);

  let heroTaken = false;
  const sections = members.map((section, index) => {
    const navInside = index === 0
      && NAV_WORDS.test(lower([...walk(section)].map((n) => n.name).join(' | ')));
    const ctx = {
      index, last: index === members.length - 1, total: members.length,
      heroTaken, navInside, name: section.name,
    };
    const verdict = classify(section, ctx);
    if (verdict.type === 'hero') heroTaken = true;
    return {
      n: index + 1,
      id: section.id,
      name: section.name,
      hasForm: verdict.profile.emails >= 1 || verdict.profile.inputs >= 2,
      y: section.y,
      height: section.h,
      share: section.y !== null && tree.h ? Number((section.y / tree.h).toFixed(3)) : null,
      type: verdict.type,
      sign: verdict.sign,
      by: verdict.by,
      texts: verdict.profile.texts.slice(0, 40),
    };
  });

  // Признаки уровня страницы. Они отвечают на вопросы о покрытии блоков,
  // а не о порядке, поэтому ищутся везде, а не только среди членов стопки:
  // у `16418:3180` бегущая строка лежит внутри секции, а не отдельной.
  const allNodes = [...walk(tree)];
  // Бегущая строка — полоса во всю ширину макета не выше 200 px, содержимое
  // которой не помещается по горизонтали, либо текст в ней повторён внутри
  // себя. Узкие переполнения внутри карточек и иконок сюда не идут: они есть
  // почти везде и о бегущей строке ничего не говорят.
  const ribbons = [];
  for (const node of allNodes) {
    if (node.w === null || node.h === null) continue;
    if (tree.w !== null && node.w < tree.w * 0.9) continue;
    if (node.h > 200) continue;
    const kids = node.children;
    const right = kids.length ? Math.max(...kids.map((c) => (c.x ?? 0) + (c.w ?? 0))) : 0;
    const widest = kids.length ? Math.max(...kids.map((c) => c.w ?? 0)) : 0;
    const over = Math.max(right, widest) / node.w;
    const looped = loopedText(node);
    if (over > 1.05 || looped) {
      ribbons.push({
        id: node.id, name: node.name,
        w: Math.round(node.w), h: Math.round(node.h),
        over: Number(over.toFixed(2)),
        looped: looped ? looped.head : null,
      });
    }
  }
  const fieldNodes = allNodes.filter((n) => /(input|placeholder)/i.test(n.name)
    || /^(электропочта|e-?mail|почта|рабочая почта\*?)$/i.test(n.name.trim()));
  const submitNodes = allNodes.filter((n) => n.name.length <= 40 && SUBMIT.test(lower(n.name)));
  const formFrames = allNodes.filter((n) => /^(form|форма|рег|рега|subscribe|lid-form|hero form)$/i.test(n.name.trim())
    && [...walk(n)].some((k) => /^(button|кнопка|button_l|cta button)/i.test(k.name.trim())
      || (k.name.length <= 40 && SUBMIT.test(lower(k.name)))));

  result[tree.id] = {
    node: tree.id,
    name: tree.name,
    width: tree.w,
    height: tree.h,
    source: path.relative(root, file).replace(/\\/g, '/'),
    kind,
    stack: members.length > 0 && outside.length <= members.length / 2,
    members: sections.length,
    outsideCount: outside.length,
    outside: outside.map((n) => ({ id: n.id, name: n.name, x: n.x, y: n.y, w: n.w, h: n.h })),
    page: {
      hasForm: (fieldNodes.length >= 1 && submitNodes.length >= 1) || formFrames.length >= 1,
      formEvidence: [...formFrames.slice(0, 1), ...fieldNodes.slice(0, 2), ...submitNodes.slice(0, 1)]
        .map((n) => `${n.id} «${n.name}»`),
      ribbons: ribbons.slice(0, 6),
    },
    sections,
  };
}

fs.writeFileSync(path.join(here, 'sections.json'), `${JSON.stringify(result, null, 2)}\n`);

for (const page of Object.values(result)) {
  console.log(`\n${page.node}  ${page.name}  ${page.width}×${page.height}  членов ${page.members}`
    + `${page.outsideCount ? `  вне стопки ${page.outsideCount}` : ''}  ${page.stack ? 'стопка' : 'НЕ стопка'}`);
  for (const s of page.sections) {
    console.log(`  ${String(s.n).padStart(2)} ${s.type.padEnd(17)} ${String(Math.round(s.height ?? 0) || '—').padStart(6)} px  ${s.id}  ${s.name}`);
    if (why) {
      console.log(`       признак: ${s.sign}`);
      if (s.texts.length) console.log(`       тексты: ${s.texts.join(' · ').slice(0, 300)}`);
    }
  }
}

const pages = Object.values(result);
const stacksOnly = pages.filter((p) => p.stack);
const unknown = pages.flatMap((p) => p.sections
  .filter((s) => s.type === '?')
  .map((s) => `${p.node} #${s.n} ${s.id} «${s.name}» — ${s.sign}`));
// Члены считаются по стопкам: у `1284:3362` детей верхнего уровня двенадцать,
// но стопки нет (L-1), и называть их членами стопки нельзя.
const totalMembers = stacksOnly.reduce((n, p) => n + p.members, 0);
console.log(`\nУзлов разобрано: ${pages.length}, из них стопкой ${stacksOnly.length}.`
  + ` Членов стопки: ${totalMembers}, тип установлен у ${totalMembers - unknown.length},`
  + ` без типа ${unknown.length}.`);
for (const line of unknown) console.log(`  ? ${line}`);

if (counts) {
  const withForm = pages.filter((p) => p.page.hasForm);
  const withRibbon = pages.filter((p) => p.page.ribbons.length > 0);
  console.log(`\nформа (поле ввода и кнопка отправки где угодно на странице): ${withForm.length}/${pages.length}`);
  for (const p of withForm) console.log(`  ${p.node}  ${p.page.formEvidence.join(' · ')}`);
  console.log(`\nбегущая строка (полоса во всю ширину ≤ 200 px, содержимое не помещается или текст зациклен): ${withRibbon.length}/${pages.length}`);
  for (const p of withRibbon) {
    console.log(`  ${p.node}  ${p.page.ribbons.map((r) => `${r.id} «${r.name}» ${r.w}×${r.h} ×${r.over}${r.looped ? ` зациклен «${r.looped}…»` : ''}`).join(' · ')}`);
  }
  const byType = new Map();
  for (const p of pages) {
    for (const t of new Set(p.sections.map((s) => s.type))) {
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t).push(p.node);
    }
  }
  console.log('\nтипы среди членов стопки, дробью от разобранных узлов:');
  for (const [type, nodes] of [...byType].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${type.padEnd(18)} ${String(nodes.length).padStart(2)}/${pages.length}  ${nodes.join(' ')}`);
  }
}

// --------------------------------------------------------------------------
// 5. Порядок: что за чем идёт
// --------------------------------------------------------------------------
// Считает то, из чего выводятся правила L-17 и дальше: первый содержательный
// блок после hero, последний перед футером, устойчивые пары «A раньше B»,
// доля позиции каждого типа от длины стопки и соседства.

if (order) {
  const stacks = pages.filter((p) => p.stack);
  const SHELL = new Set(['site-header', 'hero', 'footer-social', 'footer-corporate']);
  const body = (p) => p.sections.filter((s) => !SHELL.has(s.type));

  console.log(`\nСтопок разобрано: ${stacks.length} из ${pages.length}.\n`);

  console.log('Первый содержательный член после hero:');
  const firstAfter = new Map();
  for (const p of stacks) {
    const heroAt = p.sections.findIndex((s) => s.type === 'hero');
    const first = p.sections.slice(heroAt + 1).find((s) => !SHELL.has(s.type));
    const key = first ? first.type : '—';
    if (!firstAfter.has(key)) firstAfter.set(key, []);
    firstAfter.get(key).push(`${p.node} #${first ? first.n : '—'}`);
  }
  for (const [type, where] of [...firstAfter].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${type.padEnd(16)} ${String(where.length).padStart(2)}/${stacks.length}  ${where.join(' ')}`);
  }

  console.log('\nПоследний содержательный член перед футером:');
  const lastBefore = new Map();
  for (const p of stacks) {
    const list = body(p);
    const last = list[list.length - 1];
    const key = last ? last.type : '—';
    if (!lastBefore.has(key)) lastBefore.set(key, []);
    lastBefore.get(key).push(`${p.node} #${last ? last.n : '—'}`);
  }
  for (const [type, where] of [...lastBefore].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${type.padEnd(16)} ${String(where.length).padStart(2)}/${stacks.length}  ${where.join(' ')}`);
  }

  console.log('\nПервая форма страницы против первой секции программы (форма в hero тоже считается):');
  const l12 = { yes: [], no: [], none: [] };
  for (const p of stacks) {
    const formAt = p.sections.find((s) => s.hasForm);
    const progAt = p.sections.find((s) => s.type === 'program');
    if (!formAt || !progAt) { l12.none.push(p.node); continue; }
    const line = `${p.node}: форма член ${formAt.n} (${formAt.type}), программа член ${progAt.n} из ${p.members}`;
    (formAt.n < progAt.n ? l12.yes : l12.no).push(line);
  }
  console.log(`  форма выше программы: ${l12.yes.length}/${l12.yes.length + l12.no.length}`);
  for (const line of l12.yes) console.log(`    ✔ ${line}`);
  for (const line of l12.no) console.log(`    ✘ ${line}`);
  console.log(`  не сравнить (нет формы или нет программы): ${l12.none.join(' ') || '—'}`);

  console.log('\nДоля позиции первой формы страницы:');
  for (const p of stacks) {
    const formAt = p.sections.find((s) => s.hasForm);
    if (!formAt) continue;
    console.log(`  ${p.node}  член ${formAt.n}/${p.members} = ${Math.round((formAt.n / p.members) * 100)} %  (${formAt.type}, ${formAt.id})`);
  }

  console.log('\nПары «A раньше B» — только там, где оба типа есть на одной странице:');
  const pair = new Map();
  for (const p of stacks) {
    const firstOf = new Map();
    for (const s of p.sections) if (!firstOf.has(s.type)) firstOf.set(s.type, s.n);
    const types = [...firstOf.keys()].filter((x) => x !== '?');
    for (const a of types) {
      for (const b of types) {
        if (a === b) continue;
        const key = `${a} → ${b}`;
        if (!pair.has(key)) pair.set(key, { yes: [], no: [] });
        (firstOf.get(a) < firstOf.get(b) ? pair.get(key).yes : pair.get(key).no).push(p.node);
      }
    }
  }
  const rows = [];
  for (const [key, { yes, no }] of pair) {
    const [a, b] = key.split(' → ');
    if (a > b) continue; // печатаем пару один раз, в сильную сторону
    const back = pair.get(`${b} → ${a}`) ?? { yes: [] };
    const total = yes.length + no.length;
    if (total < 2) continue;
    const strong = yes.length >= back.yes.length
      ? { text: key, hits: yes.length, where: yes }
      : { text: `${b} → ${a}`, hits: back.yes.length, where: back.yes };
    if (strong.hits === total) rows.push({ ...strong, total, clean: true });
    else rows.push({ ...strong, total, clean: false });
  }
  rows.sort((x, y) => (y.clean - x.clean) || (y.total - x.total) || (y.hits - x.hits));
  for (const r of rows) {
    console.log(`  ${r.clean ? '✔' : ' '} ${r.text.padEnd(38)} ${r.hits}/${r.total}  ${r.where.join(' ')}`);
  }

  console.log('\nДоля позиции от длины стопки (номер члена ÷ число членов):');
  const shares = new Map();
  for (const p of stacks) {
    for (const s of p.sections) {
      if (s.type === '?') continue;
      if (!shares.has(s.type)) shares.set(s.type, []);
      shares.get(s.type).push({ node: p.node, v: s.n / p.members, n: s.n, total: p.members });
    }
  }
  for (const [type, list] of [...shares].sort((a, b) => b[1].length - a[1].length)) {
    const vals = list.map((x) => x.v).sort((a, b) => a - b);
    const pct = (v) => `${Math.round(v * 100)} %`;
    const median = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
    console.log(`  ${type.padEnd(16)} ${String(list.length).padStart(2)} вхождений  ${pct(vals[0])} … ${pct(vals[vals.length - 1])}, медиана ${pct(median)}`
      + `   ${list.map((x) => `${x.node}:${x.n}/${x.total}`).join(' ')}`);
  }

  console.log('\nСоседства: какие типы стоят встык:');
  const near = new Map();
  for (const p of stacks) {
    for (let i = 0; i + 1 < p.sections.length; i += 1) {
      const a = p.sections[i].type;
      const b = p.sections[i + 1].type;
      if (a === '?' || b === '?') continue;
      const key = [a, b].join(' + ');
      if (!near.has(key)) near.set(key, []);
      near.get(key).push(p.node);
    }
  }
  for (const [key, where] of [...near].filter(([, w]) => w.length >= 2).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${key.padEnd(38)} ${where.length}  ${where.join(' ')}`);
  }
}
