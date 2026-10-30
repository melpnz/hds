// Приём разметки дизайнера (feedback-*.json из отчёта) → эталон в bench/<case>/ для дообучения и перепроверки навыка.
// node scripts/feedback.mjs <feedback.json> [--run <папка прогона>] [--name <case>] [--bench <папка эталонов>]
//
// Что делает:
//  1. Печатает сводку: точность/полнота, лишние находки по причинам, пропущенное (со ссылками и скриншотами).
//  2. Кладёт в bench/<case>/ данные прогона, нужные для перепроверки без сети: figma/*.json, page/*.json,
//     findings.auto.json (выход автосопоставления), feedback.json (без картинок), missed/*.png|jpg.
//  3. Пишет labels.json — разметку автонаходок: tp (подтверждена), fp (лишняя; кем: дизайнер или агент при разборе),
//     unknown (не решено / «Обсудить»), mockup / scope (ошибка в макете / другой функционал — вне метрик), плюс пропуски.
//     Пропускам агент потом дописывает target {shot, b, props} — где на снимке это место, — тогда bench.mjs проверяет,
//     научился ли навык их находить.
//  4. Добавляет строку в bench/history.jsonl (метрики отчёта — как их увидел дизайнер).
// Отчёт из нескольких страниц (merge-pages.mjs): каждая страница — свой эталон bench/<прогон>-<страница>/.
import fs from 'node:fs';
import path from 'node:path';
import { BENCH, sameFinding, pct, ratio } from './bench-lib.mjs';

const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const file = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!file) { console.error('usage: feedback.mjs <feedback.json> [--run <dir>] [--name <case>] [--bench <dir>]'); process.exit(1); }
const fb = JSON.parse(fs.readFileSync(file, 'utf8'));
if (fb.schema !== 'design-review-feedback/1') { console.error('Это не файл разметки отчёта (schema ≠ design-review-feedback/1)'); process.exit(1); }
const runDir = opt('run') || fb.run?.dir;
if (!runDir || !fs.existsSync(runDir)) { console.error(`Папка прогона не найдена: ${runDir || '(не указана)'} — укажите --run`); process.exit(1); }
const benchRoot = opt('bench') || BENCH, baseName = opt('name') || path.basename(runDir);

// метрики по набору находок (для страницы многостраничного отчёта; у одностраничного — берутся из отчёта)
function metricsOf(findings, missed, reviewedFully) {
  const des = findings.filter(f => f.kind === 'bug' && f.foundBy === 'designer' && f.verdict !== 'notbug');
  missed = [...missed, ...des];
  const bugs = findings.filter(f => f.kind === 'bug' && f.foundBy !== 'designer'), tp = bugs.filter(f => ['bug', 'ok'].includes(f.verdict)).length, fp = bugs.filter(f => f.verdict === 'notbug').length;
  const P = ratio(tp, tp + fp), R = ratio(tp, tp + missed.length);
  const src = s => { const t = bugs.filter(f => f.source === s && ['bug', 'ok'].includes(f.verdict)).length, n = bugs.filter(f => f.source === s && f.verdict === 'notbug').length; return { tp: t, fp: n, precision: ratio(t, t + n) }; };
  return { tp, fp, missed: missed.length, pending: bugs.filter(f => !f.verdict).length, precision: P, recall: R, f1: P && R ? +(2 * P * R / (P + R)).toFixed(3) : null, reviewedFully, bySource: { auto: src('auto'), agent: src('agent') } };
}

