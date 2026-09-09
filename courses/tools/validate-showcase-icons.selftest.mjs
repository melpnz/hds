/**
 * Регрессионные пробы для `tools/validate-showcase-icons.mjs` (METHOD §6.3),
 * заведённые по находке 2 ревью R2-01 (review-1): старый `REF_PATTERN`
 * требовал, чтобы подстрока `ui/assets/` уже стояла в значении атрибута —
 * то есть подтверждал уже локализованное, но не ловил забытую прод-ссылку
 * (полный внешний URL или сайт-абсолютный путь без хоста), потому что она
 * вообще не матчилась регэкспом и тихо выпадала из проверки, не попадая
 * ни в `checked`, ни в находку.
 *
 * Каждая проба строит изолированную витрину (`showcase/components.html`) во
 * временном каталоге и запускает настоящий CLI (`node
 * tools/validate-showcase-icons.mjs`) с этим каталогом как рабочей
 * директорией — не вызывает внутренние функции напрямую.
 *
 * Запуск: node tools/validate-showcase-icons.selftest.mjs
 * Код возврата: 0 — все пробы дали ожидаемый результат; 1 — хотя бы одна
 * разошлась с ожиданием.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(here, 'validate-showcase-icons.mjs');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-showcase-icons-selftest-'));
let fixtureCounter = 0;

function page(body) {
  return `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>fixture</title></head>\n<body>\n${body}\n</body>\n</html>\n`;
}

// Строит изолированную витрину: showcase/components.html с переданным телом,
// плюс (опционально) реальный файл ассета на диске под ui/assets/, чтобы
// пробы на «файл существует» могли давать EXIT=0.
function fixture({ body, assetFile = null }) {
  fixtureCounter += 1;
  const root = path.join(tmpRoot, String(fixtureCounter));
  fs.mkdirSync(path.join(root, 'showcase'), { recursive: true });
  if (assetFile) {
    const full = path.join(root, assetFile);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, '<svg></svg>');
  }
  fs.writeFileSync(path.join(root, 'showcase', 'components.html'), page(body));
  return root;
}

function run(root) {
  const result = spawnSync('node', [scriptPath], { cwd: root, encoding: 'utf8' });
  return { code: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

const results = [];

function probe(name, { fixtureOpts, expectCode, expectContains = [], expectNotContains = [] }) {
  const root = fixture(fixtureOpts);
  const { code, stdout, stderr } = run(root);
  const output = stdout + stderr;
  const problems = [];
  if (code !== expectCode) problems.push(`код возврата ${code}, ожидался ${expectCode}`);
  for (const needle of expectContains) {
    if (!output.includes(needle)) problems.push(`в выводе нет: ${JSON.stringify(needle)}`);
  }
  for (const needle of expectNotContains) {
    if (output.includes(needle)) problems.push(`в выводе есть (не должно): ${JSON.stringify(needle)}`);
  }
  results.push({ name, ok: problems.length === 0, problems, output });
}

// =========================================================================
// Регрессия — находка 2, review-1 R2-01
// =========================================================================

probe('R2-01/review-1 находка 2: полный внешний URL — забытая прод-ссылка ловится', {
  // Ровно строка, которой ревьюер продемонстрировал 0 совпадений на старом
  // REF_PATTERN.
  fixtureOpts: {
    body: '<svg class="svg-icon"><use xlink:href="https://career.habr.com/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg>',
  },
  expectCode: 1,
  expectContains: ['Ссылка на ассет идёт через внешний хост', 'career.habr.com'],
});

probe('находка 2, второй пример из отчёта: сайт-абсолютный прод-путь без хоста тоже ловится', {
  // Путь из раздела «Анатомия» той же спецификации, если бы он случайно
  // остался в showcase, а не только в протоколе снятого DOM: без хоста,
  // но и не ведёт в ui/assets/ — на витрине, поднятой tools/serve.mjs, не
  // резолвится, а не «тихо ходит в прод».
  fixtureOpts: {
    body: '<svg class="svg-icon"><use xlink:href="/courses-web/images/sprites/sprite.svg?v=1.29.0#star-rounded"></use></svg>',
  },
  expectCode: 1,
  expectContains: ['Ссылка на ассет не ведёт в ui/assets/', '/courses-web/images/sprites/sprite.svg'],
});

probe('protocol-relative внешний хост (// без схемы) — ловится', {
  fixtureOpts: {
    body: '<svg class="svg-icon"><use xlink:href="//assets.habr.com/icons/sprite.svg#star-rounded"></use></svg>',
  },
  expectCode: 1,
  expectContains: ['Ссылка на ассет идёт через внешний хост'],
});

probe('контроль: локальная ui/assets/ ссылка на существующий файл — EXIT=0', {
  fixtureOpts: {
    body: '<svg class="svg-icon"><use xlink:href="../ui/assets/icons/sprite.svg#star-rounded"></use></svg>',
    assetFile: 'ui/assets/icons/sprite.svg',
  },
  expectCode: 0,
  expectContains: ['все ведут в ui/assets/, все существуют'],
});

probe('контроль: ui/assets/ ссылка на несуществующий файл — ловится как раньше', {
  fixtureOpts: {
    body: '<svg class="svg-icon"><use xlink:href="../ui/assets/icons/missing.svg#star-rounded"></use></svg>',
  },
  expectCode: 1,
  expectContains: ['Файл ассета не найден на диске'],
});

probe('контроль: обычные href без расширения ассета (якорь, doc-ссылка) не матчатся вовсе', {
  fixtureOpts: {
    body: '<a href="#doc-section">якорь</a><a href="../components/data-display/sprite-icon.md">спека</a><a href="data:,">пусто</a>',
  },
  expectCode: 0,
  expectContains: ['Проверено 0 ссылок на ассеты'],
});

// =========================================================================
// Итог
// =========================================================================

const failed = results.filter(r => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.name}`);
  if (!r.ok) {
    for (const problem of r.problems) console.log(`     ${problem}`);
    console.log('     --- вывод инструмента ---');
    for (const line of r.output.split('\n')) console.log(`     ${line}`);
    console.log('     -------------------------');
  }
}

console.log('');
console.log(`Пройдено ${results.length - failed.length} из ${results.length} проб.`);

fs.rmSync(tmpRoot, { recursive: true, force: true });

if (failed.length) {
  console.error(`Провалено проб: ${failed.length} — см. FAIL выше.`);
  process.exit(1);
}
