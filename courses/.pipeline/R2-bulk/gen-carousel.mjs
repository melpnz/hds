// Carousel — единственная запись пакета с библиотечным корнем.
//
// Решение владельца 10 сентября: слой Swiper в ui/ не поднимать (продолжение
// R0-02), а запись описать как делегирование — продукт отдаёт поведение
// библиотеке. Форма корня — `vendor:swiper` (conventions.cssRoot, четвёртая
// форма): класс есть в снятой разметке и правила в ui/ не имеет по решению.
//
// Живого образца у записи нет и быть не может: без слоя библиотеки разметка
// не поедет. Вместо образца — структура кодом и прямое об этом заявление.
// Показать сломанную карусель и назвать это «живым примером» было бы враньём.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const manifestPath = path.join(pkg, "components/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const c = manifest.components.find((x) => x.id === "carousel");
const ex = JSON.parse(fs.readFileSync(path.join(d, "extracted/carousel.json"), "utf8")).instances[0];
const rs = JSON.parse(fs.readFileSync(path.join(d, "resolved/carousel.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SWIPER = /^(swiper|banner-swiper)/;

const swiperClasses = ex.classes.filter((x) => SWIPER.test(x)).sort();
const withRule = swiperClasses.filter((x) => rs.resolved[x]);
const withoutRule = swiperClasses.filter((x) => !rs.resolved[x]);
const ownClasses = ex.classes.filter((x) => !SWIPER.test(x)).sort();

// Структура: только каркас библиотеки, содержимое слайдов вырезано. Вырезание
// — редакторское действие, и оно названо: слайды несут карточки, у которых
// на витрине есть свои секции, и повторять их здесь незачем.
const skeleton = `<div class="swiper swiper-initialized swiper-horizontal">
  <div class="swiper-wrapper">
    <div class="swiper-slide swiper-slide-active"> … содержимое слайда … </div>
    <div class="swiper-slide swiper-slide-next"> … </div>
    <div class="swiper-slide"> … </div>
  </div>
</div>`;

const specRel = "collections/carousel.md";
const md = `# ${c.canonicalName}

| | |
|---|---|
| **Категория** | Коллекции (\`collections\`) |
| **Корневой класс** | \`vendor:swiper\` — корень библиотечный |
| **CSS** | нет в пакете: слой библиотеки в \`ui/\` не поднимается |
| **Живая реализация** | нет — см. «Почему нет живого примера» |
| **Snapshot** | ${(c.capturedStates || []).length} из ${(c.requiredStates || []).length} состояний снято |

## Когда использовать

Карусель в продукте — ${c.occurrences} вхождений на ${(c.seenOn || []).length} из 10 снятых страниц.
Продукт её не верстает: он подключает библиотеку Swiper и отдаёт ей и разметку
каркаса, и поведение.

## Почему корень библиотечный

Корень узла — \`swiper\`, и это класс библиотеки, а не продукта. Решением R0-02
пакет не поднимает библиотечный слой в \`ui/\` — тем же решением, которым
\`--swiper-theme-color\` оставлена за слоем: её объявляет чанк Swiper, а не
продукт. Решение подтверждено владельцем 10 сентября 2026 при разборе этой
записи.

Отсюда форма корня \`vendor:swiper\` (\`conventions.cssRoot\`, четвёртая форма).
Её проверка обратна обычной: класс обязан стоять в снятой разметке и обязан
**отсутствовать** в \`ui/\`. Если он там появится — значит слой подняли,
и корень уже не библиотечный.

## Почему нет живого примера

Без правил Swiper разметка каркаса не работает: слайды не выстраиваются в ряд,
прокрутки нет, активный слайд ничем не отличается от прочих. Поставить такую
разметку на витрину и подписать «живой пример» было бы неправдой, поэтому
структура ниже дана **кодом**, а не образцом.

Это и есть содержание записи: пакет говорит, что здесь продукт делегирует,
и называет границу — вот докуда доходит продукт, дальше начинается библиотека.

## Разметка

Каркас библиотеки; содержимое слайдов вырезано — их несут карточки, у которых
на витрине свои секции.

\`\`\`html
${skeleton}
\`\`\`

Полный снятый узел — ${ex.descendants} узлов, ${ex.classes.length} классов в поддереве
(\`evidence/source/production/pages/*/dom.html\`).

## Что чьё

**Классы библиотеки (${swiperClasses.length}).** ${swiperClasses.map((x) => "`" + x + "`").join(", ")}.

Из них у **${withRule.length}** есть правило в корпусе продакшена — их приносит чанк
Swiper: ${withRule.map((x) => "`" + x + "`").join(", ")}. У остальных **${withoutRule.length}**
правила нет в корпусе прод-CSS — ни в одном из 22 его файлов:
${withoutRule.map((x) => "`" + x + "`").join(", ")} — это классы, которые библиотека
проставляет рантаймом и использует как признаки состояния, а не как носители стиля.

**Классов продукта в поддереве — ${ownClasses.length}.** Они принадлежат содержимому слайдов
(карточкам), а не каркасу: сам каркас продукт не оформляет ничем.

## Состояния

Словарь и требуемость — [\`components/STATES.md\`](../STATES.md) (R1-01), снятость —
[\`components/STATE-CAPTURE.md\`](../STATE-CAPTURE.md) (R1-02).

| состояние | снято? | чем именно |
|---|---|---|
${(c.requiredStates || []).map((st) => {
  const captured = (c.capturedStates || []).includes(st);
  return `| \`${st}\` | ${captured ? "снято" : "GAP"} | ${captured
    ? "признак библиотеки в снятой разметке (`swiper-slide-active` и соседи); стиля к нему нет ни в одном источнике"
    : "рантайм библиотеки; гостем не воспроизводится, пакет его не описывает"} |`;
}).join("\n")}

