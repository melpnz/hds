// Перепроверка навыка на размеченных прогонах (эталонах) без сети: автосопоставление заново → сравнение с разметкой.
// node scripts/bench.mjs [case …] [--record] [--bench <папка эталонов>] [--verbose]
//
// Для каждого bench/<case>/ (labels.json + figma/*.json + page/*.json):
//   верные (tp)   — нашлись снова? потеря верной находки — регрессия;
//   лишние (fp)   — исчезли? оставшиеся — что ещё чинить;
//   пропуски с target — теперь находятся?
//   новые находки, которых нет в разметке, — не оценены: их нужно посмотреть (могут быть и верными, и шумом).
// Точность автоматики = tp / (tp + fp); полнота = (tp + найденные пропуски) / (все верные + пропуски с target).
// --record — дописать итог в bench/history.jsonl (делать после исправления навыка).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { BENCH, SKILL, sameFinding, hitsTarget, skillVersion, pct, ratio } from './bench-lib.mjs';

const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const root = opt('bench') || BENCH, verbose = argv.includes('--verbose');
const named = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--bench');
const cases = (named.length ? named : fs.existsSync(root) ? fs.readdirSync(root) : []).filter(c => fs.existsSync(path.join(root, c, 'labels.json')));
if (!cases.length) { console.log(`Эталонов нет (${root}). Они появляются после node scripts/feedback.mjs <feedback.json>.`); process.exit(0); }

const ver = skillVersion(), tot = { tp: 0, tpLost: 0, fp: 0, fpLeft: 0, miss: 0, missFound: 0, fresh: 0 }, rows = [];
for (const c of cases) {
  const dir = path.join(root, c), L = JSON.parse(fs.readFileSync(path.join(dir, 'labels.json'), 'utf8'));
  // копия во временную папку: match-figma пишет рядом match-pairs.json, эталон не трогаем
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dr-bench-'));
  // скриншоты в эталоне не храним (тяжёлые) — берём из папки прогона, если она на месте: по ним проверяются
  // пограничные отступы (где реально начинаются буквы); без них такие проверки в перепроверке не работают
  const srcRun = L.run?.dir && fs.existsSync(L.run.dir) ? L.run.dir : null;
  if (fs.existsSync(path.join(dir, 'state-plan.json'))) fs.copyFileSync(path.join(dir, 'state-plan.json'), path.join(tmp, 'state-plan.json'));
  for (const sub of ['figma', 'page']) {
    fs.mkdirSync(path.join(tmp, sub)); for (const f of fs.readdirSync(path.join(dir, sub))) fs.copyFileSync(path.join(dir, sub, f), path.join(tmp, sub, f));
    if (srcRun && fs.existsSync(path.join(srcRun, sub))) for (const f of fs.readdirSync(path.join(srcRun, sub)).filter(f => /^(figma|page)-.*\.png$/.test(f))) fs.copyFileSync(path.join(srcRun, sub, f), path.join(tmp, sub, f));
  }
  if (!srcRun) console.log(`  (${c}: папки прогона нет — проверки по пикселям пропущены)`);
  // опции сопоставления этого прогона (например, режим компонента --scope-site/--scope-figma) — из labels.matchArgs
  execFileSync(process.execPath, [path.join(SKILL, 'scripts', 'match-figma.mjs'), tmp, ...(L.matchArgs || [])], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const now = JSON.parse(fs.readFileSync(path.join(tmp, 'findings.json'), 'utf8')).findings.filter(f => f.kind === 'bug');
  fs.rmSync(tmp, { recursive: true, force: true });
  const lab = it => ({ ...it, css: it.props.map(p => ({ prop: p })) });
  const tps = L.items.filter(i => i.label === 'tp'), fps = L.items.filter(i => i.label === 'fp'), unk = L.items.filter(i => i.label === 'unknown');
  const tpLost = tps.filter(i => !now.some(f => sameFinding(f, lab(i)))), fpLeft = fps.filter(i => now.some(f => sameFinding(f, lab(i))));
  const tgt = L.missed.filter(m => m.target && m.kind !== 'agent-only'), missFound = tgt.filter(m => now.some(f => hitsTarget(f, m.target)));
  const fresh = now.filter(f => !L.items.some(i => sameFinding(f, lab(i))) && !tgt.some(m => hitsTarget(f, m.target)));
  const r = { case: c, tp: tps.length, tpLost: tpLost.length, fp: fps.length, fpLeft: fpLeft.length, unknown: unk.length, miss: tgt.length, missFound: missFound.length, missNoTarget: L.missed.length - tgt.length - L.missed.filter(m => m.kind === 'agent-only').length, fresh: fresh.length };
  r.precision = ratio(r.tp - r.tpLost, r.tp - r.tpLost + r.fpLeft); r.recall = ratio(r.tp - r.tpLost + r.missFound, r.tp + r.miss);
  rows.push(r); for (const k of Object.keys(tot)) tot[k] += r[k];
  console.log(`\n${c}: точность ${pct(r.precision)} · полнота ${pct(r.recall)}`);
  console.log(`  верные ${r.tp - r.tpLost}/${r.tp}${r.tpLost ? `  ⚠ потеряно ${r.tpLost}` : ''} · лишние осталось ${r.fpLeft}/${r.fp} · пропуски найдены ${r.missFound}/${r.miss}${r.missNoTarget ? ` (+${r.missNoTarget} без target — не проверяются)` : ''} · новых неразмеченных ${r.fresh}`);
  if (tpLost.length) console.log('  Потеряны верные:\n' + tpLost.map(i => `    ${i.autoId} ${i.title}`).join('\n'));
  if (fpLeft.length && (verbose || fpLeft.length <= 8)) console.log('  Лишние, которые остались:\n' + fpLeft.map(i => `    ${i.autoId} ${i.title}  [${i.reason || '—'}]`).join('\n'));
  if (fresh.length && (verbose || fresh.length <= 8)) console.log('  Новые, без разметки (посмотреть):\n' + fresh.map(f => `    ${f.title}`).join('\n'));
}
const P = ratio(tot.tp - tot.tpLost, tot.tp - tot.tpLost + tot.fpLeft), R = ratio(tot.tp - tot.tpLost + tot.missFound, tot.tp + tot.miss), F1 = P && R ? +(2 * P * R / (P + R)).toFixed(3) : null;
console.log(`\nИтого по ${cases.length} эталонам (версия ${ver}): точность ${pct(P)} · полнота ${pct(R)} · F1 ${pct(F1)}${tot.tpLost ? ` · ⚠ потеряно верных: ${tot.tpLost}` : ''}`);
if (argv.includes('--record')) {
  fs.appendFileSync(path.join(root, 'history.jsonl'), JSON.stringify({ at: new Date().toISOString(), stage: 'bench', skillVersion: ver, cases: rows.length, precision: P, recall: R, f1: F1, ...tot }) + '\n');
  console.log('Записано в history.jsonl');
}
process.exit(tot.tpLost ? 1 : 0);
