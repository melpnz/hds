// Регрессионные тесты скилла: node tests/run-tests.mjs
// Без сети и без Figma: на сохранённых данных проверяют конвертер строк Figma, автосопоставление и сборку отчёта.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const here = path.dirname(fileURLToPath(import.meta.url)), skill = path.join(here, '..'), fx = path.join(here, 'fixtures');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dr-test-'));
const node = (script, ...args) => execFileSync(process.execPath, [path.join(skill, 'scripts', script), ...args], { encoding: 'utf8' });
let failed = 0;
const check = (name, ok, info = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : '  ← ' + info}`); if (!ok) failed++; };

// --- сопоставление макета и сайта (Хабр, 1024)
const run = path.join(tmp, 'habr');
fs.mkdirSync(path.join(run, 'figma'), { recursive: true }); fs.mkdirSync(path.join(run, 'page'), { recursive: true });
fs.copyFileSync(path.join(fx, 'habr-1024.page.json'), path.join(run, 'page', 'page-1024.json'));
node('figma-rows.mjs', path.join(fx, 'habr-1024.tsv'), path.join(run, 'figma', 'figma-1024.json'), '--frame', '14:4808|articles|1024|2700');
const fig = JSON.parse(fs.readFileSync(path.join(run, 'figma', 'figma-1024.json'), 'utf8'));
check('figma-rows: тексты и блоки', fig.elements.filter(e => e.kind === 'text').length === 16 && fig.elements.some(e => e.kind === 'box'), JSON.stringify(fig.elements.length));
check('figma-rows: начертание из имени стиля', fig.elements.find(e => e.text === 'Статьи')?.style['font-weight'] === '500');
node('match-figma.mjs', run);
const { findings } = JSON.parse(fs.readFileSync(path.join(run, 'findings.json'), 'utf8'));
const has = (re, prop) => findings.find(f => re.test(f.title) && (!prop || f.css?.some(c => c.prop === prop)));
check('находит цвет неактивных вкладок', !!has(/Цвет текста #6F7476 вместо #909090/, 'color'));
check('находит размер и начертание «Все подряд»', !!has(/Размер шрифта 13 px вместо 14 px/, 'font-size') && !!has(/Начертание 500 вместо 400/, 'font-weight'));
check('находит межстрочный и трекинг вкладок', !!has(/Межстрочный 16 px вместо 20 px/) && !!has(/Трекинг 0.8 px вместо 0.7 px/));
check('не путает данные с вёрсткой (нет «отступа» вкладок из-за ширины счётчиков)', !findings.some(f => /Отступ слева/.test(f.title) && /Посты|Новости/.test(f.why)), findings.map(f => f.title).join(' | '));
check('не сравнивает высоту карточек с данными', !findings.some(f => /Высота/.test(f.title) && f.evidence.some(e => e.dev?.b?.tag === 'article')));
check('у находок есть селектор для разработчика', findings.filter(f => f.css?.length).every(f => f.evidence[0]?.dev?.b?.sel), findings.filter(f => f.css?.length && !f.evidence[0]?.dev?.b?.sel).map(f => f.id).join(','));
check('шум в пределах нормы (≤ 12 находок)', findings.length <= 12, String(findings.length));

// --- токены: другой токен, захардкоженный цвет, подсказка var() по значению
{
  const tr = path.join(tmp, 'tokens');
  fs.mkdirSync(path.join(tr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(tr, 'page'), { recursive: true });
  const fText = (id, text, x, y, color, varId) => ({ id, kind: 'text', text, box: { x, y, width: 60, height: 20 }, style: { 'font-size': '14px', 'font-weight': '500', 'line-height': '20px', 'letter-spacing': '0px', color, 'text-transform': 'none' }, tokens: { color: { var: varId } } });
  const pText = (id, text, x, y, color, vars) => ({ id, tag: 'a', text, sel: `a.t${id}`, selN: 1, cls: `t${id}`, box: { x, y, width: 60, height: 20 }, style: { 'font-size': '14px', 'font-weight': '500', 'line-height': '20px', 'letter-spacing': 'normal', color, 'text-transform': 'none', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' }, vars });
  fs.writeFileSync(path.join(tr, 'figma', 'figma-1024.json'), JSON.stringify({ frame: { w: 1024, h: 900 }, elements: [
    fText('1:1', 'Вкладка', 20, 20, '#909090', 'VariableID:aaaaaaaa11/1:1'), fText('1:2', 'Ссылка', 120, 20, '#548EAA', 'VariableID:bbbbbbbb22/1:2'), fText('1:3', 'Кнопка', 220, 20, '#333333', 'VariableID:cccccccc33/1:3')] }));
  fs.writeFileSync(path.join(tr, 'figma', 'variables.tsv'), '1:1@aaaaaaaa | elements/tab/icon_txt | ui | #909090\n1:2@bbbbbbbb | --accent-primary | ui | #548EAA\n1:3@cccccccc | --text-main | ui | #333333\n');
  fs.writeFileSync(path.join(tr, 'page', 'page-1024.json'), JSON.stringify({ width: 1024, cssVars: { '--text-secondary': 'hsl(0, 0%, 56%)', '--text-inactive': 'hsl(195, 3%, 45%)', '--accent-primary': 'hsl(200, 34%, 50%)', '--text-main': 'hsl(0, 0%, 20%)' }, elements: [
    pText(1, 'Вкладка', 20, 20, 'rgb(111, 116, 118)', { color: { var: '--text-inactive' } }),
    pText(2, 'Ссылка', 120, 20, 'rgb(77, 128, 170)', { color: { raw: '#4d80aa' } }),
    pText(3, 'Кнопка', 220, 20, 'rgb(51, 51, 51)', { color: { var: '--accent-dark' } })] }));
  node('match-figma.mjs', tr);
  const tf = JSON.parse(fs.readFileSync(path.join(tr, 'findings.json'), 'utf8')).findings;
  const t1 = tf.find(f => /токен --text-inactive вместо elements\/tab\/icon_txt/.test(f.title));
  check('токены: «другой токен» с подсказкой var() по значению', !!t1 && t1.css[0]?.a === 'var(--text-secondary)', tf.map(f => f.title).join(' | '));
  check('токены: захардкоженный цвет', tf.some(f => /задан без токена/.test(f.title) && f.css[0]?.a === 'var(--accent-primary)'), tf.map(f => f.title).join(' | '));
  check('токены: тот же цвет, другой токен — отдельной мелкой находкой', tf.some(f => /Тот же цвет, но другой токен: --accent-dark вместо --text-main/.test(f.title) && f.severity === 'minor'), tf.map(f => f.title).join(' | '));
}

// --- проверка самого макета: hex со значением токена без привязки, нечётный отступ при сетке 4 px; эмодзи-векторы не трогаем
{
  const { lintFigma } = await import(new URL('../scripts/figma-lint.mjs', import.meta.url));
  const els = [];
  for (let i = 0; i < 24; i++) els.push({ id: 'b' + i, kind: 'box', name: 'card', box: { x: 0, y: i * 100, width: 300, height: 80 }, style: { layout: 'column', 'padding-top': '16px', gap: '8px', 'background-color': '#FFFFFF' }, tokens: { 'background-color': { var: 'v1' } } });
  els.push({ id: 'x1', kind: 'box', name: 'card', box: { x: 0, y: 3000, width: 300, height: 80 }, style: { layout: 'column', 'padding-top': '7px', 'background-color': '#1B272C' } });
  els.push({ id: 'x2', kind: 'box', name: 'Vector', box: { x: 0, y: 3100, width: 16, height: 16 }, style: { 'background-color': '#1B272C' } });
  const out = lintFigma({ elements: els }, { sid: '1024', w: 1024, state: 'default', tokens: [{ name: 'color/ui/gray-1', value: '#1B272C' }] });
  check('макет: hex со значением токена без привязки', out.some(o => /не привязан к токену color\/ui\/gray-1/.test(o.title) && o.count === 1), out.map(o => o.title).join(' | '));
  check('макет: нечётный отступ при сетке 4 px', out.some(o => /padding-top 7/.test(o.title)), out.map(o => o.title).join(' | '));
}

// --- первое боевое ревью (courses-sale): шум, который надо не выдавать
{
  const cr = path.join(tmp, 'courses');
  fs.mkdirSync(path.join(cr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(cr, 'page'), { recursive: true });
  const st = (fsz, extra = {}) => ({ 'font-size': fsz, 'font-weight': '400', 'line-height': '20px', 'letter-spacing': '0px', color: '#1B272C', 'text-transform': 'none', ...extra });
  const fEls = [], pEls = [];
  // 6 цветов в макете на токенах библиотеки Education, сайт — на habr-ui: имена не пересекаются, значения те же
  for (let i = 0; i < 6; i++) {
    fEls.push({ id: 't' + i, kind: 'text', text: 'Кнопка ' + 'абвгде'[i], box: { x: 20, y: 40 + i * 60, width: 80, height: 20 }, style: st('14px'), tokens: { color: { var: `VariableID:${'abcdef'[i].repeat(8)}11/9:${i}` } } });
    pEls.push({ id: 100 + i, tag: 'span', text: 'Кнопка ' + 'абвгде'[i], sel: 'span.b' + i, selN: 1, box: { x: 20, y: 40 + i * 60, width: 80, height: 20 }, style: { ...st('14px'), 'letter-spacing': 'normal', color: 'rgb(27, 39, 44)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' }, vars: { color: { var: '--color-ui-black-' + i } } });
  }
  // макет: «Скидки недели» c uppercase; сайт: текст уже заглавными, transform none
  fEls.push({ id: 'u1', kind: 'text', text: 'Скидки недели', box: { x: 300, y: 40, width: 90, height: 14 }, style: st('10px', { 'text-transform': 'uppercase' }) });
  pEls.push({ id: 200, tag: 'a', text: 'СКИДКИ НЕДЕЛИ', sel: 'a.u', selN: 1, box: { x: 300, y: 40, width: 90, height: 14 }, style: { ...st('10px'), 'letter-spacing': 'normal', color: 'rgb(27, 39, 44)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' } });
  // промо-тег: другой текст из данных («Кэшбек» → «Подарок»)
  fEls.push({ id: 'p1', kind: 'text', text: 'Кэшбек при покупке курса', box: { x: 300, y: 200, width: 160, height: 16 }, style: st('12px') });
  pEls.push({ id: 201, tag: 'span', text: 'Подарок при покупке курса', sel: 'span.p', selN: 1, box: { x: 300, y: 200, width: 166, height: 16 }, style: { ...st('12px'), 'letter-spacing': 'normal', color: 'rgb(27, 39, 44)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' } });
  // кнопка с текстом по центру: ширина надписи разная — отступ слева не сравнивать
  fEls.push({ id: 'k1', kind: 'box', name: 'button', box: { x: 600, y: 40, width: 187, height: 40 }, style: { layout: 'row', 'padding-left': '16px', 'padding-top': '10px', 'background-color': '#1B272C', 'border-radius': '8px' } });
  fEls.push({ id: 'k2', kind: 'text', text: 'Далее', box: { x: 670, y: 50, width: 47, height: 20 }, style: st('14px') });
  pEls.push({ id: 202, tag: 'button', sel: 'button.k', selN: 1, box: { x: 600, y: 40, width: 187, height: 40 }, style: { 'padding-left': '16px', 'padding-top': '10px', 'background-color': 'rgb(27, 39, 44)', 'border-radius': '8px', 'border-top-width': '0px' } });
  pEls.push({ id: 203, tag: 'span', text: 'Далее', sel: 'span.k', selN: 1, box: { x: 672, y: 50, width: 43, height: 20 }, style: { ...st('14px'), 'letter-spacing': 'normal', color: 'rgb(27, 39, 44)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' } });
  fs.writeFileSync(path.join(cr, 'figma', 'figma-1024.json'), JSON.stringify({ frame: { w: 1024, h: 900 }, elements: fEls }));
  fs.writeFileSync(path.join(cr, 'figma', 'variables.tsv'), [0, 1, 2, 3, 4, 5].map(i => `9:${i}@${'abcdef'[i].repeat(8)} | elements/button/text-${i} | Education | #1B272C`).join('\n') + '\n');
  fs.writeFileSync(path.join(cr, 'page', 'page-1024.json'), JSON.stringify({ width: 1024, cssVars: Object.fromEntries([0, 1, 2, 3, 4, 5].map(i => ['--color-ui-black-' + i, '#1b272c'])), elements: pEls }));
  node('match-figma.mjs', cr);
  const cf = JSON.parse(fs.readFileSync(path.join(cr, 'findings.json'), 'utf8'));
  const t = cf.findings.map(f => f.title).join(' | ');
  check('боевое: разные системы токенов — одна общая находка, без «тот же цвет, другой токен»', cf.findings.some(f => /разных системах токенов/.test(f.title)) && !cf.findings.some(f => /другой токен/.test(f.title)), t);
  check('боевое: текст заглавными = text-transform uppercase', !cf.findings.some(f => /Регистр/.test(f.title)), t);
  check('боевое: другой промо-текст из данных — не «Текст отличается»', !cf.findings.some(f => /Текст отличается/.test(f.title)), t);
  check('боевое: у текста по центру кнопки отступ слева не сравнивается', !cf.findings.some(f => /Отступ слева/.test(f.title)), t);
  check('боевое: «не найдено на сайте» — в «Что проверено», не находкой', !cf.findings.some(f => /не найдено/.test(f.title)), t);
  const { lintFigma } = await import(new URL('../scripts/figma-lint.mjs', import.meta.url));
  const texts = Array.from({ length: 3 }, (_, i) => ({ id: 'd' + i, kind: 'text', text: 'Чёрная пятница', box: { x: 0, y: i * 30, width: 90, height: 16 }, style: st('12px'), drawn: { styleWeight: 600, weight: 400, styleName: 'text micro (bold)' } }));
  const lo = lintFigma({ elements: texts }, { sid: '1024', w: 1024, state: 'default' });
  check('макет: нарисовано 400 при стиле 600 — находка в проверку макета', lo.some(o => /нарисован начертанием 400, а стиль «text micro \(bold\)» задаёт 600/.test(o.title) && o.count === 3), lo.map(o => o.title).join(' | '));
}

