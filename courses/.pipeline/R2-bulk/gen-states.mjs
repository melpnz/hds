// Блок «состояния» в секции каждой записи витрины.
//
// Источник — components/STATE-CAPTURE.md §3 (R1-02): там для каждой пары
// «запись × состояние» уже сказано, снята она и чем именно. Таблица здесь —
// та же разметка, сведённая к записи, а не новое утверждение.
//
// Образец добавляется только там, где состояние отличается от default самой
// разметкой: selected, current, empty, disabled. Состояния, снятые классом
// (hover:*, focus-visible:*), отдельного образца не получают — их показывает
// живьём тот самый элемент, который уже стоит выше в блоке «default»: классы
// на нём настоящие и подняты в ui/utilities-components.css. Копия ради
// скриншота была бы вторым носителем тех же значений, а это ровно тот класс
// дефектов, ради которого заведён гейт validate-showcase-claims.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");

const manifest = JSON.parse(fs.readFileSync(path.join(pkg, "components/manifest.json"), "utf8"));
const byId = new Map(manifest.components.map((c) => [c.id, c]));
const results = JSON.parse(fs.readFileSync(path.join(d, "results.json"), "utf8")).filter((r) => !r.skipped);
const variants = JSON.parse(fs.readFileSync(path.join(d, "states-markup.json"), "utf8"));

// ---------- разбор §3 STATE-CAPTURE ----------
const md = fs.readFileSync(path.join(pkg, "components/STATE-CAPTURE.md"), "utf8");
// Строки «запись | состояние(я) | исход | основание» по всему файлу. Ячейка
// состояния может нести несколько состояний и пометку («`hover` (ослаблено)»,
// «`hover`, `focus-visible`») — берутся все. По паре действует последняя
// строка файла: §8 (пересмотр 11 сентября) отменяет §3.1 и §7 по тем же
// парам. Первая редакция брала только строки с одним состоянием, и у девяти
// записей блока «состояния» не было вовсе.
const allowed = new Set(manifest.allowedStates || []);
const sectionAt = [...md.matchAll(/^## (\d+)\./gm)].map((m) => ({ at: m.index, n: m[1] }));
const sectionOf = (i) => (sectionAt.filter((x) => x.at <= i).pop() || { n: "?" }).n;
const pairs = new Map(); // "id|state" -> {state, outcome, source, section}
for (const m of md.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|([^|\n]+)\|\s*([^|\n]+?)\s*\|\s*([^|\n]+?)\s*\|\s*$/gm)) {
  const [, id, stateCell, outcomeRaw, source] = m;
  if (!byId.has(id)) continue;
  const states = [...stateCell.matchAll(/`([a-zA-Z-]+)`/g)].map((x) => x[1]).filter((x) => allowed.has(x));
  const outcome = outcomeRaw.replace(/\*\*/g, "").trim();
  for (const state of states) pairs.set(`${id}|${state}`, { state, outcome, source: source.trim(), section: sectionOf(m.index) });
}
const table = new Map(); // id -> строки в порядке requiredStates
for (const c of manifest.components) {
  const rows = c.requiredStates.filter((st) => st !== "default").map((st) => pairs.get(`${c.id}|${st}`)).filter(Boolean);
  if (rows.length) table.set(c.id, rows);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Цитаты STATE-CAPTURE содержат куски разметки вида class="a b c". В прозе
// это не атрибут, а перечисление классов, но в сыром тексте страницы выглядит
// настоящим атрибутом: validate-classes считывал оттуда «классы», и среди них
// оказывалось многоточие из сокращённой цитаты. Поэтому в подписи остаётся
// сам список классов, а слово class= и кавычки убираются: смысл цитаты тот же,
// поддельного атрибута на странице нет.
const stripClassAttr = (s) => s.replace(/class\s*=\s*"([^"]*)"/g, "$1");

const mdInline = (s) => esc(stripClassAttr(s))
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/×(\d+)/g, "×$1");

const CAPTURED = (o) => o.startsWith("снято");
const NORMATIVE = (o) => o.includes("норматив");