## Ограничения

- **Копируемость (METHOD §6.1) для этой записи не выполняется, и это решение,
  а не пробел.** Разметку нельзя вставить на пустую страницу с одним
  \`ui/courses.css\` и получить карусель: нужен слой Swiper, которого в пакете
  нет намеренно.
- **Состояния каруселью не описываются.** \`swiper-slide-active\`,
  \`swiper-slide-prev\`, \`swiper-slide-next\` — признаки библиотеки, и меняет их
  она сама. Пакет их только называет.
- **Прозаические разделы не написаны.** Дописывает шаг ${c.step}.

## Источники

**Production.** ${(c.seenOn || []).join(", ")} — ${c.occurrences} вхождений.

**Figma.** Узел для этой записи не сопоставлен.

---

_Собрано bulk-проходом \`.pipeline/R2-bulk/gen-carousel.mjs\` из снятых доказательств._
`;

fs.mkdirSync(path.join(pkg, "components/collections"), { recursive: true });
fs.writeFileSync(path.join(pkg, "components", specRel), md, "utf8");

let html = fs.readFileSync(showcasePath, "utf8");
if (!html.includes('id="c-carousel"')) {
  const section = `
    <section class="doc-section" id="c-carousel">
      <div class="doc-section__head">
        <h4>${esc(c.canonicalName)}</h4>
        <p>${esc(c.notes || "")}</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>структура</h5>
          <code>vendor:swiper</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
          </span>
          <span class="doc-tag doc-tag--partial">partial</span>
        </div>
        <p class="doc-note"><strong>У этой записи нет живого примера — и это решение,
          а не пробел.</strong> Карусель продукт не верстает: он подключает библиотеку
          Swiper и отдаёт ей каркас и поведение. Слой библиотеки пакет в
          <code>ui/</code> не поднимает (решение R0-02, подтверждено владельцем
          10 сентября 2026), а без него разметка не работает: слайды не выстраиваются
          в ряд, прокрутки нет, активный слайд ничем не отличается от прочих.
          Поставить такую разметку образцом и подписать «живой пример» было бы
          неправдой, поэтому структура дана кодом.</p>
        <pre class="doc-code">${esc(skeleton)}</pre>
        <dl class="doc-spec">
          <div><dt>корень</dt><dd><code>vendor:swiper</code> — класс библиотеки, правила в <code>ui/</code> у него нет и не должно быть</dd></div>
          <div><dt>вхождений</dt><dd>${c.occurrences} на ${(c.seenOn || []).length}/10 страниц</dd></div>
          <div><dt>узлов в снятом поддереве</dt><dd>${ex.descendants}</dd></div>
          <div><dt>классов библиотеки</dt><dd>${swiperClasses.length} — с правилом ${withRule.length}, без правила ${withoutRule.length}</dd></div>
          <div><dt>классов продукта</dt><dd>${ownClasses.length} — все в содержимом слайдов, каркас продукт не оформляет</dd></div>
        </dl>
        <p class="doc-note"><strong>Где проходит граница.</strong> ${withRule.length} классов
          библиотеки приносит её чанк — они есть в корпусе прод-CSS. Остальные
          ${withoutRule.length} (<code>${withoutRule.map((x) => esc(x)).join("</code>, <code>")}</code>)
          не имеют правила в корпусе прод-CSS — ни в одном из 22 его файлов:
          библиотека проставляет их рантаймом как признаки состояния. Пакет их только называет — менять и описывать их поведение
          он не берётся. Разбор — <a href="../components/${specRel}">спецификация</a>.</p>
      </div>
    </section>
`;
  const catOpen = '<section class="doc-category" id="doc-cat-collections">';
  const idx = html.indexOf(catOpen);
  if (idx < 0) throw new Error("категория collections не найдена");
  const end = html.indexOf("\n  </section>", idx);
  const block = html.slice(idx, end);
  const emptyRe = /\n\s*<p class="doc-empty">[^<]*<\/p>/;
  html = html.slice(0, idx) + (emptyRe.test(block) ? block.replace(emptyRe, "\n" + section) : block + section) + html.slice(end);
  fs.writeFileSync(showcasePath, html, "utf8");
}

c.status = "partial";
c.specPath = specRel;
c.showcaseAnchor = "c-carousel";
c.cssRoots = ["vendor:swiper"];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Carousel: корень vendor:swiper, классов библиотеки ${swiperClasses.length} (с правилом ${withRule.length}), классов продукта ${ownClasses.length}`);