// --- второе боевое ревью (sticky-button): символы, режим компонента, рамка по сторонам
{
  const sr = path.join(tmp, 'sticky');
  fs.mkdirSync(path.join(sr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(sr, 'page'), { recursive: true });
  const st = (fsz, lh) => ({ 'font-size': fsz, 'font-weight': '600', 'line-height': lh, 'letter-spacing': '0px', color: '#2C2E34', 'text-transform': 'none' });
  const pst = (fsz, lh) => ({ ...st(fsz, lh), 'letter-spacing': 'normal', color: 'rgb(44, 46, 52)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' });
  fs.writeFileSync(path.join(sr, 'figma', 'figma-320.json'), JSON.stringify({ frame: { w: 320, h: 568 }, elements: [
    { id: 'hd', kind: 'text', text: 'Заголовок страницы', box: { x: 16, y: 20, width: 200, height: 28 }, style: st('24px', '28px') },
    { id: 'bar', kind: 'box', name: 'slot-modal/simple', path: 'вариант 3 / slot-modal/simple', box: { x: 0, y: 468, width: 320, height: 100 }, style: { layout: 'column', 'padding-top': '16px', 'background-color': '#FFFFFF', 'border-top-width': '1px', 'border-right-width': '1px', 'border-bottom-width': '1px', 'border-left-width': '1px', 'border-top-color': '#E3E3E3' } },
    { id: 't1', kind: 'text', text: 'до -60% скидка на все курсы', path: 'вариант 3 / slot-modal/simple / Description', box: { x: 24, y: 486, width: 177, height: 16 }, style: st('12px', '16px') }] }));
  fs.writeFileSync(path.join(sr, 'page', 'page-320.json'), JSON.stringify({ width: 320, elements: [
    { id: 1, tag: 'h1', text: 'Заголовок страницы', sel: 'h1', selN: 1, box: { x: 16, y: 20, width: 220, height: 32 }, style: pst('28px', '32px') },
    { id: 2, tag: 'div', sel: 'div.sticky.bottom-0', selN: 1, cls: 'sticky bottom-0', box: { x: 0, y: 468, width: 320, height: 100 }, style: { 'padding-top': '16px', 'background-color': 'rgb(255, 255, 255)', 'border-top-width': '1px', 'border-right-width': '0px', 'border-bottom-width': '0px', 'border-left-width': '0px', 'border-top-color': 'rgb(227, 227, 227)', 'border-radius': '0px' } },
    { id: 3, tag: 'p', text: 'до − 60% скидка на все курсы', sel: 'div.sticky p', selN: 1, box: { x: 24, y: 485, width: 215, height: 20 }, style: pst('14px', '20px') }] }));
  node('match-figma.mjs', sr, '--scope-site', 'sticky', '--scope-figma', 'slot-modal');
  const sf = JSON.parse(fs.readFileSync(path.join(sr, 'findings.json'), 'utf8')).findings, t = sf.map(f => f.title).join(' | ');
  check('компонент: текст с цифрами сопоставлен, несмотря на минус и пробел («до -60%» ↔ «до − 60%»)', sf.some(f => /Размер шрифта 14 px вместо 12 px/.test(f.title)), t);
  check('компонент: разница символов — находка «Другой символ»', sf.some(f => /Другой символ в тексте/.test(f.title)), t);
  check('компонент: вне компонента не сравнивается (заголовок страницы)', !sf.some(f => /Заголовок страницы|28 px вместо 24/.test(f.title + f.why)), t);
  check('рамка по сторонам: в макете со всех сторон, на сайте только сверху', sf.some(f => /рамка по сторонам/i.test(f.title)), t);
}

// --- разметка, подсвечивающая проблему (build-report): размер — размерной линией, отступ до края, отличающиеся символы
{
  const mr = path.join(tmp, 'marks');
  fs.mkdirSync(path.join(mr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(mr, 'page'), { recursive: true });
  for (const f of ['figma/figma-320.png', 'page/page-320.png']) fs.writeFileSync(path.join(mr, f), PNG.sync.write(new PNG({ width: 320, height: 600 })));
  const tx = (id, text, x, y, w) => ({ id, kind: 'text', text, box: { x, y, width: w, height: 16 }, style: { 'font-size': '12px', 'font-weight': '600', 'font-family': 'Inter' } });
  fs.writeFileSync(path.join(mr, 'figma', 'figma-320.json'), JSON.stringify({ frame: { w: 320, h: 600 }, elements: [
    { id: 'bar', kind: 'box', name: 'bar', box: { x: 0, y: 468, width: 320, height: 100 }, style: { 'background-color': '#FFFFFF' } },
    { id: 'in', kind: 'box', name: 'content', box: { x: 24, y: 484, width: 272, height: 20 }, style: { layout: 'row' } },
    tx('t', 'до -60% скидка на все курсы', 43, 486, 177)] }));
  fs.writeFileSync(path.join(mr, 'page', 'page-320.json'), JSON.stringify({ width: 320, elements: [
    { id: 1, tag: 'div', sel: 'div.sticky', box: { x: 24, y: 468, width: 272, height: 100 }, style: { 'background-color': 'rgb(255, 255, 255)' } },
    { id: 2, tag: 'p', sel: 'p.m-0', text: 'до − 60% скидка на все курсы', box: { x: 23, y: 485, width: 215, height: 20 }, style: { 'font-size': '14px', 'font-weight': '600', 'font-family': 'Inter' } }] }));
  const ev = { shot: '320', w: 320, a: [43, 486, 177, 16], b: [23, 485, 215, 20] };
  fs.writeFileSync(path.join(mr, 'findings.json'), JSON.stringify({ meta: { title: 't', widths: [{ id: '320', w: 320, aImg: 'figma/figma-320.png', bImg: 'page/page-320.png' }], coverage: [], method: '' }, matches: [], findings: [
    { id: 'S', kind: 'bug', severity: 'minor', category: 'size', title: 'Кнопка: высота 38 px вместо 40', why: '', widths: [320], props: [{ name: 'Высота кнопки', a: '[[ok:40 px]]', b: '[[bad:38 px]]' }], evidence: [{ ...ev }] },
    { id: 'I', kind: 'bug', severity: 'major', category: 'responsive', title: 'Текст выходит за левый край плашки', why: '', widths: [320], props: [{ name: 'Левый край текста', a: '43 px', b: '23 px' }], css: [{ prop: 'min-width', a: '0', b: 'auto' }], evidence: [{ ...ev }] },
    { id: 'C', kind: 'bug', severity: 'minor', category: 'text', title: 'Другой знак: «до − 60%» вместо «до -60%»', why: '', widths: [320], props: [], evidence: [{ ...ev }] }] }));
  node('build-report.mjs', mr);
  const D = JSON.parse(fs.readFileSync(path.join(mr, 'report.html'), 'utf8').match(/const DATA=(\{.*?\});\n/s)[1]);
  const mk = id => D.findings.find(f => f.id === id).evidence[0];
  check('пометки: размер — размерная линия с числом, без рамки элемента', mk('S').bMarks?.some(m => m.kind === 'size' && m.value === '38 px') && !mk('S').bMarks.some(m => m.kind === 'el'), JSON.stringify(mk('S').bMarks));
  check('пометки: «выходит за край» — отступ от края контейнера (сайт −1, макет — до контейнера под текст), min-width не рисуется',
    mk('I').bMarks?.[0]?.kind === 'inset' && mk('I').bMarks[0].value === '-1 px' && mk('I').aMarks?.[0]?.value === '24 px' && mk('I').aMarks[0].outline, JSON.stringify([mk('I').aMarks, mk('I').bMarks]));
  check('пометки: символы — только отличающийся фрагмент', mk('C').bMarks?.[0]?.kind === 'chars' && mk('C').bMarks[0].value === '«− »' && mk('C').aMarks?.[0]?.value === '«-»', JSON.stringify([mk('C').aMarks, mk('C').bMarks]));
}
// --- ссылки на макет: ближайший открывающийся слой, а не вся страница (перепроверка ai-response-ranking, правки дизайнера)
{
  const lr = path.join(tmp, 'links');
  fs.mkdirSync(path.join(lr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(lr, 'page'), { recursive: true });
  for (const f of ['figma/figma-1200.png', 'page/page-1200.png']) fs.writeFileSync(path.join(lr, f), PNG.sync.write(new PNG({ width: 1200, height: 900 })));
  const bx = (id, name, x, y, w, h) => ({ id, kind: 'box', name, box: { x, y, width: w, height: h }, style: {} });
  fs.writeFileSync(path.join(lr, 'figma', 'figma-1200.json'), JSON.stringify({ frame: { id: '1:1', name: 'HR: Страница вакансии', w: 1200, h: 900 }, elements: [
    bx('1:2', 'контент', 0, 0, 1200, 900), bx('10:1', 'карточка специалиста / Отклик', 60, 500, 750, 300), bx('I10:1;5:5', 'button / M / ai', 80, 700, 140, 32), bx('2:7', 'modal', 400, 100, 400, 300)] }));
  fs.writeFileSync(path.join(lr, 'page', 'page-1200.json'), JSON.stringify({ width: 1200, elements: [] }));
  const ev = n => ({ shot: '1200', w: 1200, a: [80, 700, 140, 32], b: [80, 700, 140, 32], figmaNode: n });
  const fnd = (id, n) => ({ id, kind: 'bug', severity: 'minor', category: 'radius', title: id, why: '', widths: [1200], props: [], evidence: [ev(n)] });
  fs.writeFileSync(path.join(lr, 'findings.json'), JSON.stringify({ meta: { title: 't', widths: [{ id: '1200', w: 1200, aImg: 'figma/figma-1200.png', bImg: 'page/page-1200.png' }] }, matches: [], findings: [
    fnd('frame', { id: '1:1', name: 'HR: Страница вакансии' }), fnd('inst', { id: 'I10:1;5:5', name: 'button' }), fnd('own', { id: '10:1', name: 'карточка' }), fnd('lib', { id: '1887:9457', name: 'модуль из другого файла' })] }));
  node('build-report.mjs', lr);
  const D = JSON.parse(fs.readFileSync(path.join(lr, 'report.html'), 'utf8').match(/const DATA=(\{.*?\});\n/s)[1]);
  const ln = id => { const n = D.findings.find(f => f.id === id).evidence[0].figmaNode; return n.link || n.id; };
  check('ссылка на всю страницу → карточка, в которой элемент', ln('frame') === '10:1', ln('frame'));
  check('слой внутри экземпляра (не открывается) → карточка', ln('inst') === '10:1', ln('inst'));
  check('ссылку агента на карточку и слой из другого файла не трогаем', ln('own') === '10:1' && ln('lib') === '1887:9457', `${ln('own')} ${ln('lib')}`);
}

// --- третье боевое ревью (ai-response-ranking): фрагменты макета, слои выше фрейма, рамка тенью, строчные
{
  const fr = path.join(tmp, 'frag');
  fs.mkdirSync(path.join(fr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(fr, 'page'), { recursive: true });
  const st = { 'font-size': '14px', 'font-weight': '400', 'line-height': '20px', 'letter-spacing': '0px', color: '#1B272C', 'text-transform': 'none' };
  const pst = { ...st, 'letter-spacing': 'normal', color: 'rgb(27, 39, 44)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' };
  // фрагмент «карточки»: две карточки с чипом «Git» — на сайте чипы «Git» в других местах; уникальный текст — «Карточки откликов»
  fs.writeFileSync(path.join(fr, 'figma', 'figma-1200-cards.json'), JSON.stringify({ frame: { w: 1200, h: 600 }, elements: [
    { id: 'h', kind: 'text', text: 'Карточки откликов', box: { x: 20, y: 20, width: 160, height: 20 }, style: st },
    { id: 'g1', kind: 'text', text: 'Git', box: { x: 20, y: 100, width: 24, height: 20 }, style: { ...st, 'font-size': '12px' } },
    { id: 'g2', kind: 'text', text: 'Git', box: { x: 20, y: 300, width: 24, height: 20 }, style: { ...st, 'font-size': '12px' } },
    { id: 'up', kind: 'text', text: 'Оценка соответствия', box: { x: 20, y: -300, width: 160, height: 20 }, style: { ...st, 'font-size': '20px' } },
    { id: 'lc', kind: 'text', text: 'файл.pdf', box: { x: 200, y: 20, width: 60, height: 20 }, style: { ...st, 'text-transform': 'lowercase' } },
    { id: 'bx', kind: 'box', name: 'card', box: { x: 400, y: 10, width: 200, height: 60 }, style: { 'background-color': '#FFFFFF', 'border-top-width': '1px', 'border-right-width': '1px', 'border-bottom-width': '1px', 'border-left-width': '1px', 'border-top-color': '#E3E3E3', 'padding-top': '0px', 'padding-left': '0px' } },
    { id: 'bt', kind: 'text', text: 'Похожие вакансии', box: { x: 420, y: 30, width: 120, height: 20 }, style: st },
    { id: 'a1', kind: 'text', text: 'Анализировать', box: { x: 800, y: 120, width: 100, height: 20 }, style: st },
    { id: 'a2', kind: 'text', text: 'Анализировать', box: { x: 800, y: 320, width: 100, height: 20 }, style: st }] }));
  fs.writeFileSync(path.join(fr, 'page', 'page-1200.json'), JSON.stringify({ width: 1200, elements: [
    { id: 1, tag: 'h2', text: 'Карточки откликов', sel: 'h2', selN: 1, box: { x: 20, y: 20, width: 160, height: 20 }, style: pst },
    { id: 2, tag: 'span', text: 'Git', sel: 'span.chip', selN: 3, box: { x: 500, y: 900, width: 24, height: 20 }, style: { ...pst, 'font-size': '14px' } },
    { id: 3, tag: 'span', text: 'Оценка соответствия', sel: 'span.t', selN: 1, box: { x: 20, y: 40, width: 160, height: 20 }, style: { ...pst, 'font-size': '16px' } },
    { id: 4, tag: 'span', text: 'файл.pdf', sel: 'span.f', selN: 1, box: { x: 200, y: 20, width: 60, height: 20 }, style: pst },
    { id: 5, tag: 'div', sel: 'div.card', selN: 1, box: { x: 400, y: 10, width: 200, height: 60 }, style: { 'background-color': 'rgb(255, 255, 255)', 'border-top-width': '0px', 'border-right-width': '0px', 'border-bottom-width': '0px', 'border-left-width': '0px', 'box-shadow': 'rgb(227, 227, 227) 0px 0px 0px 1px', 'padding-top': '0px', 'padding-left': '0px', 'border-radius': '0px' } },
    { id: 6, tag: 'span', text: 'Похожие вакансии', sel: 'span.b', selN: 1, box: { x: 420, y: 30, width: 120, height: 20 }, style: pst },
    { id: 7, tag: 'span', text: 'Анализировать', sel: 'span.ai', selN: 2, box: { x: 800, y: 320, width: 100, height: 20 }, style: { ...pst, 'font-size': '16px' } },
    { id: 8, tag: 'span', text: 'Анализировать', sel: 'span.ai', selN: 2, box: { x: 800, y: 1500, width: 100, height: 20 }, style: pst }] }));
  fs.writeFileSync(path.join(fr, 'state-plan.json'), JSON.stringify({ states: [{ id: '1200-cards', kind: 'fragment', pageShot: '1200' }] }));
  node('match-figma.mjs', fr);
  const ff = JSON.parse(fs.readFileSync(path.join(fr, 'findings.json'), 'utf8')), t = ff.findings.map(f => f.title).join(' | ');
  check('фрагмент: нет своего снимка — сравнивается с основным снимком ширины', ff.meta.widths.some(w => w.id === '1200-cards' && w.fragment), JSON.stringify(ff.meta.widths));
  check('фрагмент: неуникальные тексты («Git» из разных карточек) не сопоставляются', !/Git/.test(t), t);
  check('фрагмент: повторяющийся текст («Анализировать» в каждой карточке) сопоставляется по месту, когда фрагмент привязан', /Размер шрифта 16 px вместо 14 px у «Анализировать»/.test(t) && (t.match(/Анализировать/g) || []).length === 1, t);
  check('слой выше видимой части фрейма не сравнивается', !/Оценка соответствия/.test(t), t);
  check('строчными набранный текст = text-transform: lowercase', !/Регистр/.test(t), t);
  check('рамка тенью (box-shadow 0 0 0 1px) = рамка 1 px', !/рамк/i.test(t), t);
  const { lintFigma } = await import(new URL('../scripts/figma-lint.mjs', import.meta.url)); void lintFigma;
}
// --- ai-response-ranking: скругление у невидимой обёртки, почти прозрачная обводка, фрагмент — пары вне общего сдвига
{
  const r = path.join(tmp, 'frag2');
  fs.mkdirSync(path.join(r, 'figma'), { recursive: true }); fs.mkdirSync(path.join(r, 'page'), { recursive: true });
  const st = { 'font-size': '14px', 'font-weight': '400', 'line-height': '20px', 'letter-spacing': '0px', color: '#1B272C', 'text-transform': 'none' };
  const pst = { ...st, 'letter-spacing': 'normal', color: 'rgb(27, 39, 44)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' };
  const T = (id, text, x, y) => ({ id, kind: 'text', text, box: { x, y, width: 120, height: 20 }, style: st });
  const PT = (id, text, x, y) => ({ id, tag: 'span', text, sel: 'span.' + id, selN: 1, box: { x, y, width: 120, height: 20 }, style: pst });
  fs.writeFileSync(path.join(r, 'figma', 'figma-1200.json'), JSON.stringify({ frame: { w: 1200, h: 3000 }, elements: [
    { id: 'wrap', kind: 'box', name: 'контент', box: { x: 60, y: 0, width: 750, height: 600 }, style: { layout: 'column', 'border-radius': '0px', 'padding-top': '0px', 'padding-left': '0px' } },
    T('a', 'Отклики на вакансию', 80, 20),
    { id: 'card', kind: 'box', name: 'карточка', box: { x: 60, y: 700, width: 750, height: 200 }, style: { 'background-color': '#FFFFFF', 'border-top-width': '1px', 'border-right-width': '1px', 'border-bottom-width': '1px', 'border-left-width': '1px', 'border-top-color': '#182E391A', 'padding-top': '0px', 'padding-left': '0px' } },
    T('b', 'Потенциальные кандидаты', 80, 720),
    { ...T('c', 'Профессиональные навыки', 80, 300), box: { x: 80, y: 300, width: 160, height: 16 }, style: { ...st, 'font-size': '12px', 'line-height': '16px' } }, T('d', 'Пройдены тесты', 80, 340)] }));
  fs.writeFileSync(path.join(r, 'page', 'page-1200.json'), JSON.stringify({ width: 1200, elements: [
    { id: 1, tag: 'section', sel: 'section.s', selN: 1, box: { x: 60, y: 0, width: 750, height: 600 }, style: { 'background-color': 'rgb(255, 255, 255)', 'border-radius': '24px', 'border-top-width': '0px', 'padding-top': '0px', 'padding-left': '0px' } },
    PT('a', 'Отклики на вакансию', 80, 20),
    { id: 2, tag: 'div', sel: 'div.card', selN: 1, box: { x: 60, y: 700, width: 750, height: 200 }, style: { 'background-color': 'rgb(255, 255, 255)', 'border-top-width': '0px', 'border-right-width': '0px', 'border-bottom-width': '0px', 'border-left-width': '0px', 'padding-top': '0px', 'padding-left': '0px', 'border-radius': '0px' } },
    PT('b', 'Потенциальные кандидаты', 80, 720),
    { ...PT('c', 'Профессиональные навыки', 80, 296), box: { x: 80, y: 296, width: 160, height: 24 }, style: { ...pst, 'font-size': '12px', 'line-height': '24px' } }, PT('d', 'Пройдены тесты', 80, 340)] }));
  node('match-figma.mjs', r);
  const t2 = JSON.parse(fs.readFileSync(path.join(r, 'findings.json'), 'utf8')).findings.map(f => f.title).join(' | ');
  check('скругление у обёртки без фона и обводки в макете не сравнивается', !/Скругление/.test(t2), t2);
  check('почти прозрачная обводка в макете (10 %) против её отсутствия на сайте — не находка', !/рамк/i.test(t2), t2);
  check('межстрочный у текста в одну строку, если ниже ничего не сдвинулось, — не находка', !/Межстрочный/.test(t2), t2);
}

// --- варианты шаблона: брендированная карточка на сайте не сравнивается с обычной в макете (career.habr.com)
{
  const vr = path.join(tmp, 'variant');
  fs.mkdirSync(path.join(vr, 'figma'), { recursive: true }); fs.mkdirSync(path.join(vr, 'page'), { recursive: true });
  const st = { 'font-size': '14px', 'font-weight': '600', 'line-height': '20px', 'letter-spacing': '0px', color: '#FFFFFF', 'text-transform': 'none' };
  fs.writeFileSync(path.join(vr, 'figma', 'figma-1024.json'), JSON.stringify({ frame: { w: 1024, h: 900 }, elements: [
    { id: 'c', kind: 'box', name: 'Карточка вакансии', box: { x: 12, y: 100, width: 676, height: 300 }, style: { 'background-color': '#FFFFFF', 'border-top-color': '#182E391A', 'border-top-width': '1px', 'border-radius': '16px', 'padding-top': '0px', 'padding-left': '0px' } },
    { id: 't', kind: 'text', text: 'Откликнуться', box: { x: 500, y: 350, width: 100, height: 20 }, style: st }] }));
  fs.writeFileSync(path.join(vr, 'page', 'page-1024.json'), JSON.stringify({ width: 1024, elements: [
    { id: 1, tag: 'div', sel: 'div.section-box--branded', selN: 1, cls: 'section-box--branded', box: { x: 12, y: 100, width: 676, height: 300 }, style: { 'background-color': 'color(srgb-linear 0.80 0.85 0.95)', 'border-top-color': 'rgb(41, 133, 222)', 'border-top-width': '2px', 'border-radius': '16px', 'padding-top': '0px', 'padding-left': '0px' } },
    { id: 2, tag: 'span', text: 'Откликнуться', sel: 'span.l', selN: 1, cls: 'l', box: { x: 500, y: 350, width: 100, height: 20 }, style: { ...st, 'letter-spacing': 'normal', color: 'rgb(255, 255, 255)', 'background-color': 'rgba(0, 0, 0, 0)', 'border-top-width': '0px' } }] }));
  node('match-figma.mjs', vr);
  const vf = JSON.parse(fs.readFileSync(path.join(vr, 'findings.json'), 'utf8')).findings;
  check('варианты: брендированная карточка ≠ обычная — без находок про рамку и фон', !vf.some(f => /рамк|Фон/.test(f.title)), vf.map(f => f.title).join(' | '));
}

// --- сборка отчёта (без картинок макета: подставляем пустые)
for (const f of ['figma/figma-1024.png', 'page/page-1024.png']) fs.writeFileSync(path.join(run, f), PNG.sync.write(new PNG({ width: 1024, height: 4500 })));
const out = node('build-report.mjs', run);
check('отчёт собирается', fs.existsSync(path.join(run, 'report.html')), out);
const html = fs.readFileSync(path.join(run, 'report.html'), 'utf8');
check('в отчёте есть переключатель сторон и блок для разработчика', html.includes('id="sideSwitch"') && html.includes('function devHTML'));

// --- несколько пар «страница ↔ макет» в одном отчёте (merge-pages.mjs)
{
  const multi = path.join(tmp, 'multi');
  for (const p of ['one', 'two']) fs.cpSync(run, path.join(multi, p), { recursive: true });
  node('merge-pages.mjs', multi, 'two', 'one');
  const M = JSON.parse(fs.readFileSync(path.join(multi, 'findings.json'), 'utf8'));
  check('страницы: порядок, префиксы id и кадров, картинки из подпапок', M.meta.pages.map(p => p.id).join() === 'two,one' && M.findings[0].id.startsWith('p1-') && M.findings[0].page === 'two'
    && M.findings[0].evidence[0].shot.startsWith('two/') && M.meta.widths[0].aImg.startsWith('two/figma/'), JSON.stringify(M.meta.widths[0]));
  node('build-report.mjs', multi);
  check('страницы: отчёт собирается', fs.existsSync(path.join(multi, 'report.html')));
}

// --- разметка дизайнера → эталон → перепроверка (feedback.mjs, bench.mjs)
{
  const fsAll = JSON.parse(fs.readFileSync(path.join(run, 'findings.json'), 'utf8')).findings;
  const [f1, f2, f3] = fsAll;
  const fb = { schema: 'design-review-feedback/1', run: { dir: run, skillVersion: 'test' }, metrics: { precision: 0.5, recall: 0.5, tp: 1, fp: 1, missed: 1, reviewedFully: true },
    findings: fsAll.filter(f => f !== f3).map(f => ({ ...f, source: 'auto', verdict: f === f1 ? 'bug' : f === f2 ? 'notbug' : null, reason: f === f2 ? 'data' : null })),
    missed: [{ id: 'H-01', title: 'пропуск', images: ['data:image/png;base64,' + PNG.sync.write(new PNG({ width: 4, height: 4 })).toString('base64')] }] };
  const fbFile = path.join(tmp, 'feedback.json'), bench = path.join(tmp, 'bench');
  fs.writeFileSync(fbFile, JSON.stringify(fb));
  node('feedback.mjs', fbFile, '--bench', bench, '--name', 'case1');
  const labFile = path.join(bench, 'case1', 'labels.json'), lab = JSON.parse(fs.readFileSync(labFile, 'utf8'));
  const lbl = id => lab.items.find(i => i.autoId === id)?.label;
  check('разметка: подтверждённая → tp, «Не баг» → fp, убранная из отчёта → fp агента', lbl(f1.id) === 'tp' && lbl(f2.id) === 'fp' && lab.items.find(i => i.autoId === f3.id)?.reason === 'dropped-by-agent', JSON.stringify(lab.items.map(i => [i.autoId, i.label, i.reason])));
  check('разметка: скриншот пропуска сохранён файлом', fs.existsSync(path.join(bench, 'case1', lab.missed[0].images[0])));
  // пропуск указывает на место третьей находки — перепроверка должна засчитать его найденным
  lab.missed[0].target = { shot: f3.evidence[0].shot, b: f3.evidence[0].b, a: f3.evidence[0].a }; lab.missed[0].kind = 'auto';
  fs.writeFileSync(labFile, JSON.stringify(lab));
  const out = node('bench.mjs', '--bench', bench);
  check('перепроверка: верные на месте, пропуск с target найден', /верные 1\/1/.test(out) && /пропуски найдены 1\/1/.test(out), out);
}

// --- начертание по переопределению символов (промо-тег курсов: стиль «text micro (bold)», символы — Regular)
{
  const { effectiveTextStyle } = await import(new URL('../scripts/figma-lib.mjs', import.meta.url));
  const tag = { characters: 'Чёрная пятница', style: { fontFamily: 'Inter', fontPostScriptName: 'Inter-SemiBold', fontStyle: 'Semi Bold', fontWeight: 600, fontSize: 12 },
    characterStyleOverrides: Array(14).fill(2), styleOverrideTable: { 2: { fontFamily: 'Inter', fontPostScriptName: null, fontStyle: 'Regular', fontWeight: 600, semanticWeight: 'NORMAL' } } };
  check('figma-export: переопределение Regular важнее стиля SemiBold', effectiveTextStyle(tag).weight === 400, JSON.stringify(effectiveTextStyle(tag).weight));
  const part = { ...tag, characters: 'До конца акции 24:00:00', characterStyleOverrides: Array(15).fill(2) };
  check('figma-export: частичное переопределение (меньше половины) не меняет стиль', effectiveTextStyle({ ...part, characterStyleOverrides: Array(8).fill(2) }).weight === 600);
  check('figma-export: без переопределений — fontWeight слоя', effectiveTextStyle({ characters: 'Далее', style: { fontWeight: 600, fontPostScriptName: 'Inter-SemiBold' } }).weight === 600);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} проверок не прошли` : '\nВсе проверки прошли');
process.exit(failed ? 1 : 0);
