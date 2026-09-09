/**
 * Проверяет локальность иконок в витрине — METHOD §6.3, «Иконки и шрифты
 * лежат в ui/assets/; в разметке спецификаций пути локальные, продовые
 * URL остаются только в разделе «Анатомия» как протокол снятого DOM».
 *
 * Зачем. showcase/components.html копирует разметку компонента из его
 * спецификации слово в слово (METHOD §6). Продовый путь
 * (`https://career.habr.com/courses-web/…` или относительный `/courses-web/…`,
 * как он снят в DOM) в этой копии — забытая правка, а не факт: на витрине,
 * поднятой `tools/serve.mjs`, такой путь либо не резолвится вовсе (абсолютный
 * без хоста), либо тихо ходит в прод (с хостом) — оба исхода противоречат
 * инварианту «копируемость не зависит от сети».
 *
 * Долг X-06 (`ROADMAP.md`) поручал перенести `validate-showcase-icons.mjs`
 * и `sync-showcase-icons.mjs` из `career/tools/` — не перенесено дословно.
 * У Курсов другая архитектура иконок: `SpriteIcon` воспроизводит настоящий
 * DOM-паттерн прода — `<svg class="svg-icon"><use xlink:href="…sprite.svg
 * #id">` на один общий файл спрайта, а не индивидуальные инлайновые копии
 * SVG на символ (career на R… нормализовал `single/<set>/<name>.svg` и
 * инлайнит их в витрину через `data-icon-src` + отдельный синхронизатор).
 * Из-за этого:
 *   - `career/tools/validate-showcase-icons.mjs` считает любой `<use>` на
 *     внешний спрайт «легаси» и роняет проверку — для Курсов это ложный
 *     сигнал: `<use>` здесь единственный нормативный способ, не пережиток;
 *   - `career/tools/sync-showcase-icons.mjs` синхронизирует инлайновые копии
 *     SVG с файлами на диске — у Курсов копий нет вообще: `<use>` читает
 *     файл спрайта напрямую при каждом рендере, синхронизировать нечего.
 * Перенесён по существу инварианта (§6.3), а не по тексту скрипта: ниже —
 * свой, более узкий инструмент под архитектуру `<use>` + общий спрайт.
 *
 * Что проверяется. В showcase/*.html — каждый `xlink:href`/`href`/`src`,
 * чьё значение указывает на файл ассета (распознаётся по расширению —
 * `.svg`/`.png`/… — а не по тому, содержит ли строка уже `ui/assets/`,
 * см. ниже находку 2):
 *   1. путь обязан быть локальным относительным (не начинаться с `http`,
 *      `//`, `career.habr.com`, `assets.habr.com` — любой внешний хост,
 *      и не быть сайт-абсолютным путём вида `/courses-web/…` — такой путь
 *      на витрине, поднятой `tools/serve.mjs`, не резолвится вовсе);
 *   2. путь обязан вести в `ui/assets/` — не в любую другую локальную папку;
 *   3. файл, на который он указывает (разрешённый от папки showcase/),
 *      обязан существовать на диске.
 * Продовый путь того же ассета в блоке «Анатомия» спецификации (не в
 * витрине) под это правило не попадает — это протокол снятого DOM,
 * а не разметка для копирования (METHOD §6, различение «Анатомия» / «Разметка»).
 *
 * До review-1 R2-01 (находка 2) `REF_PATTERN` требовал, чтобы подстрока
 * `ui/assets/` уже стояла в значении атрибута, — то есть проверял только
 * уже локализованное и тихо пропускал забытую прод-ссылку (относительную
 * `/courses-web/…` или полную `https://career.habr.com/…`) как «нечего
 * проверять», не засчитывая её ни в `checked`, ни в находку. Регэксп
 * переписан на поиск по расширению файла ассета — он матчит значение
 * атрибута независимо от того, что в нём уже написано, и локальность
 * (`ui/assets/`) проверяется отдельным шагом после, а не как условие
 * матчинга. Регрессия — `tools/validate-showcase-icons.selftest.mjs`.
 *
 * Запуск: node tools/validate-showcase-icons.mjs
 * Код возврата: 0 — сошлось; 1 — внешний хост, не-`ui/assets/`-путь или
 * не найденный файл; 2 — витрины ещё нет.
 */
import fs from 'node:fs';
import path from 'node:path';

const showcaseFiles = ['showcase/components.html', 'showcase/pages.html'];
const existing = showcaseFiles.filter((file) => fs.existsSync(file));

if (!existing.length) {
  console.error('Витрин ещё нет. Проверять пока нечего.');
  process.exit(2);
}

const EXTERNAL_HOST = /^(?:https?:)?\/\/|career\.habr\.com|assets\.habr\.com/i;

// Матчит значение атрибута по расширению файла ассета — независимо от того,
// что уже написано в пути (`ui/assets/…`, прод-относительный `/courses-web/…`
// или полный внешний URL) — расширение может стоять перед `?query` и/или
// `#fragment`, поэтому после него допускается любой хвост до закрывающей
// кавычки. Обычные ссылки (`.md`, `.css`, якоря `#id`, `data:,`) не содержат
// расширения ассета нигде в строке и не матчатся вовсе.
const REF_PATTERN = /(?:xlink:href|href|src)\s*=\s*"([^"]*\.(?:svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf)[^"]*)"/gi;

let checked = 0;
const externalRefs = [];
const unlocalizedRefs = [];
const missingFiles = [];

for (const file of existing) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(REF_PATTERN)) {
    checked += 1;
    const ref = match[1];
    if (EXTERNAL_HOST.test(ref)) {
      externalRefs.push(`${file}: ${ref}`);
      continue;
    }
    if (!ref.includes('ui/assets/')) {
      // Не внешний хост, но и не ui/assets/ — например, забытый
      // сайт-абсолютный прод-путь (`/courses-web/images/sprites/sprite.svg`)
      // без хоста вообще: на витрине, поднятой tools/serve.mjs, такой путь
      // не резолвится, а не «тихо ходит в прод» — но копируемость (METHOD
      // §6.1) он всё равно нарушает так же, как внешний хост.
      unlocalizedRefs.push(`${file}: ${ref}`);
      continue;
    }
    const assetPath = ref.split(/[?#]/)[0];
    const resolved = path.resolve(path.dirname(file), assetPath);
    if (!fs.existsSync(resolved)) missingFiles.push(`${file}: ${ref} → ${path.relative('.', resolved)}`);
  }
}

if (externalRefs.length || unlocalizedRefs.length || missingFiles.length) {
  if (externalRefs.length) {
    console.error(`Ссылка на ассет идёт через внешний хост (${externalRefs.length}):\n${externalRefs.join('\n')}`);
  }
  if (unlocalizedRefs.length) {
    console.error(`Ссылка на ассет не ведёт в ui/assets/ (${unlocalizedRefs.length}):\n${unlocalizedRefs.join('\n')}`);
  }
  if (missingFiles.length) {
    console.error(`Файл ассета не найден на диске (${missingFiles.length}):\n${missingFiles.join('\n')}`);
  }
  process.exit(1);
}

console.log(`Проверено ${checked} ссылок на ассеты в ${existing.length} файле(ах) витрины — все ведут в ui/assets/, все существуют.`);
