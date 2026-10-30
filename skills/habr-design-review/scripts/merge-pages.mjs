// Несколько пар «страница ↔ макет» в одном отчёте.
// node scripts/merge-pages.mjs <run> [<страница> …] [--title "…"] [--keep-first-ids]
//
// Каждая пара — обычный прогон в подпапке: <run>/<страница>/{figma,page,findings.json,findings.auto.json}
// (capture → match-figma → чистка агентом — как для одной страницы). Скрипт собирает их в <run>/findings.json:
//  - meta.pages: [{id, title, testUrl, figmaUrl, state, dir}] — в отчёте переключатель и фильтр страниц,
//    ссылки на сайт и слои Figma — из своей пары;
//  - кадры: id «<страница>/<ширина>», картинки — «<страница>/figma/…»;
//  - находки: id «p<N>-<id>» (srcId — исходный id в подпрогоне), page — id страницы.
// Порядок страниц — как в аргументах, иначе по алфавиту папок. Затем: node build-report.mjs <run>.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const [run, ...order] = pos;
if (!run) { console.error('usage: merge-pages.mjs <run> [<страница> …] [--title "…"]'); process.exit(1); }
const subs = (order.length ? order : fs.readdirSync(run).filter(d => fs.statSync(path.join(run, d)).isDirectory()).sort())
  .filter(d => fs.existsSync(path.join(run, d, 'findings.json')));
if (!subs.length) { console.error('Нет подпапок с findings.json в', run); process.exit(1); }

const pages = [], widths = [], findings = [], matches = [], coverage = [];
let first = null;
subs.forEach((id, i) => {
  const D = JSON.parse(fs.readFileSync(path.join(run, id, 'findings.json'), 'utf8')), m = D.meta;
  first ||= m;
  // --keep-first-ids: id первой страницы без префикса — когда страницы добавляются к уже размеченному отчёту
  // (решения в браузере и в «Сохранить с решениями» привязаны к старым id).
  const title = m.title || id, pre = i === 0 && argv.includes("--keep-first-ids") ? "" : `p${i + 1}-`;
  pages.push({ id, n: i + 1, title, testUrl: m.testUrl, figmaUrl: m.figmaUrl, state: m.state, dir: path.resolve(run, id) });
  for (const w of m.widths) {
    const r = { ...w, id: `${id}/${w.id ?? w.w}`, page: id };
    for (const k of ['aImg', 'bImg', 'figmaImg', 'pageImg', 'diffImg']) if (w[k]) r[k] = `${id}/${w[k]}`;
    widths.push(r);
  }
  for (const f of D.findings) findings.push({ ...f, id: pre + f.id, srcId: f.id, page: id, evidence: (f.evidence || []).map(e => ({ ...e, shot: `${id}/${e.shot ?? e.w}` })) });
  for (const x of D.matches || []) matches.push({ ...x, area: `${title} · ${x.area}` });
  for (const c of m.coverage || []) coverage.push({ ...c, area: `${title} · ${c.area}` });
});
// Одинаковые находки проверки макета (MK) на разных страницах — одна (оставляем первую, остальные id — в mergedFrom)
{
  const seen = new Map();
  for (let i = findings.length - 1; i >= 0; i--) { const f = findings[i]; if (f.kind !== 'mockup') continue; }
  const keep = [];
  for (const f of findings) {
    if (f.kind !== 'mockup') { keep.push(f); continue; }
    const k = f.title.replace(/ · d+ (слоёв|блоков)$/, '');
    if (seen.has(k)) { const m = seen.get(k); (m.mergedFrom ||= []).push(f.id); m.widths = [...new Set([...(m.widths || []), ...(f.widths || [])])]; continue; }
    seen.set(k, f); keep.push(f);
  }
  findings.length = 0; findings.push(...keep);
}
// Дата и id прогона — как у уже собранного отчёта: решения дизайнера в браузере привязаны к ним, пересборка на другой
// день не должна «терять» комментарии
const prevMeta = (() => { try { return JSON.parse(fs.readFileSync(path.join(run, 'findings.json'), 'utf8')).meta || {}; } catch { return {}; } })();
const out = {
  meta: { ...first, runId: prevMeta.runId || path.basename(path.resolve(run)), title: opt('title') || `${pages.length} стр.: ${pages.map(p => p.title).join(' · ')}`, state: pages.map(p => `${p.title}: ${p.state || '—'}`).join('; '),
    testUrl: pages[0].testUrl, figmaUrl: pages[0].figmaUrl, pages, widths, coverage, createdAt: prevMeta.pages ? (prevMeta.createdAt || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10) },
  findings, matches,
};
fs.writeFileSync(path.join(run, 'findings.json'), JSON.stringify(out, null, 1));
console.log(`${pages.length} стр., ${findings.length} находок → ${path.join(run, 'findings.json')}`);
for (const p of pages) console.log(`  p${p.n} ${p.id}: ${p.title} — ${findings.filter(f => f.page === p.id).length} находок`);
