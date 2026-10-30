// Проверка собранного отчёта в браузере: нет ошибок JS, карточки рисуются, режимы и решения работают.
// node selftest.mjs <report.html> [папка для скриншотов]
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [report, shotsDir] = process.argv.slice(2);
if (!report) { console.error('usage: selftest.mjs <report.html> [shotsDir]'); process.exit(1); }
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.resolve(report)).href); await p.waitForTimeout(1200);
const cards = await p.locator('.card').count();
// отчёт без находок (страница только по спеке) — шаги с карточкой пропускаем, а не ждём 30 с
const first = cards ? await p.locator('.card').first().getAttribute('data-card') : null;
if (first) {
  for (const m of ['swipe', 'onion', 'diff', 'side']) await p.click(`[data-modeseg="${first}"] [data-mode="${m}"]`);
  await p.click(`[data-dec="${first}"] [data-v]`);
}
const progress = await p.textContent('#progText');
for (const t of ['improve', 'match', 'full', 'report', 'scope', 'bugs']) if (await p.locator(`[data-tab="${t}"]`).count()) await p.click(`[data-tab="${t}"]`);
if (shotsDir) {
  await p.screenshot({ path: path.join(shotsDir, '_selftest-top.png') });
  if (first) await p.locator(`[data-card="${first}"]`).screenshot({ path: path.join(shotsDir, '_selftest-card.png') });
}
console.log(JSON.stringify({ cards, progress, errors: errs }));
await b.close();
process.exit(errs.length ? 1 : 0);