function ingest({ srcDir, name, findings, missed: missedIn0, metrics: m, page, otherDecided = [] }) {
  const dir = path.join(benchRoot, name);
  // Найдено дизайнером и оформлено полноценной находкой (foundBy:'designer') — это пропуск ИИ, а не верная находка:
  // в пропуски, место на снимке — из её свидетельства (target готов сразу). Ручная запись с тем же заголовком — дубль.
  const nt = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
  // старые отчёты не выгружали foundBy: находка с тем же заголовком, что и пропуск, — это пропуск, оформленный находкой
  findings = findings.map(f => f.foundBy || !missedIn0.some(x => nt(x.title) === nt(f.title)) ? f : { ...f, foundBy: 'designer' });
  const designer = findings.filter(f => f.kind === 'bug' && f.foundBy === 'designer' && f.verdict !== 'notbug');
  const missedIn = [...missedIn0.filter(x => !designer.some(f => nt(f.title) === nt(x.title))),
    ...designer.map(f => ({ id: f.id, title: f.title, desc: f.short || f.why, category: f.category, widths: f.widths, images: [], foundBy: 'designer',
      target: f.evidence?.[0] ? { shot: String(f.evidence[0].shot), b: f.evidence[0].b, a: f.evidence[0].a, props: [...new Set((f.css || []).map(c => c.prop))] } : null }))];
  findings = findings.filter(f => !(f.kind === 'bug' && f.foundBy === 'designer'));
  // --- 1. данные прогона для перепроверки (только json: картинки не нужны автосопоставлению)
  // страница без макета (только поведение по спеке) — эталона для автоматики нет, пропускаем
  if (!fs.existsSync(path.join(srcDir, 'figma'))) { console.log(`\n${name}: нет макета (figma/) — страница без сравнения с макетом, эталон не создаётся`); return null; }
  for (const sub of ['figma', 'page']) {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
    if (fs.existsSync(path.join(srcDir, sub))) for (const f of fs.readdirSync(path.join(srcDir, sub)).filter(f => /\.(json|tsv)$/.test(f))) fs.copyFileSync(path.join(srcDir, sub, f), path.join(dir, sub, f));
  }
  const statePlan = path.join(srcDir, 'state-plan.json');
  if (fs.existsSync(statePlan)) fs.copyFileSync(statePlan, path.join(dir, 'state-plan.json'));
  const autoFile = ['findings.auto.json', 'findings.json'].map(f => path.join(srcDir, f)).find(fs.existsSync);
  const auto = autoFile ? JSON.parse(fs.readFileSync(autoFile, 'utf8')).findings.filter(f => f.auto !== false && /^AUTO-/.test(f.id)) : [];
  if (autoFile) fs.copyFileSync(autoFile, path.join(dir, 'findings.auto.json'));

  // --- 2. картинки пропусков — отдельными файлами (их смотрит агент при разборе)
  fs.mkdirSync(path.join(dir, 'missed'), { recursive: true });
  const missed = missedIn.map(x => {
    const files = (x.images || []).map((u, i) => {
      const mm = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(u); if (!mm) return null;
      const f = `missed/${x.id}-${i + 1}.${mm[1] === 'jpeg' ? 'jpg' : mm[1]}`; fs.writeFileSync(path.join(dir, f), Buffer.from(mm[2], 'base64')); return f;
    }).filter(Boolean);
    const { images, ...rest } = x; return { ...rest, images: files };
  });
  fs.writeFileSync(path.join(dir, 'feedback.json'), JSON.stringify({ ...fb, page, findings, missed, metrics: m }, null, 1));

  // --- 3. разметка автонаходок: каждой — вердикт из отчёта (через совпадение по месту и свойствам)
  const prev = fs.existsSync(path.join(dir, 'labels.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'labels.json'), 'utf8')) : null;
  const decided = findings.filter(f => f.kind === 'bug');
  const items = auto.map(a => {
    const hit = decided.filter(f => sameFinding(a, f)), v = hit.map(f => f.verdict);
    // многостраничное ревью состояний одной страницы: тот же баг автоматика находит на каждой странице, а агент
    // оформляет его один раз — на соседней странице это дубль подтверждённой находки, а не лишняя
    if (!hit.length && otherDecided.length) {
      const dup = otherDecided.find(f => ['bug', 'ok', 'mockup', 'scope'].includes(f.verdict) && (sameFinding(a, f) || nt(f.title) === nt(a.title)));
      if (dup) return { autoId: a.id, title: a.title, props: [...new Set((a.css || []).map(c => c.prop))], evidence: a.evidence.map(e => ({ shot: String(e.shot), a: e.a, b: e.b })), label: 'dup', by: 'agent', note: `дубль ${dup.id} (${dup.page || 'другая страница'})` };
    }
    // «Ошибка в макете» (сайт прав) и «Другой функционал» (вне проверки) — не верные и не лишние, в метрики не идут
    const label = v.some(x => x === 'bug' || x === 'ok') ? 'tp' : v.includes('notbug') ? 'fp' : v.includes('mockup') ? 'mockup' : v.includes('scope') ? 'scope' : hit.length ? 'unknown' : 'fp';
    const by = hit.length ? 'human' : 'agent', why = hit.find(f => f.verdict === 'notbug');
    const old = prev?.items?.find(x => x.manual && x.autoId === a.id && x.title === a.title);
    if (old) return old; // ручная правка разметки сохраняется
    return { autoId: a.id, title: a.title, props: [...new Set((a.css || []).map(c => c.prop))], evidence: a.evidence.map(e => ({ shot: String(e.shot), a: e.a, b: e.b })),
      label, by, reason: label === 'fp' ? (why?.reason || (by === 'agent' ? 'dropped-by-agent' : null)) : undefined, note: why?.note || hit.find(f => f.verdict === 'scope')?.note, reportIds: hit.map(f => f.id) };
  });
  // находки агента (не автоматика), подтверждённые дизайнером: автоматика их не нашла — кандидаты в новые проверки
  const agentFound = decided.filter(f => f.source === 'agent').map(f => ({ id: f.id, title: f.title, verdict: f.verdict, reason: f.reason, category: f.category, evidence: f.evidence }));
  const keepTarget = id => prev?.missed?.find(x => x.id === id)?.target;
  const labels = {
    case: name, from: path.basename(file), page: page || undefined, skillVersion: fb.run?.skillVersion, reviewedFully: !!m.reviewedFully, run: { ...fb.run, dir: srcDir },
    items, agentFound, visualHypotheses: findings.filter(f => f.basis === 'visual-heuristic').map(f => ({ id: f.id, title: f.title, verdict: f.verdict, referenceStatus: f.referenceStatus, foundBy: f.foundBy, evidence: f.evidence })), tokenUsage: fb.tokenUsage || null, tokenUsageScope: 'run', tokenUsageRun: fb.run?.dir || srcDir,
    // проверка самого макета (MK-…): «Поправить» / «Не важно» — её отдельная точность, в метрики навыка не входит
    mockupLint: findings.filter(f => f.kind === 'mockup').map(f => ({ id: f.id, title: f.title, verdict: f.verdict, note: f.note })),
    // «Другой функционал»: что дизайнер считает вне проверки — кандидаты в исключения профиля сайта
    outOfScope: findings.filter(f => f.verdict === 'scope').map(f => ({ id: f.id, title: f.title, note: f.note, evidence: f.evidence })),
    missed: missed.map(x => ({ id: x.id, title: x.title, desc: x.desc, category: x.category, widths: x.widths, figma: x.figma, site: x.site, images: x.images, foundBy: x.foundBy, target: keepTarget(x.id) || x.target || null, kind: prev?.missed?.find(y => y.id === x.id)?.kind || null })),
  };
  fs.writeFileSync(path.join(dir, 'labels.json'), JSON.stringify(labels, null, 1));

  // --- 4. история
  fs.appendFileSync(path.join(benchRoot, 'history.jsonl'), JSON.stringify({ at: new Date().toISOString(), case: name, stage: 'report', skillVersion: fb.run?.skillVersion, skillRelease: fb.run?.skillRelease, tokenUsage: !page || page === pages[0]?.id ? fb.tokenUsage || null : null, tokenUsageRun: fb.run?.dir || srcDir, precision: m.precision, recall: m.reviewedFully ? m.recall : null, f1: m.reviewedFully ? m.f1 : null, tp: m.tp, fp: m.fp, missed: m.missed, pending: m.pending }) + '\n');

  // --- сводка для агента
  const cnt = (arr, k) => arr.reduce((o, x) => (o[x[k] || '—'] = (o[x[k] || '—'] || 0) + 1, o), {});
  const fps = findings.filter(f => f.verdict === 'notbug');
  console.log(`\nЭталон: ${dir}${page ? ` (страница «${page}»)` : ''}`);
  console.log(`Отчёт: точность ${pct(m.precision)} (верных ${m.tp}, лишних ${m.fp}) · полнота ${m.reviewedFully ? pct(m.recall) : '— (просмотрено не целиком)'} · пропущено ${m.missed} · без решения ${m.pending}`);
  console.log(`  по источникам: автоматика ${pct(m.bySource?.auto?.precision)} (${m.bySource?.auto?.tp}/${(m.bySource?.auto?.tp || 0) + (m.bySource?.auto?.fp || 0)}), агент ${pct(m.bySource?.agent?.precision)} (${m.bySource?.agent?.tp}/${(m.bySource?.agent?.tp || 0) + (m.bySource?.agent?.fp || 0)})`);
  const st = cnt(items, 'label'), agentDrop = items.filter(i => i.reason === 'dropped-by-agent').length;
  console.log(`Автонаходки (${items.length}): верных ${st.tp || 0}, лишних ${st.fp || 0} (из них отброшено агентом ${agentDrop}), не решено ${st.unknown || 0}${st.mockup ? `, ошибка в макете ${st.mockup}` : ''}${st.scope ? `, другой функционал ${st.scope}` : ''} → автоматика ${pct(ratio(st.tp || 0, (st.tp || 0) + (st.fp || 0)))}`);
  const mkV = findings.filter(f => f.verdict === 'mockup'), mkL = labels.mockupLint;
  if (mkV.length || mkL.length) console.log(`Ошибки в макете (в метрики не входят): дизайнер отметил ${mkV.length}${mkV.length ? ' — ' + mkV.map(f => f.id).join(', ') : ''}; проверка макета: поправить ${mkL.filter(x => x.verdict === 'fix').length}, не важно ${mkL.filter(x => x.verdict === 'skip').length}, без решения ${mkL.filter(x => !x.verdict).length}`);
  if (labels.outOfScope.length) console.log('Другой функционал (в метрики не входит; повторяется — добавить исключение в профиль сайта):\n' + labels.outOfScope.map(x => `  ${x.id} ${x.title}${x.note ? ' — ' + x.note : ''}`).join('\n'));
  if (fps.length) { console.log('Лишние (дизайнер: «Не баг»):'); for (const f of fps) console.log(`  ${f.id} [${f.source}] ${f.title}\n     причина: ${f.reasonLabel || f.reason || 'не указана'}${f.note ? ' · ' + f.note : ''}`); }
  if (missed.length) { console.log('Пропущено (добавил дизайнер):'); for (const x of missed) console.log(`  ${x.id} ${x.title}${x.widths?.length ? ' · ' + x.widths.join('/') + ' px' : ''}${x.desc ? '\n     ' + x.desc.replace(/\n/g, '\n     ') : ''}${x.figma ? '\n     Figma: ' + x.figma : ''}${x.site ? '\n     Сайт: ' + x.site : ''}${x.images.length ? '\n     скриншоты: ' + x.images.map(i => path.join(dir, i)).join(', ') : ''}`); }
  return dir;
}

const pages = fb.run?.pages || [];
if (pages.length) {
  // многостраничный отчёт: находки и пропуски — по своим страницам, id и кадры — без префикса страницы (как в подпрогоне)
  const strip = (pid, s) => String(s).startsWith(pid + '/') ? String(s).slice(pid.length + 1) : String(s);
  const allStripped = fb.findings.filter(f => f.kind === 'bug').map(f => ({ ...f, evidence: (f.evidence || []).map(e => ({ ...e, shot: String(e.shot).includes('/') ? String(e.shot).split('/').slice(1).join('/') : String(e.shot) })) }));
  for (const p of pages) {
    const findings = fb.findings.filter(f => f.page === p.id).map(f => ({ ...f, id: f.srcId || f.id, evidence: (f.evidence || []).map(e => ({ ...e, shot: strip(p.id, e.shot) })) }));
    const missed = (fb.missed || []).filter(x => (x.page || pages[0].id) === p.id);
    ingest({ srcDir: p.dir || path.join(runDir, p.id), name: `${baseName}-${p.id}`, findings, missed, metrics: metricsOf(findings, missed, !!fb.metrics?.reviewedFully), page: p.title || p.id, otherDecided: allStripped.filter(f => f.page !== p.id) });
  }
  // второй проход: автонаходка с тем же текстом, что подтверждённая автонаходка соседней страницы, — дубль (агент
  // оформил баг один раз, на страницах-состояниях он повторяется), а не лишняя
  const cases = pages.map(p => path.join(benchRoot, `${baseName}-${p.id}`, 'labels.json')).filter(fs.existsSync);
  const Ls = cases.map(f => ({ f, L: JSON.parse(fs.readFileSync(f, 'utf8')) }));
  const tpTitles = new Map(); for (const { L } of Ls) for (const i of L.items) if (i.label === 'tp') tpTitles.set(i.title, L.page || L.case);
  let dups = 0;
  for (const { f, L } of Ls) { let ch = false; for (const i of L.items) if (i.label === 'fp' && i.by === 'agent' && tpTitles.has(i.title) && tpTitles.get(i.title) !== (L.page || L.case)) { i.label = 'dup'; i.note = `дубль подтверждённой на «${tpTitles.get(i.title)}»`; ch = true; dups++; } if (ch) fs.writeFileSync(f, JSON.stringify(L, null, 1)); }
  if (dups) console.log(`\nДубли между страницами: ${dups} автонаходок помечены «dup» (не лишние)`);
  const m = fb.metrics || {};
  console.log(`\nВесь отчёт (${pages.length} стр.): точность ${pct(m.precision)} · полнота ${m.reviewedFully ? pct(m.recall) : '—'} · пропущено ${m.missed}`);
} else {
  // метрики — из отчёта; если есть находки, найденные дизайнером (или пропуск с тем же заголовком), — пересчитать
  const nt = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim(), miss = fb.missed || [];
  const fixed = fb.findings.map(f => f.foundBy || !miss.some(x => nt(x.title) === nt(f.title)) ? f : { ...f, foundBy: 'designer' });
  const hasDes = fixed.some(f => f.kind === 'bug' && f.foundBy === 'designer');
  const missNoDup = miss.filter(x => !fixed.some(f => f.foundBy === 'designer' && nt(f.title) === nt(x.title)));
  ingest({ srcDir: runDir, name: baseName, findings: fb.findings, missed: miss, metrics: hasDes ? metricsOf(fixed, missNoDup, !!fb.metrics?.reviewedFully) : fb.metrics || {} });
}
// журнал агента ревью: что обходили в прогоне и что предлагают поменять в навыке
const logFile = path.join(runDir, 'skill-log.md');
if (fs.existsSync(logFile)) {
  const dst = path.join(benchRoot, pages.length ? `${baseName}-skill-log.md` : path.join(baseName, 'skill-log.md'));
  fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(logFile, dst);
  console.log(`\nЖурнал агента ревью (${dst}):\n` + fs.readFileSync(logFile, 'utf8').split('\n').filter(l => /^## /.test(l)).map(l => '  ' + l.slice(3)).join('\n'));
} else console.log('\nЖурнала skill-log.md в папке прогона нет — спросить пользователя, что обходили по ходу ревью.');
if (fb.skillNotes?.length) { console.log('\nКомментарии «к работе скилла»:'); for (const n of fb.skillNotes) console.log(`  ${n.id}: ${n.note}`); }
console.log(`\nДальше: разобрать причины (SKILL.md → «Разбор обратной связи»), пропускам дописать target в labels.json эталона, исправить навык, проверить: node scripts/bench.mjs`);