// Корень, к которому можно приписать атрибут disabled: только настоящий
// элемент формы. У div-обёрток атрибут ничего не делает, и подставлять его
// туда — врать образцом.
const disableable = (html) => /^<(button|input|select|textarea|fieldset)\b/.test(html.trim());
const withDisabled = (html) => html.replace(/^(<[a-z]+)/, "$1 disabled");

function variantBlock(label, markup, note) {
  return `          <div class="doc-variant">
            <span class="doc-variant__label">${label}</span>
            <div class="doc-variant__row">
              ${markup}
            </div>${note ? `\n            <span class="doc-variant__label">${note}</span>` : ""}
          </div>`;
}

// Образцы figma-only: состояние, которое макет рисует отдельной разметкой,
// а в блоке default его нет.
const FIGMA_SAMPLES = {
  "faq-item/collapsed": {
    html: '<div class="crs-faq-item" style="max-width:645px"><button type="button" class="crs-faq-item__question" aria-expanded="false"><span class="crs-faq-item__title">Текст вопроса</span><span class="crs-faq-item__chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></button></div>',
    label: "<code>collapsed</code> — узел макета 12194:79328, вопрос в «СЕО-блок / FAQ»",
    note: "Без блока ответа и с шевроном вниз: модификатор <code>--expanded</code> снят. Подпись «Текст вопроса» — заглушка библиотечного варианта.",
  },
};
const SRC = {
  production: '<span class="doc-src doc-src--production" title="production" aria-label="production">П</span>',
  "storybook-only": '<span class="doc-src doc-src--storybook" title="storybook-only" aria-label="storybook-only">S</span>',
  "figma-only": '<span class="doc-src doc-src--figma" title="figma-only" aria-label="figma-only">F</span>',
};
const TAG = (st) => `<span class="doc-tag${st === "complete" ? " doc-tag--complete" : st === "partial" ? " doc-tag--partial" : ""}">${esc(st)}</span>`;
const FIGMA_NOTE = `
        <p class="doc-note"><strong>Снятым у figma-only записи считается нарисованное в макете.</strong>
          METHOD §4 называет узел Figma источником факта наравне с DOM и CSS
          сборки. Состояние, которое макет не рисует и переменной не задаёт,
          остаётся «без снятия», даже если вёрстка показывает его по конвенции.</p>`;

let added = 0, samples = 0;
let html = fs.readFileSync(showcasePath, "utf8");

// Записи, чей блок «состояния» пишет свой генератор, а не этот шаблон.
// Link собирает .pipeline/R2-bulk/gen-link.mjs: у ссылки реакция приходит от
// правила на теге, а не от классов разметки, и строка default в её таблице
// своя. Первая пересборка на месте заменила этот блок общим шаблоном и
// потеряла и то, и другое.
const OWNED_ELSEWHERE = new Set(["link"]);

