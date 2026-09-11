// Спецификации и секции витрины для записей sourceScope: figma-only.
//
// Разметка этих записей написана по узлам макета, а не снята с продукта:
// в продакшене их нет вовсе. Это единственное место пакета, где вёрстка
// не воспроизводит снятое, и на витрине это сказано словами и значком F,
// а не подразумевается статусом.
//
// Статус у таких записей терминальный — `figma-only` (правило манифеста:
// sourceScope figma-only не доходит до complete/partial). Корень — введённое
// пакетом имя crs-<id>: снятой разметки, из которой можно было бы взять
// настоящий класс, не существует.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const showcasePath = path.join(pkg, "showcase/components.html");
const manifestPath = path.join(pkg, "components/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const byId = new Map(manifest.components.map((c) => [c.id, c]));

const ARROW = '<svg class="svg-icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg>';

// CatalogMenu: список направлений и колонки курсов — дословно из узла
// макета 14644:221760 «Карточки». Порядок пар повторяет порядок строк.
const CATALOG_DIRECTIONS = [
  ["code", "Программирование и IT"], ["analytics", "Аналитика и Data Science"],
  ["design", "Дизайн и контент"], ["business", "Бизнес и менеджмент"],
  ["marketing", "Маркетинг и продажи"], ["finance", "Финансы и бухгалтерия"],
  ["hr", "HR и рекрутинг"], ["hobby", "Хобби и творчество"],
  ["wellness", "Красота и здоровье"], ["cooking", "Кулинария"],
  ["psychology", "Психология"], ["growth", "Саморазвитие и soft skills"],
  ["software", "Прикладные программы"], ["pedagogy", "Педагогика"],
  ["languages", "Языки"],
];
// Первые двенадцать строк каждой колонки. «1C-Программирование» — с латинской
// C, «1С Битрикс» — с кириллической С: так в макете.
const CATALOG_COLUMNS = [
  ["1C-Программирование", "1С Битрикс", "Администрирование Windows", "Алгоритмы и структуры данных", "Архитектор ПО", "Автоматизация тестирования", "Автоматизация тестирования на Python", "Backend-разработка", "Bootstrap", "CentOS", "CI/CD", "Composer"],
  ["Groovy", "Haskell", "IntelliJ IDEA", "IOS-разработка", "Java Middle", "Java-разработка", "JavaScript-разработка", "Jenkins", "Jira", "Joomla", "Junior Python-разработка", "Junior QA-тестировщик"],
  ["Haskell", "IntelliJ IDEA", "IOS-разработка", "Java Middle", "Java-разработка", "JavaScript-разработка", "Jenkins", "Jira", "Joomla", "Junior Python-разработка", "Junior QA-тестировщик", "Kubernetes"],
];
// Детский каталог — «каталог детей 🎀» 14657:224732: свой список
// направлений (текущее — «Подготовка к олимпиадам») и справа группы.
// «Матемитика» и «Английския язык» — опечатки макета, перенесены как есть.
const CATALOG_KIDS_DIRECTIONS = [
  ["ege", "Подготовка к ЕГЭ"], ["oge", "Подготовка к ОГЭ"], ["dvi", "Подготовка к ДВИ"],
  ["vpr", "Подготовиться к ВПР"], ["trophy", "Подготовка к олимпиадам"], ["backpack", "Подготовка к школе"],
  ["growth", "Улучшить оценки"], ["home", "Домашнее обучение"], ["hobby", "Найти хобби"],
  ["code", "Научиться программировать"], ["languages", "Выучить иностранный язык"],
  ["globe", "Расширить кругозор"], ["college", "Поступить в колледж"],
];
const CATALOG_KIDS_GROUPS = [
  ["По предметам", [["Матемитика", "Русский язык", "Обществознание", "Информатика"], ["Биология", "Физика", "История"], ["Английския язык", "Химия", "Литература"]]],
  ["По возрасту", [["1 класс", "2 класс", "3 класс", "4 класс"], ["5 класс", "6 класс", "7 класс", "8 класс"], ["9 класс", "10 класс", "11 класс"]]],
];
const SPRITE = (id, rot = 0) => `<svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;${rot ? `transform:rotate(${rot}deg);` : ""}"><use xlink:href="../ui/assets/icons/sprite.svg#${id}"></use></svg>`;
const CATALOG = (kids) => {
  const dirs = kids ? CATALOG_KIDS_DIRECTIONS : CATALOG_DIRECTIONS;
  const current = kids ? 4 : 0;
  const course = (t) => `<a href="#c-catalog-menu" class="crs-catalog-menu__course">${t}</a>`;
  const right = kids
    ? `  <div class="crs-catalog-menu__groups">
${CATALOG_KIDS_GROUPS.map(([title, cols]) => `    <div class="crs-catalog-menu__group">
      <p class="crs-catalog-menu__group-title">${title}</p>
      <div class="crs-catalog-menu__group-columns">
${cols.map((col) => `        <div class="crs-catalog-menu__column">
${col.map((t) => `          ${course(t)}`).join("\n")}
        </div>`).join("\n")}
      </div>
    </div>`).join("\n")}
  </div>`
    : CATALOG_COLUMNS.map((col) => `  <div class="crs-catalog-menu__column">
${col.map((t) => `    ${course(t)}`).join("\n")}
  </div>`).join("\n");
  return `<div class="crs-catalog-menu crs-catalog-menu--with-search">
  <div class="crs-catalog-menu__search">
    <button type="button" class="crs-catalog-menu__back" aria-label="Назад">${SPRITE("arrow-large", 90)}</button>
    <label class="crs-catalog-menu__search-field"><input class="crs-catalog-menu__search-input" type="search" placeholder="Искать на Хабр Курсах" aria-label="Поиск">${SPRITE("search")}</label>
  </div>
  <div class="crs-catalog-menu__side">
    <div class="crs-button-group">
      <button type="button" class="crs-button-group__item${kids ? "" : " crs-button-group__item--selected"}" aria-pressed="${!kids}">Для взрослых</button>
      <button type="button" class="crs-button-group__item${kids ? " crs-button-group__item--selected" : ""}" aria-pressed="${kids}">Для детей</button>
    </div>
    <nav class="crs-catalog-menu__list" aria-label="Направления">
${dirs.map(([icon, label], i) => `      <a href="#c-catalog-menu" class="crs-catalog-menu__row${i === current ? " crs-catalog-menu__row--current" : ""}"${i === current ? ' aria-current="true"' : ""}><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/${icon}.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">${label}</span><span class="crs-catalog-menu__row-chevron">${SPRITE("arrow-small", -90)}</span></a>`).join("\n")}
    </nav>
  </div>
  <div class="crs-catalog-menu__divider" aria-hidden="true"></div>
${right}
</div>`;
};
const CATALOG_MARKUP = `<div style="display:flex;flex-direction:column;gap:24px;width:100%">
${CATALOG(false)}
${CATALOG(true)}
</div>`;

// Записи, заведённые 11 сентября 2026 решением владельца (страница
// профессии, форма обратной связи, оверлеи быстрых фильтров, загрузка).
// Кнопки и нейтральный тег — продуктовые Button и Chip дословно: у них
// макетный двойник совпал с продуктом, второй носитель тех же значений
// не заводится.
const BTN = "inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none w-full h-10 px-4 py-2 text-small border";
const BTN_MAIN = `${BTN} border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white`;
const BTN_SECONDARY = `${BTN} border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300`;
const CHIP = (t) => `<div class="flex items-center rounded-full bg-ui-black-50 px-2 py-1 text-micro">${t}</div>`;
const CHEVRON = (cls, deg = 0) => `<svg class="svg-icon ${cls}" width="24" height="24" style="width:24px;height:24px;${deg ? `transform:rotate(${deg}deg);` : ""}"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg>`;
const DEMAND = [["Финтех", 1], ["E-commerce", 0.88], ["AI/ML", 0.65], ["EdTech", 0.47], ["Госсектор", 0.42], ["GameDev", 0.38], ["Сфера 1", 0.38], ["Сфера 2", 0.38]];
const SORT_OPTIONS = ["По популярности", "Сначала дорогие", "Сначала дешевые", "По дате начала", "Сначала короткие", "Сначала длинные"];

const NEW_ITEMS = {
  "specialization-tag": {
    node: "14089:190182",
    nodeName: "tag-specialization",
    cssFile: "ui/components/data-display.css",
    root: "crs-specialization-tag",
    markup: `<div style="display:flex;gap:4px;flex-wrap:wrap">
  <span class="crs-specialization-tag crs-specialization-tag--hard">Конкуренция</span>
  <span class="crs-specialization-tag crs-specialization-tag--medium">Умеренный вход</span>
  <span class="crs-specialization-tag crs-specialization-tag--easy">Высокий спрос</span>
</div>`,
    geometry: [
      ["высота", "24, падинг 4 / 8 (4 тега + 4 текстового блока), пилюля"],
      ["текст", "12 / 16, 400"],
      ["--hard", "фон <code>#fce9e9</code>, текст <code>#e84444</code> — «Конкуренция»"],
      ["--medium", "фон <code>#fff2e2</code>, текст <code>#ff7e47</code> — «Умеренный вход»"],
      ["--easy", "фон <code>#eff5ff</code>, текст <code>#346ef4</code> — «Высокий спрос», в вакансии — грейд «Middle»"],
    ],
    copyNote: "Три подписи — три варианта компонента макета по свойствам «спрос / вход» × «сложно / средне / чил». Модификатор назван по второму свойству. Нейтрального варианта у записи нет: серый тег макета (<code>tag/text</code>) — продуктовый <code>Chip</code>. Обёртка ряда — оформление витрины.",
    assetNote: "Ассетов нет. Цвета — из слоя макета; у красного и жёлтого текста есть продуктовые двойники (<code>--color-ui-red-500</code>, <code>--color-ui-orange-500</code>), у подложек <code>red/50</code> и <code>yellow/50</code> — нет.",
  },
  "button-group": {
    node: "14644:221762",
    nodeName: "Tab Button Group — инстанс button group / onpage",
    cssFile: "ui/components/navigation.css",
    root: "crs-button-group",
    markup: `<div style="width:270px;max-width:100%">
  <div class="crs-button-group">
    <button type="button" class="crs-button-group__item crs-button-group__item--selected" aria-pressed="true">Для взрослых</button>
    <button type="button" class="crs-button-group__item" aria-pressed="false">Для детей</button>
  </div>
</div>`,
    geometry: [
      ["группа", "не ниже 48, фон <code>#f1f1f1</code>, падинг 4, радиус 16"],
      ["сегмент", "падинг 8 / 16, радиус 12, текст 14 / 20 <code>#2c2e34</code>, по центру; сегменты делят ширину поровну"],
      ["выбранный", "белый, тень <code>Dropdown</code>: 0 4 6 −1 и 0 2 4 −2, обе <code>#0000000d</code>"],
    ],
    copyNote: "Подписи — из инстанса в каталоге: «Для взрослых» (выбран) и «Для детей». Тот же компонент стоит в форме обратной связи с подписями «Телеграм» и «Телефон». Обёртка шириной 270 — ширина левой колонки каталога, оформление витрины.",
    assetNote: "Ассетов нет. Тень собрана из четырёх переменных <code>effect/drop shadow 1|2/*</code> слоя — композитный эффект <code>Dropdown</code> одной переменной не разворачивается.",
  },
  "faq-item": {
    node: "14394:193667",
    nodeName: "Вопрос",
    cssFile: "ui/components/data-display.css",
    root: "crs-faq-item",
    markup: `<div class="crs-faq-item crs-faq-item--expanded" style="max-width:645px">
  <button type="button" class="crs-faq-item__question" aria-expanded="true">
    <span class="crs-faq-item__title">Сложно ли стать Python-разработчиком?</span>
    <span class="crs-faq-item__chevron">${CHEVRON("")}</span>
  </button>
  <div class="crs-faq-item__answer">
    <p>Обучение проходит дистанционно через специальную платформу. После регистрации и оплаты курса студент получает доступ к личному кабинету с учебными материалами: видеолекциями, презентациями, практическими заданиями, тестами и дополнительными материалами.</p>
    <p>Программа курса обычно разделена на модули или темы. Сначала студент изучает теорию, затем делает практические задания, которые помогают закрепить знания. В некоторых программах есть домашние задания, проекты или кейсы из практики.</p>
    <p>Многие платформы предоставляют поддержку куратора или преподавателя: можно задавать вопросы и получать обратную связь по заданиям. Это помогает лучше понять материал и быстрее освоить новые навыки.</p>
  </div>
</div>`,
    geometry: [
      ["карточка", "белая, рамка <code>#e9e9ea</code>, радиус 24, падинг 24, промежуток 12"],
      ["вопрос", "стилем <code>Header/H4</code> — 18 / 22, 600, −0.5; до шеврона 16"],
      ["шеврон", "24, <code>#a6a7a9</code>; раскрытый — повёрнут на 180°"],
      ["ответ", "14 / 20, между абзацами 8 — <code>font/paragraph-spacing/s</code>"],
    ],
    copyNote: "Вопрос и три абзаца ответа — дословно из узла макета. Ответ в макете не про вопрос («Сложно ли стать…», а текст — про устройство обучения): это наполнитель, так и перенесён. Ширина 645 — колонка контента страницы профессии.",
    assetNote: "Шеврон — символ <code>arrow-small</code> общего спрайта, а не экспорт: <code>icon/arrow-down</code> макета — тот же глиф (контур <code>M6.229 9.237…</code> совпадает с символом до третьего знака).",
    statesNote: "Нарисовано и свёрстано раскрытое состояние (<code>expanded</code>) — в макете шеврон повёрнут вверх и ответ виден. Свёрнутое (<code>collapsed</code>) — без блока ответа и с шевроном вниз; модификатор <code>--expanded</code> переключает только шеврон, прятать ответ — дело разметки. <code>hover</code> и <code>focus-visible</code> требуются у кнопки вопроса по конвенции раскрывающегося блока, но в макете не нарисованы и здесь не свёрстаны.",
  },
  "learning-step": {
    node: "14475:194581",
    nodeName: "шаги",
    cssFile: "ui/components/data-display.css",
    root: "crs-learning-step",
    markup: `<div class="crs-learning-step" style="max-width:645px">
  <span class="crs-learning-step__number">0</span>
  <div class="crs-learning-step__body">
    <div class="crs-learning-step__header">
      <p class="crs-learning-step__title">Основы программирования</p>
      ${CHIP("1–2 месяца")}
    </div>
    <p class="crs-learning-step__text">Фундамент, без которого невозможно двигаться дальше</p>
    <button type="button" class="crs-learning-step__toggle" aria-expanded="false" aria-label="Подробнее">${CHEVRON("")}</button>
  </div>
</div>`,
    geometry: [
      ["карточка", "белая, рамка <code>#e9e9ea</code>, радиус 24, падинг 24, промежуток 12"],
      ["номер", "круг 32, <code>#6bacfd</code>, цифра 16 / 22 600 белая"],
      ["заголовок", "16 / 22, 600; справа тег срока — продуктовый <code>Chip</code>; правый падинг 32 под шеврон"],
      ["описание", "14 / 20"],
      ["шеврон", "24, <code>#a6a7a9</code>, абсолютом справа сверху, отступ 5"],
    ],
    copyNote: "Номер «0», заголовок «Основы программирования», срок «1–2 месяца» и описание — дословно из узла. Нумерация с нуля — так в макете. Ширина 645 — колонка контента страницы профессии.",
    assetNote: "Шеврон — символ <code>arrow-small</code> общего спрайта: в узле он повёрнут дважды на 180°, то есть смотрит вниз — свёрнутый шаг.",
    statesNote: "Нарисовано свёрнутое состояние (<code>collapsed</code>): шеврон вниз, раскрываемого содержимого в узле нет. Раскрытое (<code>expanded</code>) в макете не найдено — что появляется под шагом, неизвестно. <code>hover</code> и <code>focus-visible</code> требуются у кнопки-шеврона по конвенции, но в макете не нарисованы и здесь не свёрстаны.",
  },
  "demand-chart": {
    node: "14469:196385",
    nodeName: "slot-modal/simple «Спрос по областям»",
    cssFile: "ui/components/data-display.css",
    root: "crs-demand-chart",
    markup: `<div class="crs-demand-chart" style="max-width:315px">
  <p class="crs-demand-chart__title">Спрос по областям</p>
  <div class="crs-demand-chart__rows">
${DEMAND.map(([l, v]) => `    <span class="crs-demand-chart__label">${l}</span>
    <div class="crs-demand-chart__track"><div class="crs-demand-chart__bar" style="--crs-value:${v}"></div></div>`).join("\n")}
  </div>
</div>`,
    geometry: [
      ["блок", "рамка <code>#e9e9ea</code>, радиус 24, падинг 24, промежуток 12"],
      ["заголовок", "16 / 22, 600"],
      ["сетка", "подписи по содержимому, полосы на остаток; промежутки 12 по горизонтали, 8 по вертикали"],
      ["полоса", "дорожка <code>#f1f1f1</code> пилюлей, заливка 12 <code>#6bacfd</code> радиусом 6"],
    ],
    copyNote: "Подписи — дословно из узла, включая наполнитель «Сфера 1» и «Сфера 2». Длины полос в макете заданы правым падингом дорожки в пикселях (0, 20, 60, 90, 98, 105, 105, 105 при ширине 170); здесь переведены в доли той же ширины и округлены до сотых. Ширина 315 — узел макета.",
    assetNote: "Ассетов нет.",
  },
  tooltip: {
    node: "11025:93606",
    nodeName: "Tooltip",
    cssFile: "ui/components/overlays.css",
    root: "crs-tooltip",
    markup: `<div style="padding-left:12px">
  <div class="crs-tooltip" role="tooltip">
    <p>Партнер Хабра.<br>Такой значок получают школы и вузы, которые предлагают особенные условия обучения, скидки или промокоды — а наши эксперты проверили, что все честно!</p>
  </div>
</div>`,
    geometry: [
      ["плашка", "<code>#2c2e34</code>, радиус 12, падинг 8 / 12, до 300 в ширину"],
      ["текст", "14 / 20, белый"],
      ["уголок", "треугольник 7 × 16 слева по центру высоты, того же цвета"],
    ],
    copyNote: "Текст — дословно из узла. Он же объясняет значок партнёра, который в продукте есть: <code>img alt=\"Партнер Хабра\"</code> с классом <code>v-popper--has-tooltip</code> на логотипах школ рейтинга. Отступ слева у обёртки — место под уголок, оформление витрины.",
    assetNote: "Уголок нарисован <code>clip-path</code>, а не экспортом: в макете это вектор-треугольник без глифа, экспорт дал бы тот же многоугольник файлом. Курсор-указатель рядом с уголком — иллюстрация макета, не часть компонента.",
    statesNote: "Нарисована открытая подсказка (<code>open</code>). Закрытая (<code>closed</code>) — её отсутствие: в продукте плашка гидрируется по наведению на триггер и в снятой разметке не встречается.",
  },
  loader: {
    node: "12162:84499",
    nodeName: "loader",
    cssFile: "ui/components/feedback.css",
    root: "crs-loader",
    markup: `<div class="crs-loader" role="status" aria-label="Загрузка">
  <svg class="svg-icon crs-loader__icon" width="48" height="48"><use xlink:href="../ui/assets/icons/sprite.svg#loader"></use></svg>
</div>`,
    geometry: [
      ["блок", "высота 112, падинг 32 по бокам, содержимое по центру"],
      ["спиннер", "48 × 48, <code>#346ef4</code> — <code>color style/primary/primary</code>"],
    ],
    copyNote: "Текста у компонента нет. В макете блок стоит в кадре «Нулевая выдача» над пустой выдачей шириной 976 — во всю колонку контента.",
    assetNote: "Спиннер — символ <code>loader</code> общего спрайта, а не экспорт: глиф тот же, координаты экспорта ровно вдвое больше (поле 48 против 24). Вращения нет: кадр макета статичный, а связка символа <code>loader</code> с продуктовой утилитой <code>.animate-spin</code> в снятой разметке не встречается ни разу — символ не использован ни на одной из десяти страниц.",
  },
  "feedback-form": {
    node: "I10123:48314;13496:153645",
    nodeName: "обратная связь",
    cssFile: "ui/components/forms.css",
    root: "crs-feedback-form",
    markup: `<div class="crs-feedback-form">
  <div class="crs-feedback-form__intro">
    <p class="crs-feedback-form__title">Не нашли, что хотели?</p>
    <p class="crs-feedback-form__text">Укажите свои контакты — мы с вами свяжемся, ответим на все вопросы и поможем подобрать обучение, чтобы вы были уверены в своем решении.</p>
  </div>
  <div class="crs-feedback-form__form">
    <div class="crs-button-group">
      <button type="button" class="crs-button-group__item crs-button-group__item--selected" aria-pressed="true">Телеграм</button>
      <button type="button" class="crs-button-group__item" aria-pressed="false">Телефон</button>
    </div>
    <div class="crs-feedback-form__fields">
      <label class="crs-feedback-form__field"><img src="../ui/assets/icons/contact-telegram.svg" alt=""><input class="crs-feedback-form__input" type="text" placeholder="Username" aria-label="Username в Телеграме"></label>
      <label class="crs-feedback-form__field"><img src="../ui/assets/icons/contact-mail.svg" alt=""><input class="crs-feedback-form__input" type="email" placeholder="Почта" aria-label="Почта"></label>
    </div>
    <div class="crs-feedback-form__submit">
      <button type="button" class="${BTN_MAIN}">Отправить</button>
      <p class="crs-feedback-form__consent">Нажимая на кнопку, вы соглашаетесь с <a href="#c-feedback-form">Условиями использования</a> и <a href="#c-feedback-form">Политикой конфиденциальности</a></p>
    </div>
  </div>
</div>`,
    geometry: [
      ["блок", "рамка <code>#e9e9ea</code>, радиус 24, падинг 24; сетка в три колонки, промежуток 16"],
      ["текст слева", "заголовок стилем <code>Header/H2</code> — 24 / 28, 600, −0.5; ниже 14 / 20, промежуток 24"],
      ["форма справа", "две колонки: <code>ButtonGroup</code>, два поля 40 через 12, кнопка M main во всю ширину; промежутки 24"],
      ["поле", "рамка <code>#e9e9ea</code>, радиус 12, падинг 8 / 12, иконка 24, плейсхолдер 16 / 22 <code>#909194</code>"],
      ["согласие", "12 / 16 <code>#909194</code>, ссылки <code>#346ef4</code>"],
    ],
    copyNote: "Все тексты — дословно из инстанса на детской витрине. Сегмент «Телеграм» выбран, поэтому поля — Username и Почта; что показывается при «Телефоне», в узле не нарисовано. Ссылки согласия ведут на якорь витрины — адресов документов в макете нет.",
    assetNote: "Иконки полей — экспорты макета <code>ui/assets/icons/contact-telegram.svg</code> и <code>contact-mail.svg</code>: в спрайте продукта их нет. Цвет <code>#A6A7A9</code> зашит в экспорт.",
  },
  "sort-sheet": {
    node: "9356:50311",
    nodeName: "dropdown/context-menu «Сортировка»",
    cssFile: "ui/components/overlays.css",
    root: "crs-sort-sheet",
    markup: `<div class="crs-sort-sheet">
  <div class="crs-sort-sheet__panel" role="listbox" aria-label="Сортировка">
    <span class="crs-sort-sheet__handle" aria-hidden="true"></span>
${SORT_OPTIONS.map((o) => `    <button type="button" class="crs-sort-sheet__option" role="option">${o}</button>`).join("\n")}
  </div>
</div>`,
    geometry: [
      ["затемнение", "<code>#0000004d</code> — <code>color style/effect/overlay</code>"],
      ["панель", "белая, скругление 24 сверху, падинг 12 сверху и снизу, до 320 в ширину"],
      ["полоска", "64 × 4, белая, радиус 4, на 12 выше панели"],
      ["вариант", "падинг 10 / 24 (8 строки + 2 текстового блока), текст 14 / 20, высота 40"],
    ],
    copyNote: "Шесть вариантов сортировки — дословно из узла, включая «Сначала дешевые» без «ё». Выбранного варианта в макете не отмечено. Высота затемнения над панелью здесь 40: в продукте это высота экрана.",
    assetNote: "Ассетов нет. Полоска-захват — плашка, а не иконка.",
    statesNote: "Нарисована открытая шторка (<code>open</code>) вместе с затемнением. Закрытая (<code>closed</code>) — это кнопка сортировки в ряду быстрых фильтров, иконочный <code>Tab</code> с символом <code>sort</code>; отдельной вёрстки у записи для неё нет.",
  },
  "price-sheet": {
    node: "9356:52508",
    nodeName: "modal «Цена»",
    cssFile: "ui/components/overlays.css",
    root: "crs-price-sheet",
    markup: `<div class="crs-price-sheet">
  <div class="crs-price-sheet__panel" role="dialog" aria-label="Цена">
    <span class="crs-price-sheet__handle" aria-hidden="true"></span>
    <p class="crs-price-sheet__title">Цена</p>
    <div class="crs-price-sheet__body">
      <label class="crs-price-sheet__field crs-price-sheet__field--grow"><input class="crs-price-sheet__input" type="text" inputmode="numeric" placeholder="От" aria-label="Цена от"></label>
      <label class="crs-price-sheet__field crs-price-sheet__field--grow"><input class="crs-price-sheet__input" type="text" inputmode="numeric" placeholder="До" aria-label="Цена до"></label>
      <div class="crs-price-sheet__field crs-price-sheet__field--currency"><span class="crs-price-sheet__currency">₽</span><span class="crs-price-sheet__chevron">${CHEVRON("")}</span></div>
    </div>
    <div class="crs-price-sheet__footer">
      <button type="button" class="${BTN_SECONDARY}">Сбросить</button>
      <button type="button" class="${BTN_MAIN}">Готово</button>
    </div>
  </div>
</div>`,
    geometry: [
      ["затемнение", "<code>#0000004d</code>; полоска 64 × 4, белая, радиус 2 — литерал"],
      ["панель", "скругление 24 сверху — <code>elements/modal/border_radius</code>"],
      ["заголовок", "стилем <code>Header/H3</code> — 20 / 24, 600, −0.5; падинг 24 / 24 / 16"],
      ["поля", "«От», «До» поровну и валюта 66; промежуток 8; высота 40, плейсхолдер 16 / 22"],
      ["подвал", "падинг 16 / 24, промежуток 8, две кнопки M поровну: secondary и main"],
    ],
    copyNote: "Тексты — дословно из узла: «Цена», «От», «До», «₽», «Сбросить», «Готово». Валюта — выбор (<code>select_level3</code> со стрелкой), здесь показан закрытым.",
    assetNote: "Стрелка валюты — символ <code>arrow-small</code> общего спрайта (глиф <code>icon/arrow-down</code> макета). Кнопки — продуктовый <code>Button</code> M: main и secondary, классы дословно из снятой разметки.",
    statesNote: "Нарисована открытая шторка (<code>open</code>). Закрытая (<code>closed</code>) — чип «Цена» в ряду быстрых фильтров; отдельной вёрстки у записи для него нет.",
  },
  "profession-card": {
    node: "14089:190237",
    nodeName: "Карточка специальности",
    cssFile: "ui/components/entities.css",
    root: "crs-profession-card",
    markup: `<div class="crs-profession-card">
  <img class="crs-profession-card__cover" src="../ui/assets/images/content-placeholder.svg" alt="">
  <div class="crs-profession-card__body">
    <div class="crs-profession-card__head">
      <p class="crs-profession-card__title">3D-художник</p>
      <div class="crs-profession-card__tags">
        <span class="crs-specialization-tag crs-specialization-tag--hard">Конкуренция</span>
        <span class="crs-specialization-tag crs-specialization-tag--medium">Умеренный вход</span>
      </div>
    </div>
    <div class="crs-profession-card__salary">
      <p class="crs-profession-card__salary-label">Может заработать в месяц</p>
      <p class="crs-profession-card__salary-value">40 000 – 107 598 ₽</p>
    </div>
  </div>
</div>`,
    geometry: [
      ["карточка", "235 × 342, рамка <code>#e9e9ea</code>, радиус 24"],
      ["обложка", "148, тело наезжает на неё на 20"],
      ["тело", "белое, скругление 24 сверху, падинг 24, промежуток 16"],
      ["название", "16 / 22, 600; теги <code>SpecializationTag</code> через 4"],
      ["зарплата", "подпись 14 / 20 <code>#909194</code>, вилка стилем <code>Header/H4</code> — 18 / 22, 600, −0.5"],
    ],
    copyNote: "Название, теги и вилка — дословно из узла. На странице «список профессий» таких карточек 96 инстансов, у каждой своя иллюстрация.",
    assetNote: "Иллюстрация профессии — содержимое: на её месте заглушка витрины <code>ui/assets/images/content-placeholder.svg</code>, чужой файл в пакет не копируется.",
  },
  "vacancy-card": {
    node: "14394:193314",
    nodeName: "вакансия",
    cssFile: "ui/components/entities.css",
    root: "crs-vacancy-card",
    markup: `<div class="crs-vacancy-card">
  <div class="crs-vacancy-card__main">
    <div class="crs-vacancy-card__school">
      <img class="crs-vacancy-card__logo" src="../ui/assets/images/content-placeholder.svg" alt="">
      <span class="crs-vacancy-card__school-name">Реактив</span>
    </div>
    <p class="crs-vacancy-card__position">Аналитик</p>
    <div class="crs-vacancy-card__tags">
      <span class="crs-specialization-tag crs-specialization-tag--easy">Middle</span>
      ${CHIP("Можно удалённо")}
    </div>
  </div>
  <div class="crs-vacancy-card__salary">
    <p class="crs-vacancy-card__salary-value crs-vacancy-card__salary-value--empty">Зарплата не указана</p>
  </div>
  <button type="button" class="${BTN_MAIN}">Далее</button>
</div>`,
    geometry: [
      ["карточка", "207 × 354, белая, рамка <code>#e9e9ea</code>, радиус 24, падинг 24, промежуток 16"],
      ["школа", "логотип 32 радиусом 8, название 14 / 20 600 в одну строку"],
      ["должность", "16 / 22"],
      ["теги", "<code>SpecializationTag --easy</code> и продуктовый <code>Chip</code> через 4"],
      ["зарплата", "стилем <code>Header/H4</code>; «не указана» — <code>#909194</code>"],
    ],
    copyNote: "Школа «Реактив», должность «Аналитик», теги и «Зарплата не указана» — дословно из узла. Кнопка «Далее» — продуктовый <code>Button</code> M main во всю ширину.",
    assetNote: "Логотип школы — содержимое: на его месте заглушка витрины <code>ui/assets/images/content-placeholder.svg</code>. Продуктовая заглушка логотипа организации (<code>avatars/logo.svg</code> на CDN продукта) в пакет не локализована, а <code>ui/assets/images/logo.svg</code> — логотип самих Курсов, не заглушка.",
  },
};

// Второй заход 11 сентября: модалка промокода, FAQ-блок, оглавление,
// мобильное меню. Button L main в снятой разметке не встречается (есть
// L secondary и XL main) — собран из матрицы Button: размер L, тон main.
const BTN_BASE = "inline-flex cursor-pointer select-none items-center justify-center rounded-xl font-semibold hover:no-underline focus:outline-none focus-visible:outline focus-visible:outline-ui-black-400 disabled:pointer-events-none";
const BTN_L_MAIN = `${BTN_BASE} w-full h-12 min-h-12 px-4 py-2 text-default border border-ui-black-850 bg-ui-black-850 text-ui-white hover:opacity-90 disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white`;
const BTN_M_SECONDARY = `${BTN_BASE} h-10 px-4 py-2 text-small border border-ui-black-50 bg-ui-black-50 text-ui-black-850 hover:bg-ui-black-100 disabled:text-ui-black-300`;
const SYMBOL = (id, size = 24, cls = "") => `<svg class="svg-icon${cls ? " " + cls : ""}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;"><use xlink:href="../ui/assets/icons/sprite.svg#${id}"></use></svg>`;
// ProjectIcon — дословно продуктовая разметка записи project-icon: общий
// глиф, различается только цвет подложки.
const PROJECT_GLYPH = '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h-1.5v1.5H12V6H9V4.5H7.5V3H6v1.5h1.5v3H6V6H4.5v1.5H6V9H4.5v1.5H6v3H4.5V15H6v-1.5h1.5v3H9v3H7.5V21H9v-1.5h1.5v-3H12V18h3v1.5h1.5V18H15v-3h1.5v1.5H18V15h1.5v-1.5H21V12h-1.5v1.5H18V12h-1.5v-1.5h3V9H18V7.5h-1.5V6H18V4.5h1.5V3H18v1.5h-3V3Zm0 1.5V6h-1.5V4.5H15Z" fill="#fff"></path></svg>';
const PROJECT = (color) => `<span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:${color};">${PROJECT_GLYPH}</span>`;
const PROMO_MODAL = (kind) => `<div class="crs-promo-code-modal" role="dialog" aria-label="Skillbox">
    <p class="crs-promo-code-modal__title">Skillbox</p>
    <div class="crs-promo-code-modal__body">
      <div class="crs-promo-code-modal__offer">
        <p class="crs-promo-code-modal__offer-title">Скидка 35% на курсы по дизайну</p>
        <p class="crs-promo-code-modal__offer-text">Введите промокод на сайте школы или назовите менеджеру при покупке</p>
      </div>
      <div class="crs-promo-code-modal__meta">${SYMBOL("datepicker")}<span>Действует до 30 октября 2025</span></div>
      <div class="crs-promo-code-modal__code">${kind === "promo" ? `
        <p class="crs-promo-code-modal__code-value">PROMOCODE</p>` : ""}
        <button type="button" class="${BTN_L_MAIN}">${kind === "promo" ? "Скопировать и перейти" : "Перейти на сайт"}</button>
      </div>
    </div>
    <div class="crs-promo-code-modal__footer">
      <button type="button" class="${BTN_M_SECONDARY}">Закрыть</button>
    </div>
  </div>`;
const MENU_GROUP = (title, items, { chevron = true, more = null, icons = null } = {}) => `  <div class="crs-mobile-menu__group">
    <div class="crs-mobile-menu__group-head">
      <p class="crs-mobile-menu__group-title">${title}</p>${chevron ? `
      <button type="button" class="crs-mobile-menu__icon-button" aria-expanded="true" aria-label="Свернуть">${SYMBOL("arrow-small", 24).replace('style="', 'style="transform:rotate(180deg);')}</button>` : ""}
    </div>
${items.map((t, i) => `    <a href="#c-mobile-menu" class="crs-mobile-menu__item">${icons ? PROJECT(icons[i]) : ""}${t}</a>`).join("\n")}${more ? `
    <a href="#c-mobile-menu" class="crs-mobile-menu__item crs-mobile-menu__item--more">${more}</a>` : ""}
  </div>`;

const NEW_ITEMS_2 = {
  "page-toc": {
    node: "12958:143535",
    nodeName: "меню-оглавление",
    cssFile: "ui/components/navigation.css",
    root: "crs-page-toc",
    markup: `<nav class="crs-page-toc" aria-label="На странице">
  <p class="crs-page-toc__title">На странице</p>
  <div class="crs-page-toc__list">
    <a href="#c-page-toc" class="crs-page-toc__link">Как выбрать и купить обучение?</a>
    <a href="#c-page-toc" class="crs-page-toc__link">Когда лучше покупать онлайн-курс?</a>
    <a href="#c-page-toc" class="crs-page-toc__link">Часто задаваемые вопросы</a>
    <a href="#c-page-toc" class="crs-page-toc__link">Как мы отбираем лучшие курсы<br>и онлайн-школы</a>
    <a href="#c-page-toc" class="crs-page-toc__link">Ответственная информация</a>
  </div>
</nav>`,
    geometry: [
      ["заголовок", "«На странице» стилем <code>Header/H4</code> — 18 / 22, 600, −0.5"],
      ["ссылки", "14 / 20, <code>#346ef4</code> — <code>color style/font/link</code>, через 12"],
      ["до списка", "24; ширина колонки в макете — 299 из 976"],
    ],
    copyNote: "Пять пунктов — дословно из узла, включая ручной перенос «лучшие курсы / и онлайн-школы». Пункты ведут на разделы SEO-статьи «СЕО-блок / оглавление» (<code>12958:143599</code>), у которой три кадра — 976, 712 и 320.",
    assetNote: "Ассетов нет.",
  },
  "faq-block": {
    node: "12193:79324",
    nodeName: "СЕО-блок / FAQ, Мобилка=no",
    cssFile: "ui/components/data-display.css",
    root: "crs-faq-block",
    markup: `<section class="crs-faq-block">
  <p class="crs-faq-block__title">Часто задаваемые вопросы</p>
  <div class="crs-faq-block__list">
${[1, 2, 3].map(() => `    <div class="crs-faq-item">
      <button type="button" class="crs-faq-item__question" aria-expanded="false">
        <span class="crs-faq-item__title">Текст вопроса</span>
        <span class="crs-faq-item__chevron">${SYMBOL("arrow-small")}</span>
      </button>
    </div>`).join("\n")}
  </div>
</section>`,
    geometry: [
      ["блок", "до 1124 в ширину, падинг 24 по бокам, промежуток 16"],
      ["заголовок", "стилем <code>Header/H2</code> — 24 / 28, 600, −0.5"],
      ["список", "<code>FaqItem</code> в свёрнутом виде через 12"],
    ],
    copyNote: "«Часто задаваемые вопросы» и «Текст вопроса» — дословно из компонента: в библиотечном варианте вопросы — заглушки. Вопросов в макете десять, здесь три. Живые вопросы с ответом — у записи <code>FaqItem</code> на странице профессии.",
    assetNote: "Шевроны — символ <code>arrow-small</code> спрайта, как у <code>FaqItem</code>. У варианта Мобилка=yes (<code>12195:100236</code>, 320) раскладка та же, отличаются ширина и падинги — отдельно не свёрстан.",
  },
  "promo-code-modal": {
    node: "11061:82849",
    nodeName: "modal — «Модалка промокода» 1024",
    cssFile: "ui/components/overlays.css",
    root: "crs-promo-code-modal",
    markup: `<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;background:var(--fig-color-style-effect-overlay);padding:24px">
  ${PROMO_MODAL("promo")}
  ${PROMO_MODAL("sale")}
</div>`,
    geometry: [
      ["модалка", "320, белая, радиус 24, не выше 800"],
      ["шапка", "название школы стилем <code>Header/H3</code> — 20 / 24; падинг 24 со всех сторон"],
      ["тело", "падинг 0 / 24, промежуток 16: условие (16 / 22 600 и 14 / 20 через 4), строка срока с календарём 24 <code>#a6a7a9</code>"],
      ["плашка кода", "<code>#eff5ff</code>, радиус 12; код 20 / 24 600 <code>#346ef4</code> по центру, падинг 16; под ним кнопка L во всю ширину"],
      ["подвал", "падинг 24, кнопка M secondary «Закрыть»"],
    ],
    copyNote: "Тексты — дословно из узла: «Skillbox», «Скидка 35% на курсы по дизайну», условие, «Действует до 30 октября 2025», «PROMOCODE». Две модалки — два вида плашки кода (компонент <code>10991:111878</code>): «промокод» и «акция»; во второй кнопка «Перейти на сайт» и кода нет. Обёртка ряда с затемнением <code>color style/effect/overlay</code> — оформление витрины: в макете модалка лежит на таком же слое, без него белые края модалки не видны.",
    assetNote: "Календарь — символ <code>datepicker</code> спрайта: <code>icon/calendar</code> макета — тот же глиф (контур <code>M19 11H5v8…</code>). Кнопки — продуктовый <code>Button</code>: M secondary снят как есть, а L main в снятой разметке не встречается (есть L secondary и XL main) — собран из матрицы Button, размер L и тон main. У макета L падинг 12 / 20, у продуктового L — 8 / 16 при той же высоте 48.",
    statesNote: "Нарисована открытая модалка (<code>open</code>). Закрытая (<code>closed</code>) — это кнопка «Открыть код» на <code>PromoCard</code>, в продукте она есть (16 на странице промокодов).",
  },
  "mobile-menu": {
    node: "9084:14961",
    nodeName: "Меню — кадр 320 «Первый экран»",
    cssFile: "ui/components/overlays.css",
    root: "crs-mobile-menu",
    markup: `<div class="crs-mobile-menu">
  <div class="crs-mobile-menu__header">
    <p class="crs-mobile-menu__title">Меню</p>
    <button type="button" class="crs-mobile-menu__icon-button" aria-label="Закрыть меню">${SYMBOL("menu-close")}</button>
  </div>
${MENU_GROUP("Все курсы", ["Популярные курсы", "Программирование и IT", "Аналитика и Data Science", "Дизайн и контент", "Маркетинг и продажи", "Финансы и бухгалтерия"], { more: "Посмотреть все" })}
${MENU_GROUP("Школы и Вузы", ["Все школы и вузы", "Рейтинг школ и вузов", "Отзывы о курсах и программах", "Промокоды и акции 2026"])}
${MENU_GROUP("Все сервисы Хабра", ["Хабр", "Q&amp;A", "Карьера", "Курсы"], { chevron: false, icons: ["#629FBC", "#434B60", "#6274BC", "#346EF4"] })}
</div>`,
    geometry: [
      ["шапка", "«Меню» стилем <code>Header/H3</code>, крестик 24 <code>#a6a7a9</code>; падинг 20 / 24, линия <code>#e9e9ea</code> снизу"],
      ["группа", "падинг 8 сверху и снизу, разделитель <code>#e9e9ea</code>; заголовок 16 / 22 600, строка 40"],
      ["пункт", "14 / 20, падинг 10 / 24; при наведении <code>#f1f1f1</code> — живое"],
      ["«Посмотреть все»", "<code>#346ef4</code> — <code>color style/primary/primary</code>"],
      ["сервисы", "продуктовый <code>ProjectIcon</code> 24 и подпись через 12"],
    ],
    copyNote: "Все пункты — дословно из кадра. В группе «Все сервисы Хабра» — те же четыре проекта и в том же порядке, что у продуктового <code>ProjectIcon</code> (Хабр, Q&amp;A, Карьера, Курсы), цвета подложек совпали с продуктом.",
    assetNote: "Крестик — символ <code>menu-close</code> спрайта (глиф <code>icon/menu open=yes</code> макета, контур совпал точка в точку), шевроны — <code>arrow-small</code>, иконки сервисов — продуктовая разметка <code>ProjectIcon</code>. Своих ассетов у записи нет.",
    statesNote: "Нарисовано открытое меню (<code>open</code>) с обеими раскрываемыми группами развёрнутыми. Закрытое (<code>closed</code>) — кнопка меню в мобильной шапке; в продукте её нет — мобильная шапка устроена иначе.",
  },
};
for (const [id, it] of Object.entries(NEW_ITEMS_2)) NEW_ITEMS[id] = it;

const ITEMS = {
  breadcrumbs: {
    node: "9902:39188",
    nodeName: "Хлебные крошки",
    cssFile: "ui/components/navigation.css",
    root: "crs-breadcrumbs",
    markup: `<nav class="crs-breadcrumbs" aria-label="Хлебные крошки">
  <span class="crs-breadcrumbs__item">Text 1</span>
  <span class="crs-breadcrumbs__sep" aria-hidden="true">${ARROW}</span>
  <span class="crs-breadcrumbs__item">Text 2</span>
  <span class="crs-breadcrumbs__sep" aria-hidden="true">${ARROW}</span>
  <span class="crs-breadcrumbs__item">Text 3</span>
  <span class="crs-breadcrumbs__sep" aria-hidden="true">${ARROW}</span>
  <span class="crs-breadcrumbs__item">Text 4</span>
</nav>`,
    geometry: [
      ["промежуток", "2px — <code>--fig-size-spacing-x0_5</code>"],
      ["текст", "14 / 20, <code>#909194</code> — <code>--fig-color-style-font-secondary</code>"],
      ["разделитель", "коробка 20×20, символ <code>arrow-small</code> общего спрайта, поворот −90°"],
      ["перенос", "<code>flex-wrap</code> — в макете ряд переносится"],
    ],
    copyNote: "Подписи <code>Text 1</code>…<code>Text 4</code> — собственные значения узла макета (свойства <code>text1</code>…<code>text4</code>), а не придуманные примеры. Настоящих подписей у компонента нет: их даёт страница, а страниц с крошками в продукте не снято.",
    assetNote: "Разделитель взят из общего спрайта продукта, а не из экспорта макета. В макете на его месте <code>icon/arrow-down</code> 20×20; глиф тот же шеврон — контуры сверены: у обоих это два отрезка, сходящиеся в точке, различается только <code>viewBox</code> (20 против 24). Своя копия иконки не заводится: у продукта символ уже есть, и вторая копия разошлась бы с первой при следующей правке спрайта.",
  },
  tab: {
    node: "I15089:302657;15065:242802;4843:2736;15089:302655",
    nodeName: "tab — фильтр-выпадашка «Школа»",
    cssFile: "ui/components/navigation.css",
    root: "crs-tab",
    markup: `<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
  <button type="button" class="crs-tab crs-tab--icon" aria-label="Сортировка"><svg class="svg-icon crs-tab__icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#sort"></use></svg></button>
  <button type="button" class="crs-tab"><span class="crs-tab__label">Школа</span><svg class="svg-icon crs-tab__icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
  <button type="button" class="crs-tab crs-tab--selected"><span class="crs-tab__label">Школа</span><svg class="svg-icon crs-tab__icon" width="20" height="20" style="width:20px;height:20px;"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></button>
</div>`,
    geometry: [
      ["высота", "36 — как у инстанса макета и у продуктового <code>FilterChip</code>"],
      ["падинг", "12 слева, 8 справа (под шеврон) — <code>--fig-elements-tab-filter-padding-left-right</code>, <code>--fig-size-spacing-x2</code>"],
      ["невыбранный", "белый, рамка <code>#e9e9ea</code>, текст <code>#2c2e34</code>; при наведении рамка <code>#dededf</code>"],
      ["выбранный", "заливка <code>#eff5ff</code>, рамка <code>#94bdfc</code>, текст и шеврон <code>#346ef4</code>"],
      ["промежуток в ряду", "4 — <code>elements/chips/filter/gap</code>"],
    ],
    copyNote: "Подпись «Школа» — собственный текст инстанса макета. Три образца: иконочный невыбранный (узел …15089:302651), текстовый невыбранный и текстовый выбранный (узел …15089:302655). Текстовый невыбранный собран из переменных невыбранного состояния того же компонента — <code>elements/tab/fill</code>, <code>border</code>, <code>text</code>, — отдельного инстанса с этим сочетанием на прочитанных узлах не встретилось. Обёртка ряда — оформление витрины, а не часть компонента.",
    assetNote: "Шеврон и значок сортировки — символы <code>arrow-small</code> и <code>sort</code> общего спрайта продукта, а не экспорт макета. Контуры сверены: у макета это <code>icon/arrow-down</code> и значок с двумя стрелками, те же глифы. Цвет берут через <code>currentColor</code>, поэтому у выбранного варианта шеврон синий вместе с текстом, как в макете.",
  },
  "filter-modal": {
    node: "14613:211399",
    nodeName: "modal-filter",
    readDate: "11 сентября 2026",
    cssFile: "ui/components/overlays.css",
    root: "crs-filter-modal",
    markup: `<div class="crs-filter-modal" role="dialog" aria-label="Поиск обучения">
  <div class="crs-filter-modal__header">
    <p class="crs-filter-modal__title">Поиск обучения</p>
    <button type="button" class="crs-filter-modal__close" aria-label="Закрыть"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#menu-close"></use></svg></button>
  </div>
  <div class="crs-filter-modal__body">
    <div class="crs-filter-modal__group">
      <p class="crs-filter-modal__group-title">Тип обучения</p>
      <div class="crs-filter-modal__options">
        <button type="button" class="crs-tab crs-tab--plain"><span class="crs-tab__label">Курс</span></button>
        <button type="button" class="crs-tab crs-tab--plain crs-tab--selected"><span class="crs-tab__label">Вебинар</span></button>
        <button type="button" class="crs-tab crs-tab--plain"><span class="crs-tab__label">Симулятор</span></button>
      </div>
    </div>
  </div>
  <div class="crs-filter-modal__footer">
    <button type="button" class="crs-filter-modal__button crs-filter-modal__button--secondary">Очистить всё</button>
    <button type="button" class="crs-filter-modal__button crs-filter-modal__button--main">Показать 30 560 курсов</button>
  </div>
</div>`,
    geometry: [
      ["модалка", "до 568 в ширину, белая, рамка <code>#e9e9ea</code>, радиус 24 — <code>elements/modal/*</code>"],
      ["шапка", "падинг 24, заголовок стилем <code>Header/H3</code> (20 / 24, 600, −0.5), крестик 24 × 24"],
      ["тело", "группы с отступом 24 от краёв, промежуток между группами 32 — по координатам выгрузки"],
      ["группа", "заголовок 16 / 22, 600; под ним чипы <code>Tab</code> в синем варианте, промежуток 4"],
      ["подвал", "падинг 24, кнопки L высотой 48: вторичная <code>#f1f1f1</code>, основная <code>#2c2e34</code>"],
    ],
    copyNote: "Тексты — содержимое узла макета: заголовок «Поиск обучения», группа «Тип обучения» с вариантами «Курс», «Вебинар» (выбран), «Симулятор», кнопки «Очистить всё» и «Показать 30 560 курсов». Число курсов в кнопке — пример из макета, в продукте его подставляет выдача. Свёрстана одна группа из десяти: остальные собраны из записей, которые уже стоят на витрине, — плиток <code>BaseFilterWithImage</code> и тех же чипов <code>Tab</code>.",
    assetNote: "Крестик — символ <code>menu-close</code> общего спрайта, цвет <code>#A6A7A9</code> — <code>--fig-color-style-neutral-neutral-heavy</code>. Первая редакция брала экспорт узла макета: с символом <code>cross-large</code> он не совпадал (плечи короче на 1 px с каждой стороны), а с <code>menu-close</code> сверен не был. На мобильном меню выяснилось, что экспорт — это <code>menu-close</code> точка в точку; копия удалена. Затемнение фона под модалкой (слой <code>overlay</code> макета) не воспроизводится: на витрине модалка стоит на странице, а не поверх неё.",
    statesNote: "Свёрстано одно состояние — открытое (<code>open</code>): узел макета и есть раскрытая модалка. <code>default</code> и <code>closed</code> — это кнопка-триггер, которую Storybook снял у обеих реализаций; отдельной вёрстки у записи для них нет.",
  },
  "catalog-menu": {
    node: "14644:221760",
    nodeName: "Карточки — панель каталога для взрослых",
    cssFile: "ui/components/overlays.css",
    root: "crs-catalog-menu",
    markup: CATALOG_MARKUP,
    geometry: [
      ["панель", "сетка: колонка 270, разделитель 1, три колонки курсов поровну; промежуток 24, падинг 24 / 40 / 24 / 24"],
      ["переключатель", "запись <code>ButtonGroup</code> (<code>button group / onpage</code>) — её спецификация"],
      ["строка направления", "иконка 24, промежуток 12, падинг 8 / 8 / 8 / 16, радиус 8, высота 40; текущая и при наведении — <code>#f1f1f1</code> — <code>elements/dropdown/row/*</code>"],
      ["разделитель", "1px <code>#e9e9ea</code> — <code>--fig-color-style-neutral-neutral-hover</code>"],
      ["колонка курсов", "промежуток 12, сверху 12, текст 14 / 20 <code>#2c2e34</code>; при наведении подчёркнут — живое"],
    ],
    copyNote: "Подписи — дословно из узлов макета. Взрослый каталог: пятнадцать направлений и начало трёх колонок курсов, по двенадцать строк из 27, 30 и 30; колонки два и три в макете — наполнитель («Haskell», «Microsoft Access», «Middle Frontend-разработка» повторяются, третья почти целиком повторяет вторую со сдвигом на строку). Детский каталог (<code>14657:224732</code>): тринадцать направлений, текущее — «Подготовка к олимпиадам», справа группы «По предметам» и «По возрасту»; «Матемитика» и «Английския язык» — опечатки макета, перенесены как есть. Полоса поиска и шевроны строк — из кадра 320 (<code>14657:224294</code>), видны на ширинах до 744; кадр 744 оставляет одну колонку курсов. Шапка <code>header / courses</code> над панелью — своя запись, здесь не повторяется. Обёртка из двух каталогов — оформление витрины.",
    assetNote: "Иконки направлений — экспорты узлов макета в <code>ui/assets/icons/catalog/</code>: пятнадцать взрослых и девять детских, ещё четыре детские строки берут взрослые иконки (<code>growth</code>, <code>hobby</code>, <code>code</code>, <code>languages</code> — те же компоненты макета, контуры совпали). В спрайте продукта (22 символа) иконок направлений нет. Цвет <code>#A6A7A9</code> зашит в экспорт. Кнопка «назад», лупа и шевроны строк — символы спрайта <code>arrow-large</code>, <code>search</code> и <code>arrow-small</code>, глифы сверены. Разделитель — полоса фона 1px, а не картинка, как вектор в макете.",
    readDate: "11 сентября 2026",
    statesNote: "Свёрстано одно состояние — открытое (<code>open</code>): узел макета и есть раскрытый каталог. <code>default</code> и <code>closed</code> — свёрнутый каталог, то есть кнопка в шапке; отдельной вёрстки у записи для них нет. Текущее направление («Программирование и IT») нарисовано в макете серым — на витрине оно помечено модификатором <code>--current</code>, наведение остальных строк живое.",
  },
  "empty-state": {
    node: "12135:122618",
    nodeName: "Empty block",
    cssFile: "ui/components/feedback.css",
    root: "crs-empty-state",
    markup: `<div class="crs-empty-state">
  <div class="crs-empty-state__text">
    <p class="crs-empty-state__title">Нет точных совпадений</p>
    <p class="crs-empty-state__hint">Попробуйте изменить или убрать некоторые фильтры</p>
  </div>
  <div class="crs-empty-state__actions">
    <button type="button" class="crs-empty-state__chip">Убрать ценовой диапазон</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Вебинар»</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Санкт-Петербург»</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Х4»</button>
    <button type="button" class="crs-empty-state__chip">Убрать «Х5»</button>
  </div>
</div>`,
    geometry: [
      ["колонка", "gap 16 — <code>--fig-size-spacing-x4</code>"],
      ["заголовок", "24 / 28, вес 600, трекинг −0.5"],
      ["подпись", "14 / 20, вес 400"],
      ["кнопка", "падинг 8 / 16, радиус 12, фон <code>#f1f1f1</code>, при наведении <code>#e9e9ea</code>"],
    ],
    copyNote: "Тексты — собственное содержимое узла макета, приведено дословно. Кнопки в макете подписаны конкретными фильтрами («Вебинар», «Санкт-Петербург»): это не пример из головы, а то, что нарисовано.",
    assetNote: "Ассетов у компонента нет — только текст и кнопки.",
  },
};

for (const [id, it] of Object.entries(NEW_ITEMS)) ITEMS[id] = { readDate: "11 сентября 2026", ...it };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const CATEGORY_TITLE = {
  navigation: "Навигация", feedback: "Обратная связь", overlays: "Оверлеи",
  forms: "Формы", "data-display": "Отображение данных",
};

let html = fs.readFileSync(showcasePath, "utf8");
let specs = 0, sections = 0;

for (const [id, it] of Object.entries(ITEMS)) {
  const c = byId.get(id);
  if (!c) { console.warn(`нет записи: ${id}`); continue; }
  const specRel = `${c.category}/${id}.md`;

  const md = `# ${c.canonicalName}

| | |
|---|---|
| **Категория** | ${CATEGORY_TITLE[c.category] || c.category} (\`${c.category}\`) |
| **Корневой класс** | \`${it.root}\` — введён пакетом |
| **CSS** | \`${it.cssFile}\` |
| **Живая реализация** | [\`showcase/components.html#c-${id}\`](../../showcase/components.html#c-${id}) |
| **Источник** | Figma \`02_Education-NEW\`, узел \`${it.node}\` «${it.nodeName}» |
| **Статус** | \`figma-only\` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в \`notes\` записи реестра:

${c.notes ? "> " + c.notes.replace(/\n/g, "\n> ") : "> _Заметки инвентаризации по этой записи нет._"}

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг ${c.step} решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
\`ui/courses.css\` и выглядит так же, как на витрине (инвариант METHOD §6.1).

\`\`\`html
${it.markup}
\`\`\`

## Внешний вид

| что | значение |
|---|---|
${it.geometry.map(([k, v]) => `| ${k} | ${v.replace(/<\/?code>/g, "\`")} |`).join("\n")}

Все значения — переменные слоя \`ui/tokens-figma.css\`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на \`--color-ui-*\` из \`ui/tokens.css\`.

## Ограничения

- **Корень введён пакетом.** \`${it.root}\` — не класс продукта. METHOD §6.5
  допускает корень вида \`crs-<id>\` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс \`crs-\` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** ${it.copyNote.replace(/<\/?code>/g, "\`")}
- **Ассеты.** ${it.assetNote.replace(/<\/?code>/g, "\`")}
- **Состояния.** ${it.statesNote ? it.statesNote.replace(/<\/?code>/g, "\`") : `Требуемые состояния записи (${(c.requiredStates || []).map((x) => "\`" + x + "\`").join(", ")}) в макете отдельными вариантами не нарисованы, а измерить их негде.`} Разбор — [\`components/STATE-CAPTURE.md\`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: \`sourceScope: figma-only\` не доходит до \`complete\`/\`partial\`. Пока компонент не найден в продукте, запись остаётся \`figma-only\`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** \`02_Education-NEW\` (\`oNyNRRob2y0ZSgPHOdH65X\`), узел \`${it.node}\`
«${it.nodeName}», прочитан \`get_design_context\` ${it.readDate || "10 сентября 2026"}.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом \`.pipeline/R2-bulk/gen-figma-only.mjs\` по узлу макета._
`;
  fs.mkdirSync(path.join(pkg, "components", c.category), { recursive: true });
  fs.writeFileSync(path.join(pkg, "components", specRel), md, "utf8");
  specs++;

  if (!html.includes(`id="c-${id}"`)) {
    const section = `
    <section class="doc-section" id="c-${id}">
      <div class="doc-section__head">
        <h4>${esc(c.canonicalName)}</h4>
        <p>${esc(c.notes || "Заметки инвентаризации по этой записи нет.")}</p>
      </div>

      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>default</h5>
          <code>.${esc(it.root)}</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--figma" title="figma-only" aria-label="figma-only">F</span>
          </span>
          <span class="doc-tag">figma-only</span>
        </div>
        <p class="doc-note"><strong>Эта разметка написана по макету, а не снята с продукта.</strong>
          Единственный такой случай на витрине: компонента в продакшене нет вовсе.
          Узел — <code>02_Education-NEW</code> <code>${esc(it.node)}</code>
          «${esc(it.nodeName)}». Корень <code>${esc(it.root)}</code> введён пакетом:
          настоящего имени взять неоткуда.</p>
        <div class="doc-stage">
          <div class="doc-variant">
            <span class="doc-variant__label">по узлу макета <code>${esc(it.node)}</code></span>
            <div class="doc-variant__row">
${it.markup.split("\n").map((l) => "              " + l).join("\n")}
            </div>
          </div>
        </div>
        <dl class="doc-spec">
${it.geometry.map(([k, v]) => `          <div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("\n")}
          <div><dt>вхождений в проде</dt><dd>нет — компонента в продукте не существует</dd></div>
        </dl>
        <p class="doc-note"><strong>Тексты.</strong> ${it.copyNote}</p>
        <p class="doc-note"><strong>Ассеты.</strong> ${it.assetNote} Полный разбор — <a href="../components/${specRel}">спецификация</a>.</p>${it.statesNote ? `
        <p class="doc-note"><strong>Состояния.</strong> ${it.statesNote}</p>` : ""}
      </div>
    </section>
`;
    const catOpen = `<section class="doc-category" id="doc-cat-${c.category}">`;
    const idx = html.indexOf(catOpen);
    if (idx < 0) { console.warn(`категория ${c.category} не найдена`); continue; }
    const end = html.indexOf("\n  </section>", idx);
    const block = html.slice(idx, end);
    const emptyRe = /\n\s*<p class="doc-empty">[^<]*<\/p>/;
    html = html.slice(0, idx) + (emptyRe.test(block) ? block.replace(emptyRe, "\n" + section) : block + section) + html.slice(end);
    sections++;
  }

  c.status = "figma-only";
  c.specPath = specRel;
  c.showcaseAnchor = `c-${id}`;
  c.cssRoots = [it.root];
}

fs.writeFileSync(showcasePath, html, "utf8");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`figma-only: спецификаций ${specs}, секций витрины ${sections}`);
