// Проверка ссылок на макет в находках: открывают ли они нужное место.
// node scripts/figma-links.mjs <run> [--fix]
//
// В Figma ссылка на слой внутри экземпляра компонента (id «I…;…») часто открывает файл, а не место. Скрипт для каждого
// свидетельства берёт узел ссылки (figmaNode.link, иначе сам слой) и через REST проверяет, что он существует; нет —
// поднимается выше: экземпляр (первая часть «I…;…»), затем фрейм (figmaNode.frame). --fix записывает рабочий узел в
// figmaNode.link (findings.json прогона). Компонент из библиотеки — ссылка figmaNode.comp.url (её даёт figma-export).
// Токен — как у figma-export: FIGMA_TOKEN или ~/.design-review/figma-token. Только чтение.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2), run = argv.find(a => !a.startsWith('--')), fix = argv.includes('--fix');
if (!run) { console.error('usage: figma-links.mjs <run> [--fix]'); process.exit(1); }
const tokenFile = path.join(os.homedir(), '.design-review', 'figma-token');
const token = process.env.FIGMA_TOKEN || (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '');
if (!token) { console.error(`Нет токена Figma (${tokenFile} или FIGMA_TOKEN).`); process.exit(2); }
const file = path.join(run, 'findings.json'), D = JSON.parse(fs.readFileSync(file, 'utf8'));
const keyOf = u => (/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)/.exec(u || '') || [])[1];
const pageOf = f => (D.meta.pages || []).find(p => p.id === f.page) || D.meta;
const instRoot = id => String(id).startsWith('I') ? String(id).slice(1).split(';')[0] : id;

// кандидаты на каждое свидетельство: link → корень экземпляра → frame
const jobs = [];
for (const f of D.findings) for (const e of f.evidence || []) {
  const n = e.figmaNode; if (!n || !(n.id || n.link)) continue;
  const key = keyOf(pageOf(f).figmaUrl); if (!key) continue;
  const cands = [...new Set([n.link, n.id && !String(n.id).startsWith('I') ? n.id : null, instRoot(n.link || n.id), n.frame].filter(Boolean))];
  jobs.push({ f, e, n, key, cands });
}
const byKey = {}; for (const j of jobs) (byKey[j.key] ||= new Set()) && j.cands.forEach(c => byKey[j.key].add(c));
const exists = {};
for (const [key, ids] of Object.entries(byKey)) {
  const list = [...ids];
  for (let i = 0; i < list.length; i += 40) {
    const chunk = list.slice(i, i + 40);
    const r = await fetch(`https://api.figma.com/v1/files/${key}/nodes?ids=${chunk.map(encodeURIComponent).join(',')}&depth=1`, { headers: { 'X-Figma-Token': token } });
    if (!r.ok) { console.error(`Figma API ${r.status} для файла ${key}`); process.exit(1); }
    const j = await r.json(); for (const id of chunk) exists[`${key}|${id}`] = !!j.nodes?.[id]?.document;
  }
}
let ok = 0, moved = 0, bad = 0;
for (const j of jobs) {
  const good = j.cands.find(c => exists[`${j.key}|${c}`]);
  const cur = j.n.link || j.n.id;
  if (good && good === cur) { ok++; continue; }
  if (good) { moved++; console.log(`  ${j.f.id}: ${cur} не открывается → ${good}${good === j.n.frame ? ' (фрейм)' : ''}`); if (fix) j.n.link = good; }
  else { bad++; console.log(`  ⚠ ${j.f.id}: ни один узел не найден (${j.cands.join(', ')}) — поставить ссылку вручную`); }
}
if (fix && moved) fs.writeFileSync(file, JSON.stringify(D, null, 1));
console.log(`Ссылок на макет: ${jobs.length} · открываются ${ok} · заменены на узел выше ${moved}${fix ? '' : ' (запустите с --fix, чтобы записать)'} · не найдены ${bad}`);
