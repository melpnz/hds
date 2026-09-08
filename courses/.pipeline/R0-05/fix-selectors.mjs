// Разовая правка по review-1 (major 3, major 4, minor 14): селекторы,
// адресующие не тот узел, и числа occurrences/seenOn, перенесённые
// из инвентаризации без сверки. Числа после правки пересчитываются
// check-selectors.mjs — этот скрипт только меняет селекторы и заметки.
import fs from "node:fs";

const path = "components/manifest.json";
const manifest = JSON.parse(fs.readFileSync(path, "utf8"));

const patches = {
  // major 3: селектор не разбирался браузером (SyntaxError на xlink:href)
  "sprite-icon": {
    selector: "svg.svg-icon",
    note: "прежний селектор use[xlink:href*='sprite.svg'] браузером не разбирается (SyntaxError) и после экранирования не находит ничего",
  },
  // major 4: ловил чипы, а не полосу
  "filter-bar": {
    selector: "div.flex.gap-1.overflow-x-auto.whitespace-nowrap",
    note: "полоса целиком; прежний селектор div > button.h-9… считал отдельные чипы (139) и совпадал с filter-chip",
  },
  // major 4: структурный селектор без единого свойства элемента
  "info-table": {
    selector: "div.grid.grid-cols-2.gap-x-4.gap-y-3.text-small",
    note: "сетка пар «лейбл → значение»; прежний section:last-of-type адресовал последнюю секцию любой страницы (13 узлов на 9 страницах)",
  },
  // селектор адресовал потомка, а не сам элемент — тот же дефект
  "segmented-control": {
    selector: "div.bg-ui-black-transparent-120.rounded-xl.w-max",
    note: "контейнер переключателя; прежний селектор считал сегменты-ссылки внутри него",
  },
  section: {
    selector: "section.flex.flex-col.gap-4",
    note: "секция целиком; прежний селектор считал заголовки h2 внутри неё",
  },
  // селектор был уже элемента: кнопка рендерится и как <button>, и как <a>
  button: {
    selector: "button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold",
    note: "обе формы рендера; прежний селектор считал только <button>",
  },
  // панель фильтров продублирована мобильным и планшетным поддеревьями (R0-00 §3.6)
  select: {
    selector: ".gap-\[1px\] > div.w-full",
    note: "панель фильтров приходит в разметке дважды — мобильным и планшетным поддеревом (R0-00 §3.6), поэтому каждый контрол считается два раза",
  },
};

const notes = {
  link: "селектор нарочно широкий: считает каждый <a> страницы, включая навигацию и ссылки внутри карточек. Число — верхняя граница, а не количество мест, где применён Link",
  "icon-button": "селектор покрывает только вариант «стрелка карусели»; синяя 36×36 и закрытие рекламы 24×24 этим селектором не считаются",
  "entity-logo": "селектор покрывает вариант с белой рамкой 2px (карточка школы); логотип в профиле автора (h-12 w-12 rounded-xl, без рамки) им не считается",
  "page-hero": "на /courses тот же класс bg-main-gradient-second несёт RubricationBar, поэтому в счёт попадает и он",
  "avatar-stack": "считаются стопки, а не аватары внутри них",
  "article-card": "клонов слайдов в снятом DOM нет (.swiper-slide-duplicate не встречается) — все найденные узлы настоящие",
};

for (const component of manifest.components) {
  const patch = patches[component.id];
  if (patch) {
    const evidence = component.productionEvidence[0];
    evidence.selector = patch.selector;
    evidence.note = evidence.note ? `${evidence.note}; ${patch.note}` : patch.note;
  }
  if (notes[component.id]) {
    const evidence = component.productionEvidence[0];
    evidence.note = evidence.note ? `${evidence.note}; ${notes[component.id]}` : notes[component.id];
  }
}

fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
console.log("селекторов заменено:", Object.keys(patches).length, "заметок добавлено:", Object.keys(notes).length);
