// Правила на витрине — выведенные из измерения, а не из впечатления.
//
// Голоса берутся из .pipeline/R2-bulk/invariants.json: там для каждой записи
// посчитано, какие классы стоят на КАЖДОМ её узле по всем страницам сразу.
// Классы, которых требует сам селектор переписи, из голосования вычтены —
// иначе правилом становилось бы условие собственного отбора.
//
// Формулировки написаны руками: единогласие делает класс кандидатом, а не
// правилом. Числа при этом не переписываются — они подставляются из измерения,
// и если измерение изменится, правило либо обновится, либо перестанет
// собираться (см. проверку votes ниже).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const inv = JSON.parse(fs.readFileSync(path.join(d, "invariants.json"), "utf8"));

// Каждое правило объявляет, на чём стоит: id записи, классы-носители и то,
// единогласны они или нет. Инструмент проверяет объявленное по измерению
// и отказывается собирать правило, которое разошлось с ним.
const RULES = [
  {
    id: "button-focus-contract",
    component: "button",
    requireUnanimous: ["focus:outline-none", "focus-visible:outline", "focus-visible:outline-ui-black-400", "disabled:pointer-events-none"],
    title: "Контракт фокуса и отключения у кнопки единогласен",
    text: `Каждая кнопка продукта несёт четыре класса состояния — <code>focus:outline-none</code>,
      <code>focus-visible:outline</code>, <code>focus-visible:outline-ui-black-400</code>
      и <code>disabled:pointer-events-none</code>. Собственный контур фокуса
      снимается и тут же заменяется своим, а отключённая кнопка перестаёт
      принимать указатель. Исключений нет.`,
    exception: `Исключений в выборке не найдено: ни одного узла, где хотя бы один из четырёх
      классов отсутствует. Это тот случай, когда «сняли фокус и не вернули» —
      обычный дефект доступности — в продукте не встречается ни разу.`,
  },
  {
    id: "button-dark-default",
    component: "button",
    requireNearly: ["bg-ui-black-850", "border-ui-black-850", "text-ui-white"],
    title: "Тёмная кнопка — умолчание, но не инвариант",
    text: `Тройка <code>bg-ui-black-850 border-ui-black-850 text-ui-white</code> стоит
      на большинстве кнопок, но не на всех. Это правило с исключениями, а не
      инвариант: тёмная кнопка — умолчание продукта, светлая существует и
      встречается.`,
    exceptionFrom: "bg-ui-black-850",
    exception: (n, total) => `Исключений ${total - n} из ${total}: узлы, где тройки нет — светлые
      и обводочные кнопки. Их разбор — работа шага R3-01, где Button получает
      собственную секцию и варианты; здесь названо только то, что вариант
      не один.`,
  },
  {
    id: "badge-dead-weight-class",
    component: "badge",
    requireUnanimous: ["text-semibold"],
    title: "Каждый бейдж несёт класс, у которого нет правила",
    text: `<code>text-semibold</code> стоит на всех бейджах без исключения — и не делает
      ничего: объявления у этого класса нет ни в одном из 22 файлов корпуса
      (проверено парсером). Насыщенность в продукте задаёт <code>font-semibold</code>,
      и он объявлен.`,
    exception: `Исключений нет — что и делает находку интересной: единогласие здесь
      означает не продуманное решение, а опечатку, размноженную по всем узлам.
      Строка заведена в <code>tools/known-missing-classes.json</code>, разбор —
      в разделе «Находки».`,
  },
  {
    id: "avatar-conflicting-object-fit",
    component: "avatar",
    requireUnanimous: ["object-cover", "object-contain"],
    title: "На каждом аватаре стоят два взаимоисключающих object-fit",
    text: `<code>object-cover</code> и <code>object-contain</code> — противоположные значения
      одного свойства, и оба стоят на одном узле. Побеждает <code>cover</code>:
      специфичность у них одинаковая, и решает порядок в таблице стилей,
      а <code>.object-cover</code> объявлен в корпусе позже. То есть аватар
      кадрируется, а не вписывается, — но написано это дважды и наоборот.`,
    exception: `Исключений нет: оба класса стоят на всех узлах сразу. Правило описывает
      не замысел, а состояние разметки; какое из двух значений задумано,
      по разметке не установить.`,
  },
  {
    id: "icon-button-layer",
    component: "icon-button",
    requireUnanimous: ["absolute", "z-10", "bg-ui-white", "border", "border-ui-black-100"],
    title: "Иконочная кнопка всегда лежит слоем поверх содержимого",
    text: `Каждая иконочная кнопка позиционирована абсолютно и поднята на
      <code>z-10</code>, с белым фоном и рамкой <code>border-ui-black-100</code>.
      Это не кнопка в потоке: она всегда накладывается — на карусель, на
      карточку, на изображение.`,
    exception: `Исключений в выборке не найдено.`,
  },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let html = fs.readFileSync(showcasePath, "utf8");
let added = 0;
const refused = [];

for (const r of RULES) {
  const v = inv[r.component];
  if (!v) { refused.push(`${r.id}: нет измерения по записи ${r.component}`); continue; }

  let votes, denom = v.total;
  if (r.requireUnanimous) {
    const missing = r.requireUnanimous.filter((c) => !v.unanimous.includes(c));
    if (missing.length) { refused.push(`${r.id}: измерение не подтверждает единогласие — ${missing.join(", ")}`); continue; }
    votes = v.total;
  } else {
    const rec = v.nearly.find((x) => x.cls === r.exceptionFrom);
    if (!rec) { refused.push(`${r.id}: класс ${r.exceptionFrom} не в почти-единогласных`); continue; }
    const all = r.requireNearly.map((c) => v.nearly.find((x) => x.cls === c)).filter(Boolean);
    if (all.length !== r.requireNearly.length) { refused.push(`${r.id}: не все классы тройки почти-единогласны`); continue; }
    if (new Set(all.map((x) => x.n)).size !== 1) { refused.push(`${r.id}: классы тройки расходятся в голосах — ${all.map((x) => x.cls + " " + x.n).join(", ")}`); continue; }
    votes = rec.n;
  }

  const start = html.indexOf(`id="c-${r.component}"`);
  if (start < 0) { refused.push(`${r.id}: секции c-${r.component} на витрине нет`); continue; }
  const secEnd = html.indexOf("\n    </section>", start);
  if (html.slice(start, secEnd).includes(`data-rule="${r.id}"`)) continue;

  const exception = typeof r.exception === "function" ? r.exception(votes, denom) : r.exception;
  const block = `
      <div class="doc-rule" data-rule="${esc(r.id)}">
        <div class="doc-rule__head">
          <h3>Правило</h3>
          <span class="doc-rule__votes">${votes} / ${denom}</span>
        </div>
        <p><strong>${esc(r.title)}.</strong> ${r.text}</p>
        <p class="doc-rule__exception">${exception}</p>
        <p class="doc-note">Голоса посчитаны по всем узлам, которые находит селектор
          переписи, на всех страницах записи сразу
          (<code>.pipeline/R2-bulk/measure-invariants.mjs</code>). Классы, которых
          требует сам селектор, из голосования вычтены: иначе правилом стало бы
          условие собственного отбора.</p>
      </div>
`;
  html = html.slice(0, secEnd) + "\n" + block + html.slice(secEnd);
  added++;
}

fs.writeFileSync(showcasePath, html, "utf8");
console.log(`Правил вставлено: ${added}`);
if (refused.length) {
  console.log(`Отказано (${refused.length}) — измерение не подтвердило:`);
  for (const x of refused) console.log("  " + x);
}
