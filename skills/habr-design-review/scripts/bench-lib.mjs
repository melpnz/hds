// Общее для feedback.mjs и bench.mjs: «та же ли это находка» — по месту (кадр + рамка) и по свойствам.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const SKILL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BENCH = path.join(SKILL, 'bench');

export const iou = (p, q) => {
  if (!p || !q) return 0;
  const x1 = Math.max(p[0], q[0]), y1 = Math.max(p[1], q[1]), x2 = Math.min(p[0] + p[2], q[0] + q[2]), y2 = Math.min(p[1] + p[3], q[1] + q[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1); return inter / (p[2] * p[3] + q[2] * q[3] - inter || 1);
};
// Свойства находки — её css-свойства. У ручных находок их нет (таблица свойств по-русски) — тогда «про блок целиком».
export const propsOf = f => new Set((f.css || []).map(c => c.prop.replace(/-token$/, '')).filter(Boolean));
export const evOf = f => (f.evidence || []).map(e => ({ shot: String(e.shot ?? e.w), a: e.a || e.figma, b: e.b || e.page }));

// Совпадают, если хоть одно свидетельство на том же кадре перекрывается (рамка сайта или макета) и свойства пересекаются
// (или у одной из находок свойств нет — ручная находка «про блок»).
export function sameFinding(x, y, minIou = 0.5) {
  const px = propsOf(x), py = propsOf(y);
  const propsOk = !px.size || !py.size || [...px].some(p => py.has(p));
  if (!propsOk) return false;
  return evOf(x).some(e => evOf(y).some(g => e.shot === g.shot && (iou(e.b, g.b) >= minIou || iou(e.a, g.a) >= minIou)));
}
// Попадает ли находка в область пропуска (target: {shot, b?, a?, props?}) — рамки пропуска обычно крупнее, порог ниже.
export function hitsTarget(f, t) {
  if (!t?.shot) return false;
  const ps = propsOf(f);
  if (t.props?.length && ps.size && !t.props.some(p => ps.has(p))) return false;
  const inside = (o, i) => i && o && i[0] >= o[0] - 4 && i[1] >= o[1] - 4 && i[0] + i[2] <= o[0] + o[2] + 4 && i[1] + i[3] <= o[1] + o[3] + 4;
  return evOf(f).some(e => e.shot === String(t.shot) && (iou(e.b, t.b) >= 0.3 || iou(e.a, t.a) >= 0.3 || inside(t.b, e.b) || inside(t.a, e.a)));
}

export function skillVersion() {
  const h = crypto.createHash('sha1'), dir = path.join(SKILL, 'scripts');
  for (const f of fs.readdirSync(dir).filter(f => /\.m?js$/.test(f)).sort()) h.update(fs.readFileSync(path.join(dir, f)));
  h.update(fs.readFileSync(path.join(SKILL, 'templates', 'report.html')));
  return h.digest('hex').slice(0, 10);
}
export const pct = x => x == null ? '—' : Math.round(x * 100) + '%';
export const ratio = (a, b) => b ? +(a / b).toFixed(3) : null;
