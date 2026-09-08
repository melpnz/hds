/**
 * Показывает, насколько устарели снимки продакшена.
 *
 * Зачем. Пакет описывает живой продукт, а продукт меняется. Снимок
 * `dash-ratings.json` уже разошёлся с сайтом: он показывает на странице
 * рейтингов вкладки с подчёркиванием, которых там больше нет. Заметить это
 * можно было только случайно — даты снятия в файлах нет.
 *
 * Скрипт берёт дату последнего изменения файла и печатает, чему сколько дней.
 * Порог по умолчанию 90 дней; можно задать: --max-age=30.
 *
 * Запуск: node tools/check-evidence-age.mjs [--max-age=90]
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = process.argv.find(a => a.startsWith('--max-age='));
const maxAge = arg ? Number(arg.split('=')[1]) : 90;

const dir = 'evidence/source/production';
if (!fs.existsSync(dir)) {
  console.error(`Нет каталога ${dir}`);
  process.exit(1);
}

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const full = path.join(dir, f);
    const age = Math.floor((now - fs.statSync(full).mtimeMs) / day);
    let url = null;
    try { url = JSON.parse(fs.readFileSync(full, 'utf8')).url || null; } catch { /* не наш формат */ }
    return { file: f, age, url };
  })
  .sort((a, b) => b.age - a.age);

const stale = files.filter(f => f.age > maxAge);

console.log(`Снимков продакшена: ${files.length}. Порог: ${maxAge} дней.\n`);
for (const f of files) {
  const mark = f.age > maxAge ? '!' : ' ';
  console.log(`${mark} ${String(f.age).padStart(4)} дн  ${f.file.padEnd(28)} ${f.url || ''}`);
}

if (stale.length) {
  console.log(`\nСтарше порога: ${stale.length}. Это не ошибка — это повод пересверить.`);
  console.log('Порядок пересъёмки — docs/guide/coverage.md, раздел «Как обновлять evidence».');
}