for (const r of manifest.components) {
  if (OWNED_ELSEWHERE.has(r.id)) continue;
  const rows = table.get(r.id);
  if (!rows || !rows.length) continue;
  const c = byId.get(r.id);
  const start = html.indexOf(`id="c-${r.id}"`);
  if (start < 0) continue;
  const secEnd = html.indexOf("\n    </section>", start);
  // Блок пересобирается на месте. Первая редакция вставляла его один раз и
  // дальше пропускала секцию, поэтому исправление шаблона до витрины не
  // доходило: общая фраза про живой hover осталась у записей, у которых
  // hover снят как отсутствие реакции.
  // Хвостовой перевод строки необязателен: у последнего блока секции за
  // «</div>» сразу идёт «</section>», а срез секции обрезан перед ним. Без
  // этого блок Link не находился, и прогон вставлял ему второй блок.
  const existing = /\n\n      <div class="doc-specimen">\n        <div class="doc-specimen__head">\n          <h5>состояния<\/h5>[\s\S]*?\n        <\/table>\n      <\/div>(?:\n|$)/.exec(html.slice(start, secEnd));

  const blocks = [];

  // 1. Состояния с собственной разметкой — извлечены из прод-DOM.
  for (const row of rows) {
    const v = variants[`${r.id}/${row.state}`];
    if (!v || !CAPTURED(row.outcome)) continue;
    let markup = v.html.replace(/\s+data-v-[0-9a-f]+(?:="")?/g, "");
    markup = markup.replace(/((?:xlink:href|href|src)\s*=\s*")([^"]*\.(?:svg|png|jpe?g|gif|webp)[^"]*)(")/gi,
      (mm, pre, ref, post) => {
        // Спрайты сохраняют свою цель: <use> в заглушку не работает вовсе —
        // у неё нет символов, и образец рисует пустую коробку. Первая
        // редакция так и потеряла стрелку у отключённой кнопки.
        if (/sprite\.svg/.test(ref)) return pre + ref.replace(/^.*sprite\.svg(?:\?[^#]*)?/, "../ui/assets/icons/sprite.svg") + post;
        if (/social-v3\.1\.svg/.test(ref)) return pre + ref.replace(/^.*social-v3\.1\.svg(?:\?[^#]*)?/, "../ui/assets/icons/social-v3.1.svg") + post;
        if (/external-profile\.svg/.test(ref)) return pre + ref.replace(/^.*external-profile\.svg(?:\?[^#]*)?/, "../ui/assets/icons/external-profile.svg") + post;
        if (/user_avatar_2\.svg/.test(ref)) return pre + "../ui/assets/images/user_avatar_2.svg" + post;
        if (/avatars\/logo\.svg/.test(ref)) return pre + "../ui/assets/images/logo.svg" + post;
        return pre + "../ui/assets/images/content-placeholder.svg" + post;
      });
    const added = v.attrAdded
      ? ` Атрибут <code>${esc(v.addAttr)}</code> на образце проставлен витриной — в этом узле продукта его нет, а правила состояния включает именно он.`
      : "";
    blocks.push(variantBlock(
      `<code>${esc(row.state)}</code> — своя разметка, ${v.total} узл${v.total === 1 ? "ёл" : v.total < 5 ? "а" : "ов"} на ${v.seen}/10 страниц (страница <code>${esc(v.page)}</code>)`,
      markup,
      `STATE-CAPTURE.md §${row.section} говорит: «${mdInline(v.why)}».${added}`,
    ));
    samples++;
  }

  for (const row of rows) {
    const f = FIGMA_SAMPLES[`${r.id}/${row.state}`];
    if (!f || !CAPTURED(row.outcome)) continue;
    blocks.push(variantBlock(f.label, f.html, f.note));
    samples++;
  }

  // 2. Таблица по всем состояниям записи.
  const trs = rows.map((row) => {
    const mark = CAPTURED(row.outcome) ? "снято" : NORMATIVE(row.outcome) ? "норматив" : "GAP";
    // Источник — дословная цитата принятого документа, а не утверждение
    // витрины. Оформляется глаголом цитирования и кавычками-ёлочками:
    // так её видит и человек, и гейт (tools/validate-showcase-claims.mjs,
    // раздел о цитатах). Без этого отрицания внутри цитаты («нет
    // outline-none») читались как утверждение витрины о слое ui/.
    return `            <tr><td><code>${esc(row.state)}</code></td><td>${esc(mark)}</td><td>STATE-CAPTURE.md §${row.section} говорит: «${mdInline(row.source)}»</td></tr>`;
  }).join("\n");

  const captured = rows.filter((x) => CAPTURED(x.outcome)).length;
  const gaps = rows.length - captured;
  // «Снято» у hover бывает находкой «реакции нет»: «без hover:*», «не несёт
  // hover:*», «ничего не меняет». Обещать для такой записи «наведите
  // указатель, и состояние сработает» — неправда витрины: замер 14 сентября
  // 2026 навёл курсор на образцы 24 записей с этой фразой, и видимая реакция
  // нашлась у шести. Признак берётся из самой строки STATE-CAPTURE, а не из
  // замера: центр образца попадает и в промежуток между номерами листания.
  const noReaction = (source) => {
    const s = source.replace(/`/g, "");
    const absent = /без hover:\*|не несёт hover:\*|нет hover:\*|ни [^;]*hover:\*|hover:\* на поле нет|ничего не меняет|видимого изменения при наведении[^;]*нет/.test(s);
    const named = /hover:(?!\*|no-underline)[a-z]|group-hover:|:hover\{/.test(s.replace(/реальный hover несёт[^)]*\)/g, ""));
    return absent && !named;
  };
  const liveStates = rows.filter((x) => CAPTURED(x.outcome) && ["hover", "focus-visible"].includes(x.state) && !(x.state === "hover" && noReaction(x.source))).map((x) => x.state);
  const silentHover = rows.some((x) => CAPTURED(x.outcome) && x.state === "hover" && noReaction(x.source));

  // Действие в пометке называется по тем состояниям, что остались живыми:
  // если hover снят как отсутствие реакции, звать «наведите указатель» нельзя.
  const one = liveStates.length === 1;
  const seen = one ? "смотрится" : "смотрятся";
  const them = one ? "него" : "них";
  const action = [liveStates.includes("hover") ? "наведите указатель" : null, liveStates.includes("focus-visible") ? "дойдите до элемента клавишей Tab" : null].filter(Boolean).join(" или ");
  const live = liveStates.length && c.sourceScope === "figma-only"
    ? `<p class="doc-note"><strong>${liveStates.map((s) => `<code>${s}</code>`).join(" и ")} ${seen} на живом элементе.</strong>
          Правило состояния объявлено в CSS записи по переменной или узлу макета
          (или действует базовое правило слоя <code>ui/foundations.css</code>, если так
          сказано в таблице) — ${action} в блоке «default» выше. Отдельный образец
          был бы вторым носителем тех же значений.</p>`
    : liveStates.length
    ? `<p class="doc-note"><strong>${liveStates.map((s) => `<code>${s}</code>`).join(" и ")} ${seen} на живом элементе.</strong>
          Отдельного образца у ${them} нет намеренно: классы состояний стоят на самой
          разметке блока «default» выше и подняты в
          <code>ui/utilities-components.css</code> — ${action}, и состояние сработает
          по-настоящему. Копия ради скриншота была бы вторым носителем тех же
          значений, а расходящиеся носители — ровно тот класс дефектов, из-за
          которого заведён гейт <code>tools/validate-showcase-claims.mjs</code>.</p>`
    : "";

  const block = `
      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>состояния</h5>
          <code>${captured} снято · ${gaps} без снятия</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            ${SRC[c.sourceScope] || SRC.production}
          </span>
          ${TAG(c.status)}
        </div>
        <p class="doc-note">Разметка пар «запись × состояние» — из
          <a href="../components/STATE-CAPTURE.md">STATE-CAPTURE.md</a>: §3 (шаг R1-02,
          принят 9 сентября 2026), §7 (записи, добавленные 11 сентября) и §8
          (пересмотр по макету 11 сентября; по паре действует последняя строка).
          Таблица ниже — та же разметка, сведённая к этой записи; словарь и
          требуемость — <a href="../components/STATES.md">STATES.md</a>.</p>${c.sourceScope === "figma-only" ? FIGMA_NOTE : ""}
${blocks.length ? `        <div class="doc-stage doc-stage--grid">\n${blocks.join("\n")}\n        </div>\n` : ""}        ${live}${silentHover ? `<p class="doc-note"><strong><code>hover</code> снят как отсутствие реакции.</strong>
          Наведение на эту запись ничего не меняет — так в продукте, а не пробел
          витрины: основание в строке таблицы ниже.</p>` : ""}
        <table class="doc-table">
          <thead><tr><th>состояние</th><th>снято?</th><th>чем именно</th></tr></thead>
          <tbody>
${trs}
          </tbody>
        </table>
      </div>
`;
  if (existing) {
    const at = start + existing.index;
    html = html.slice(0, at) + "\n" + block + html.slice(at + existing[0].length);
  } else {
    html = html.slice(0, secEnd) + "\n" + block + html.slice(secEnd);
  }
  added++;
}

fs.writeFileSync(showcasePath, html, "utf8");
console.log(`Блоков «состояния» вставлено: ${added}, живых образцов состояний: ${samples}`);
