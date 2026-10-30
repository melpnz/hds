// Перепроверка от начала до конца на локальной странице: ревью «до» → разработчики поправили часть → recheck.
// Снимает страницу capture.mjs (нужен playwright), ~30 с. node tests/recheck-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dr-recheck-'));
const run = (script, ...a) => execFileSync(process.execPath, [path.join(skill, 'scripts', script), ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
let fails = 0; const check = (name, ok, info = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : '  ← ' + info}`); if (!ok) fails++; };

const page = body => `<!doctype html><meta charset="utf-8"><style>body{font:14px/20px Arial;margin:0;padding:40px}
.panel{display:flex;gap:12px}.ai{border:0;color:#fff;background:#8164F7}.title{margin:0}</style>${body}`;
const before = page(`
<div class="panel" style="flex-direction:column;margin-bottom:24px"><button class="ai" style="border-radius:8px;padding:4px 7px">Анализировать</button><span class="sort">Сначала новые</span></div>
<style>.title{font-size:24px;line-height:31px}</style><h2 class="title">Отклики на вакансию</h2>
<p class="hint" style="line-height:24px">Экономьте время</p><div class="box"><span class="box-title">Оценка соответствия кандидата</span></div>`);
// поправили: панель в строку и без отступа, скругление, отступы кнопки, текст; кегль заголовка — только на широких; межстрочный подсказки — нет
const after = page(`
<div class="panel" style="flex-direction:row;margin-bottom:0"><button class="ai" style="border-radius:12px;padding:4px 8px">Анализировать</button><span class="sort">Сначала новые</span></div>
<style>.title{font-size:24px;line-height:31px}@media (min-width:1000px){.title{font-size:20px;line-height:24px}}</style><h2 class="title">Отклики на вакансию</h2>
<p class="hint" style="line-height:24px">Экономьте время</p><div class="box"><span class="box-title">Анализ соответствия</span></div>`);

const site = path.join(tmp, 'site.html'), url = pathToFileURL(site).href;
const orig = path.join(tmp, 'orig'), next = path.join(tmp, 'recheck');
fs.mkdirSync(path.join(orig, 'figma'), { recursive: true });
fs.writeFileSync(site, before);
run('capture.mjs', '--url', url, '--out', path.join(orig, 'page'), '--widths', '1200,768', '--no-profile');
// исходное ревью: находки с селекторами и CSS, решения дизайнера
const widths = [1200, 768].map(w => { fs.copyFileSync(path.join(orig, 'page', `page-${w}.png`), path.join(orig, 'figma', `figma-${w}.png`)); return { id: String(w), w, state: 'default', aImg: `figma/figma-${w}.png`, bImg: `page/page-${w}.png` }; });
const els = w => JSON.parse(fs.readFileSync(path.join(orig, 'page', `page-${w}.json`), 'utf8')).elements;
const boxOf = (w, pred) => { const e = els(w).find(pred); return e ? [e.box.x, e.box.y, e.box.width, e.box.height] : [40, 40, 100, 20]; };
const F = (id, title, selector, css, find, ws = [1200, 768]) => ({ id, kind: 'bug', severity: 'major', category: 'spacing', area: 'Панель', title, widths: ws, selector, css,
  evidence: ws.map(w => ({ shot: String(w), w, a: boxOf(w, find), b: boxOf(w, find) })) });
const findings = [
  F('DR-01', 'Панель столбиком', 'div.panel', [{ prop: 'flex-direction', b: 'column', a: 'row' }, { prop: 'margin-bottom', b: '24px', a: '0' }], e => /Анализировать/.test(e.fullText || '') && e.tag === 'button'),
  F('DR-02', 'Скругление 8 вместо 12', 'button.ai', [{ prop: 'border-radius', b: '8px', a: '12px' }], e => e.tag === 'button'),
  F('DR-03', 'Отступы кнопки 7 вместо 8', 'button.ai', [{ prop: 'padding', b: '4px 7px', a: '4px 8px' }], e => e.tag === 'button'),
  F('DR-04', 'Кегль заголовка 24 вместо 20', 'h2.title', [{ prop: 'font-size', b: '24px', a: '20px' }], e => e.tag === 'h2'),
  F('DR-05', 'Межстрочный подсказки 24 вместо 20', 'p.hint', [{ prop: 'line-height', b: '24px', a: '20px' }], e => e.tag === 'p'),
  F('DR-06', 'Заголовок блока: другой текст', 'span.box-title', [{ prop: 'content', b: '"Оценка соответствия кандидата"', a: '"Анализ соответствия"' }], e => /Оценка/.test(e.text || '')),
  F('DR-07', 'Сортировка: нативный select', null, [], e => /Сначала/.test(e.text || '')),
  F('DR-08', 'Не баг — не перепроверять', 'span.sort', [{ prop: 'color', b: '#000', a: '#111' }], e => /Сначала/.test(e.text || '')),
];
fs.writeFileSync(path.join(orig, 'findings.json'), JSON.stringify({ meta: { title: 'Тест', testUrl: url, createdAt: '2026-10-26', widths }, findings, matches: [] }));
fs.writeFileSync(path.join(orig, 'decisions.json'), JSON.stringify({ decisions: { 'DR-01': { v: 'bug' }, 'DR-02': { v: 'bug' }, 'DR-03': { v: 'ok' }, 'DR-04': { v: 'bug' }, 'DR-05': { v: 'bug' }, 'DR-06': { v: 'bug' }, 'DR-07': { v: 'bug' }, 'DR-08': { v: 'notbug' } } }));

// перепроверка
const pl = run('recheck.mjs', 'plan', orig, next);
check('план: «Баг» и «Допустимо», без «Не баг»', /7 находок \(Баг 6, Допустимо 1\)/.test(pl) && /decisions\.json/.test(pl), pl);
const P = JSON.parse(fs.readFileSync(path.join(next, 'recheck-plan.json'), 'utf8'));
check('план: команда съёмки с --measure', /--measure/.test(P.pages[0].capture), P.pages[0].capture);
fs.writeFileSync(site, after);
run('capture.mjs', '--url', url, '--out', path.join(P.pages[0].dir, 'page'), '--widths', '1200,768', '--no-profile', '--measure', path.join(P.pages[0].dir, 'measure.json'));
const ck = run('recheck.mjs', 'check', next);
const R = JSON.parse(fs.readFileSync(path.join(next, 'recheck.json'), 'utf8')), st = id => R.items.find(i => i.id === id)?.status;
check('контейнер без фона (панель) замерен — исправлено', st('DR-01') === 'fixed', JSON.stringify(R.items.find(i => i.id === 'DR-01')?.per));
check('скругление — исправлено', st('DR-02') === 'fixed', st('DR-02'));
check('padding из сторон — исправлено (Допустимо, но поправили)', st('DR-03') === 'fixed', JSON.stringify(R.items.find(i => i.id === 'DR-03')?.per));
check('кегль только на 1200 — исправлено не до конца', st('DR-04') === 'partial' && R.items.find(i => i.id === 'DR-04').wBad.includes(768), JSON.stringify(R.items.find(i => i.id === 'DR-04')));
check('межстрочный не поменяли — не исправлено', st('DR-05') === 'not-fixed', st('DR-05'));
check('текст — исправлено', st('DR-06') === 'fixed', JSON.stringify(R.items.find(i => i.id === 'DR-06')?.per));
check('без CSS — смотреть глазами', st('DR-07') === 'eyes', st('DR-07'));
const O = JSON.parse(fs.readFileSync(path.join(next, 'findings.json'), 'utf8'));
check('отчёт: режим перепроверки, «Исправлено» отдельно, кадры «было»', O.meta.mode === 'recheck' && O.findings.filter(f => f.kind === 'fixed').length === 4 && O.findings.every(f => f.evidence.every(e => e.c)) && O.meta.widths.every(w => w.cImg), JSON.stringify(O.findings.map(f => [f.id, f.kind, f.recheck])));
// агент посмотрел «глазами» и поставил статус сам — пересчёт его не затирает; новая поломка остаётся
O.findings.find(f => f.origin === 'DR-07').agent = true; O.findings.find(f => f.origin === 'DR-07').recheck = 'fixed'; O.findings.find(f => f.origin === 'DR-07').kind = 'fixed';
O.findings.push({ id: 'RC-N1', kind: 'bug', recheck: 'new', agent: true, severity: 'major', category: 'responsive', area: 'Новая поломка', title: 'Сортировка сжата', widths: [768], evidence: [] });
fs.writeFileSync(path.join(next, 'findings.json'), JSON.stringify(O));
run('recheck.mjs', 'check', next);
const O2 = JSON.parse(fs.readFileSync(path.join(next, 'findings.json'), 'utf8'));
check('повторный check сохраняет решения агента и новые поломки', O2.findings.find(f => f.origin === 'DR-07')?.recheck === 'fixed' && O2.findings.some(f => f.id === 'RC-N1') && O2.findings.filter(f => f.origin === 'DR-07').length === 1, JSON.stringify(O2.findings.map(f => [f.id, f.recheck])));
const rep = run('build-report.mjs', next);
check('отчёт перепроверки собирается', fs.existsSync(path.join(next, 'report.html')), rep);
if (!process.env.KEEP) fs.rmSync(tmp, { recursive: true, force: true }); else console.log(tmp);
console.log(fails ? `${fails} проверок не прошли` : 'Перепроверка: все проверки прошли');
process.exit(fails ? 1 : 0);
