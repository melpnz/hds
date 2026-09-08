import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Правки манифеста по review-3. Скриптом, а не руками, чтобы каждая была
// адресной и воспроизводимой: 2645 строк JSON правятся руками с ошибками.

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(here, "../../components/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const byId = new Map(manifest.components.map((component) => [component.id, component]));
const log = [];
function set(id, apply) {
  const component = byId.get(id);
  if (!component) throw new Error(`нет записи ${id}`);
  apply(component);
  log.push(id);
}

// --- major 1: chip. Прежнее объяснение «вариант с max-w для длинных
// значений» измерением опровергнуто: группы разделены не длиной значения,
// а ролью в ряду, и разделены полностью.
set("chip", (chip) => {
  chip.productionEvidence[0].note =
    "селектор находит обе роли одного ряда: 143 метки («1С разработка», «Git») и 96 счётчиков переполнения («+9», «+26»), 143/143 и 96/96 без исключений. " +
    "Различает их один утилитный класс: у меток есть max-w-[calc(100%-48px)], у счётчиков нет. Это не «вариант для длинных значений», а резерв 48px под счётчик, " +
    "стоящий в конце того же ряда: рядов 96, счётчик — последний ребёнок ряда в 96 случаях из 96, вне ряда меток не встречается ни разу (0 из 96), " +
    "рядов без счётчика на dom.html нет. Коробка у обеих ролей одна и та же: bg-ui-black-50 flex gap-0.5 items-center px-2 py-1 rounded-full. " +
    "Самостоятельный счётчик «+N» в реестре есть отдельной записью counter-pill (28 узлов, другая коробка: border-ui-white, h-[24px], text-micro, text-ui-black-500); " +
    "множества узлов chip и counter-pill не пересекаются.";
  chip.notes =
    "нейтральный pill: bg #f1f1f1, px 8, py 4, radius 9999. Две роли в одном ряду — метка и счётчик переполнения «+N»; отличает их только max-w-[calc(100%-48px)] " +
    "на метках, резерв под счётчик (см. productionEvidence[].note). " +
    "Единственная запись реестра, чьё число зависит от ширины снимка: 239 на dom.html (1440), 249 на dom-768, 330 на dom-375 — остальные 43 дают одно и то же на всех трёх. " +
    "Причина измерена: рядов всегда 96, а сколько меток показать до счётчика, решает раскладка — меток 143 / 155 / 238 на 1440 / 768 / 375, счётчиков 96 / 94 / 92, " +
    "рядов, уместившихся целиком и оставшихся без счётчика, — 0 / 2 / 4. Число реестра снято на dom.html, то есть на 1440. " +
    "GAP: одна это форма дизайн-системы или две, по макету не установлено — запись ссылается на tag/text/* по componentKey без nodeId, узел библиотеки не открывается. Решается на R2-06.";
});

// --- аудит-3, проба 2: note записи page-hero объясняла один лишний узел
// из двух. Измерено: 9 = 7 настоящих hero + обёртка RubricationBar + пустая
// обёртка того же класса, обе на /courses.
set("page-hero", (hero) => {
  hero.productionEvidence[0].note =
    "селектор шире элемента на два узла, и оба на /courses: 9 = 7 настоящих PageHero (по одному на страницу) + обёртка с тем же классом bg-main-gradient-second, " +
    "внутри которой лежит RubricationBar, + вторая такая же обёртка, пустая (внутри только заглушки Vue, ни hero, ни бара). " +
    "Прежняя оговорка называла из этих двух только первый.";
});

// --- аудит-3, проба 2: ad-card. Плашка с ИНН и erid есть не у всех.
set("ad-card", (card) => {
  card.notes =
    "рекламный слайд: две картинки (desktop и mobile) + метка «РЕКЛАМА» rounded-[60px] text-[8px] opacity .7 + кнопка закрытия 24×24 + раскрываемая плашка с ИНН и erid. " +
    "Измерено: раскрываемую плашку несут 20 узлов из 52, остальные 32 — только пара <img> без подписи; " +
    "сигнатура у всех 52 одна, это один элемент в двух составах, а не два элемента. " +
    "Формально не часть дизайн-системы, но занимает верх каждой витрины";
});

// --- minor 13: у breadcrumbs макет — единственный источник, а ссылка на
// него была самой бедной в реестре. Узел открыт (get_metadata).
set("breadcrumbs", (crumbs) => {
  crumbs.figmaEvidence[0].sourceName = "Хлебные крошки";
  crumbs.figmaEvidence[0].layerName = "Хлебные крошки";
  crumbs.figmaEvidence[0].url =
    "https://www.figma.com/design/oNyNRRob2y0ZSgPHOdH65X/02_Education-NEW?node-id=9902-39188";
  crumbs.figmaEvidence[0].note =
    "компонент «Хлебные крошки» 236×20: четыре текста (39, 41, 42, 42 шириной) и три экземпляра icon/arrow-down 20×20 между ними. Снято get_metadata 2026-09-08";
});

// --- major 2: строки figmaEvidence, не адресующие ничего. Их четыре, а не
// одна: все четыре — имя семейства или стиля в библиотеке, а не узел.
// METHOD §3 требует ссылку и node key; имя семейства ни тем, ни другим не
// является. Наблюдения не выбрасываются — переезжают в notes слово в слово.
set("empty-state", (state) => {
  state.figmaEvidence = state.figmaEvidence.filter((evidence) => evidence.sourceName !== "no_content/*");
  state.notes =
    "figma-only: в снятой публичной части пустых выдач нет. §10.11 исследования описывает пустое состояние как факт продакшена — не подтверждено. " +
    "Иллюстрация: в education-lib есть семейство no_content/* — поиск по библиотеке отдаёт 20 компонентов с именами до no_content/25. " +
    "Какой из них стоит в нулевой выдаче 12135:122610, не установлено, поэтому ключ не выбран: строка figmaEvidence, называвшая «no_content/*» без nodeId и componentKey, " +
    "не адресовала ничего и убрана (review-3, major 2)";
});
set("social-icon", (icon) => {
  icon.figmaEvidence = icon.figmaEvidence.filter((evidence) => evidence.sourceName !== "Logo brand/*");
  icon.notes =
    "6 значков: vk, twitter, telegram, telegram-bot, facebook, instagram; instagram — градиентная заливка класса .instagram-gradient. " +
    "Строка figmaEvidence «Logo brand/* в education-lib, токены logo/*» убрана: она не адресовала ни узла, ни ключа, и вдобавок называла не тот файл — " +
    "семейство Logo brand/* лежит в библиотеках «Логотипы брендов» и «UI kit», а не в education-lib (поиск по библиотекам, 2026-09-08). " +
    "Сопоставить значки конкретным компонентам — на R2-02";
});
set("icon-button", (button) => {
  button.figmaEvidence = button.figmaEvidence.filter((evidence) => evidence.sourceName !== "elements/button/icon");
  button.notes =
    "три варианта: стрелка карусели 36×36 bg #fff border #e9e9ea; синяя 36×36 bg-ui-blue-50 border-ui-blue-300; закрытие рекламы 24×24 bg #fff opacity .7. " +
    "Наблюдение по макету, снятое инвентаризацией без адреса узла: elements/button/icon — fill #fff, border #e9e9ea, icon #a6a7a9, padding 6, border_radius 200. " +
    "Строка figmaEvidence убрана (ни nodeId, ни componentKey — не evidence по METHOD §3); узел ищется на R2-05";
});
set("link", (link) => {
  link.figmaEvidence = link.figmaEvidence.filter((evidence) => evidence.sourceName !== "color style/font/link");
  link.notes =
    "в проде ссылка чаще НЕ синяя: text-ui-black-850 + hover:underline (футер, каталоги ссылок, карточки). Синий #346ef4 в снятой разметке не доминирует. " +
    "Разобрать, где какой регистр, — иначе правило «ссылки синие» будет ложным. " +
    "Наблюдение по макету без адреса узла: стиль color style/font/link #346ef4; в education-lib встречается второй color/font/link #1463d9. " +
    "Строка figmaEvidence убрана — стиль это не узел и не componentKey (METHOD §3); разбирается на R2-04";
});

// --- note 17: countingRule молчал о наложении множеств узлов, а именно
// наложение было существом review-1 major 4. Плюс ширина снимка (major 1).
manifest.countingRule =
  "occurrences — сколько узлов находит селектор productionEvidence в снятом DOM десяти страниц; seenOn — страницы, где он находит хотя бы один. " +
  "Меряется по dom.html, снятому на 1440 (самая широкая из --widths инструмента capture); рядом лежат dom-375.html и dom-768.html, и по ним числа перемеряются на устойчивость. " +
  "Это измерение, а не заметка инвентаризации: снимается node tools/measure-selectors.mjs в components/selector-census.json и сверяется с реестром гейтом node tools/validate-components.mjs. " +
  "Измерение и сверка — разные прогоны намеренно: инструмент, который сверяет и тут же подгоняет числа под найденное, делает собственную проверку истинной. " +
  "Там, где селектор заведомо шире или уже документируемого элемента, это сказано в productionEvidence[].note, а не спрятано в разнице чисел. " +
  "Там же объясняется улов, распавшийся на две формы содержимого при одной коробке (chip: метка и счётчик «+N»), и число, зависящее от ширины снимка. " +
  "Множества узлов разных записей вкладываться могут, и запрет «один селектор на две записи» этого не ловит — он сравнивает строки селекторов. " +
  "Измеренные наложения на dom.html два, оба ожидаемые: social-icon ⊂ link (60 из 60 — значки соцсетей это <a>) и button ∩ link = 19 (кнопки, отрисованные как <a>). " +
  "Запись, чьи узлы вкладываются в чужие, обязана называть это в productionEvidence[].note; для link это сказано прямо — его число верхняя граница, а не число мест применения Link.";

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Правлено записей: ${log.length} — ${log.join(", ")}; плюс countingRule.`);
