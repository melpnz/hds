// Inventory every design state before capture, preserving owner decisions and explicit fragment mappings.
import fs from 'node:fs';
import path from 'node:path';
const [run] = process.argv.slice(2); if (!run) throw new Error('usage: review-plan.mjs <run>');
const file = path.join(run, 'state-plan.json');
const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema: 'design-review-states/1', states: [] };
const manifestFile = path.join(run, 'figma', 'frames.json');
const exported = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')).frames : null;
const found = fs.readdirSync(path.join(run, 'figma')).filter(x => /^figma-\d+.*\.json$/.test(x));
const names = exported?.length ? found.filter(f => exported.some(e => e.json === f) || fs.existsSync(path.join(run, 'page', f.replace(/^figma-/, 'page-')))) : found;
for (const name of names) {
  const id = name.slice(6, -5), existing = prev.states.find(s => s.id === id);
  if (!existing) prev.states.push({ id, kind: 'screen', required: true, origin: 'export-plan' });
}
// A captured error/empty/loading state can be absent from the design. It still needs a visual review.
if (fs.existsSync(path.join(run, 'page'))) for (const name of fs.readdirSync(path.join(run, 'page')).filter(n => /^page-\d+.*\.json$/.test(n))) {
  const id = name.slice(5, -5);
  if (!prev.states.some(s => s.id === id)) prev.states.push({ id, kind: 'screen', required: true, origin: 'captured-state' });
}
const questions = [];
for (const s of prev.states) {
  const id = s.kind === 'fragment' ? s.pageShot : s.id;
  const p = id && path.join(run, 'page', `page-${id}.json`);
  let shot = null; try { shot = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { }
  s.status = shot && !shot.stepErrors?.length && shot.stateReached !== false ? 'captured' : 'needs-clarification';
  s.referenceStatus = fs.existsSync(path.join(run, 'figma', `figma-${s.id}.json`)) ? 'available' : 'missing';
  s.reviewMode = s.referenceStatus === 'missing' ? 'visual-hypothesis' : 'comparison';
  if (s.reviewMode === 'visual-hypothesis') s.visualReview ||= { status: 'pending', note: '' };
  if (s.required !== false && s.status !== 'captured') questions.push({ id: s.id, question: s.question || `Как открыть состояние «${s.id}»? Нужны действия, данные или доступ; без этого проверка не завершена.`, ownerDecision: s.ownerDecision || null });
}
fs.writeFileSync(file, JSON.stringify(prev, null, 2));
console.log(JSON.stringify({ states: prev.states, questions, visualChecks: prev.states.filter(s => s.reviewMode === 'visual-hypothesis') }, null, 2));
