# CatalogMenu

| | |
|---|---|
| **Категория** | Оверлеи (`overlays`) |
| **Корневой класс** | `crs-catalog-menu` — введён пакетом |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | [`showcase/components.html#c-catalog-menu`](../../showcase/components.html#c-catalog-menu) |
| **Источник** | Figma `02_Education-NEW`, узел `14644:221760` «Карточки — панель каталога для взрослых» |
| **Статус** | `figma-only` — терминальный |

## Когда использовать

**В продукте этого компонента нет.** Он существует только в макете, и это
не пробел съёмки, а установленный факт — разбор в `notes` записи реестра:

> figma-only: выпадающий каталог направлений из шапки, отдельные версии для взрослых и детей

Правило применения не выводится: выводить его не из чего, пока компонент
не появился в продукте. Шаг R4-13 решает судьбу записи.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div style="display:flex;flex-direction:column;gap:24px;width:100%">
<div class="crs-catalog-menu crs-catalog-menu--with-search">
  <div class="crs-catalog-menu__search">
    <button type="button" class="crs-catalog-menu__back" aria-label="Назад"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-large"></use></svg></button>
    <label class="crs-catalog-menu__search-field"><input class="crs-catalog-menu__search-input" type="search" placeholder="Искать на Хабр Курсах" aria-label="Поиск"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#search"></use></svg></label>
  </div>
  <div class="crs-catalog-menu__side">
    <div class="crs-button-group">
      <button type="button" class="crs-button-group__item crs-button-group__item--selected" aria-pressed="true">Для взрослых</button>
      <button type="button" class="crs-button-group__item" aria-pressed="false">Для детей</button>
    </div>
    <nav class="crs-catalog-menu__list" aria-label="Направления">
      <a href="#c-catalog-menu" class="crs-catalog-menu__row crs-catalog-menu__row--current" aria-current="true"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/code.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Программирование и IT</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/analytics.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Аналитика и Data Science</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/design.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Дизайн и контент</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/business.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Бизнес и менеджмент</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/marketing.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Маркетинг и продажи</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/finance.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Финансы и бухгалтерия</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/hr.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">HR и рекрутинг</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/hobby.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Хобби и творчество</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/wellness.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Красота и здоровье</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/cooking.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Кулинария</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/psychology.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Психология</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/growth.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Саморазвитие и soft skills</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/software.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Прикладные программы</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/pedagogy.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Педагогика</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/languages.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Языки</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
    </nav>
  </div>
  <div class="crs-catalog-menu__divider" aria-hidden="true"></div>
  <div class="crs-catalog-menu__column">
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">1C-Программирование</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">1С Битрикс</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Администрирование Windows</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Алгоритмы и структуры данных</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Архитектор ПО</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Автоматизация тестирования</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Автоматизация тестирования на Python</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Backend-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Bootstrap</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">CentOS</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">CI/CD</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Composer</a>
  </div>
  <div class="crs-catalog-menu__column">
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Groovy</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Haskell</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">IntelliJ IDEA</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">IOS-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Java Middle</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Java-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">JavaScript-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Jenkins</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Jira</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Joomla</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Junior Python-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Junior QA-тестировщик</a>
  </div>
  <div class="crs-catalog-menu__column">
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Haskell</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">IntelliJ IDEA</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">IOS-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Java Middle</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Java-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">JavaScript-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Jenkins</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Jira</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Joomla</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Junior Python-разработка</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Junior QA-тестировщик</a>
    <a href="#c-catalog-menu" class="crs-catalog-menu__course">Kubernetes</a>
  </div>
</div>
<div class="crs-catalog-menu crs-catalog-menu--with-search">
  <div class="crs-catalog-menu__search">
    <button type="button" class="crs-catalog-menu__back" aria-label="Назад"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-large"></use></svg></button>
    <label class="crs-catalog-menu__search-field"><input class="crs-catalog-menu__search-input" type="search" placeholder="Искать на Хабр Курсах" aria-label="Поиск"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;"><use xlink:href="../ui/assets/icons/sprite.svg#search"></use></svg></label>
  </div>
  <div class="crs-catalog-menu__side">
    <div class="crs-button-group">
      <button type="button" class="crs-button-group__item" aria-pressed="false">Для взрослых</button>
      <button type="button" class="crs-button-group__item crs-button-group__item--selected" aria-pressed="true">Для детей</button>
    </div>
    <nav class="crs-catalog-menu__list" aria-label="Направления">
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/ege.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Подготовка к ЕГЭ</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/oge.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Подготовка к ОГЭ</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/dvi.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Подготовка к ДВИ</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/vpr.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Подготовиться к ВПР</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row crs-catalog-menu__row--current" aria-current="true"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/trophy.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Подготовка к олимпиадам</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/backpack.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Подготовка к школе</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/growth.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Улучшить оценки</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/home.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Домашнее обучение</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/hobby.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Найти хобби</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/code.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Научиться программировать</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/languages.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Выучить иностранный язык</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/globe.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Расширить кругозор</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/college.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Поступить в колледж</span><span class="crs-catalog-menu__row-chevron"><svg class="svg-icon" width="24" height="24" style="width:24px;height:24px;transform:rotate(-90deg);"><use xlink:href="../ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></a>
    </nav>
  </div>
  <div class="crs-catalog-menu__divider" aria-hidden="true"></div>
  <div class="crs-catalog-menu__groups">
    <div class="crs-catalog-menu__group">
      <p class="crs-catalog-menu__group-title">По предметам</p>
      <div class="crs-catalog-menu__group-columns">
        <div class="crs-catalog-menu__column">
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Матемитика</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Русский язык</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Обществознание</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Информатика</a>
        </div>
        <div class="crs-catalog-menu__column">
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Биология</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Физика</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">История</a>
        </div>
        <div class="crs-catalog-menu__column">
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Английския язык</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Химия</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">Литература</a>
        </div>
      </div>
    </div>
    <div class="crs-catalog-menu__group">
      <p class="crs-catalog-menu__group-title">По возрасту</p>
      <div class="crs-catalog-menu__group-columns">
        <div class="crs-catalog-menu__column">
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">1 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">2 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">3 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">4 класс</a>
        </div>
        <div class="crs-catalog-menu__column">
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">5 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">6 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">7 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">8 класс</a>
        </div>
        <div class="crs-catalog-menu__column">
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">9 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">10 класс</a>
          <a href="#c-catalog-menu" class="crs-catalog-menu__course">11 класс</a>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| панель | сетка: колонка 270, разделитель 1, три колонки курсов поровну; промежуток 24, падинг 24 / 40 / 24 / 24 |
| переключатель | запись `ButtonGroup` (`button group / onpage`) — её спецификация |
| строка направления | иконка 24, промежуток 12, падинг 8 / 8 / 8 / 16, радиус 8, высота 40; текущая и при наведении — `#f1f1f1` — `elements/dropdown/row/*` |
| разделитель | 1px `#e9e9ea` — `--fig-color-style-neutral-neutral-hover` |
| колонка курсов | промежуток 12, сверху 12, текст 14 / 20 `#2c2e34`; при наведении подчёркнут — живое |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Ограничения

- **Корень введён пакетом.** `crs-catalog-menu` — не класс продукта. METHOD §6.5
  допускает корень вида `crs-<id>` ровно для этого случая: снятой разметки,
  из которой можно взять настоящее имя, не существует. Префикс `crs-` нужен,
  чтобы имя пакета нельзя было принять за класс продукта.
- **Тексты.** Подписи — дословно из узлов макета. Взрослый каталог: пятнадцать направлений и начало трёх колонок курсов, по двенадцать строк из 27, 30 и 30; колонки два и три в макете — наполнитель («Haskell», «Microsoft Access», «Middle Frontend-разработка» повторяются, третья почти целиком повторяет вторую со сдвигом на строку). Детский каталог (`14657:224732`): тринадцать направлений, текущее — «Подготовка к олимпиадам», справа группы «По предметам» и «По возрасту»; «Матемитика» и «Английския язык» — опечатки макета, перенесены как есть. Полоса поиска и шевроны строк — из кадра 320 (`14657:224294`), видны на ширинах до 744; кадр 744 оставляет одну колонку курсов. Шапка `header / courses` над панелью — своя запись, здесь не повторяется. Обёртка из двух каталогов — оформление витрины.
- **Ассеты.** Иконки направлений — экспорты узлов макета в `ui/assets/icons/catalog/`: пятнадцать взрослых и девять детских, ещё четыре детские строки берут взрослые иконки (`growth`, `hobby`, `code`, `languages` — те же компоненты макета, контуры совпали). В спрайте продукта (22 символа) иконок направлений нет. Цвет `#A6A7A9` зашит в экспорт. Кнопка «назад», лупа и шевроны строк — символы спрайта `arrow-large`, `search` и `arrow-small`, глифы сверены. Разделитель — полоса фона 1px, а не картинка, как вектор в макете.
- **Состояния.** Свёрстано одно состояние — открытое (`open`): узел макета и есть раскрытый каталог. `default` и `closed` — свёрнутый каталог, то есть кнопка в шапке; отдельной вёрстки у записи для них нет. Текущее направление («Программирование и IT») нарисовано в макете серым — на витрине оно помечено модификатором `--current`, наведение остальных строк живое. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14644:221760`
«Карточки — панель каталога для взрослых», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
