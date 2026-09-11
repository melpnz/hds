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
<div class="crs-catalog-menu">
  <div class="crs-catalog-menu__side">
    <div class="crs-catalog-menu__switch">
      <button type="button" class="crs-catalog-menu__switch-item crs-catalog-menu__switch-item--selected" aria-pressed="true">Для взрослых</button>
      <button type="button" class="crs-catalog-menu__switch-item" aria-pressed="false">Для детей</button>
    </div>
    <nav class="crs-catalog-menu__list" aria-label="Направления">
      <a href="#c-catalog-menu" class="crs-catalog-menu__row crs-catalog-menu__row--current" aria-current="true"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/code.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Программирование и IT</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/analytics.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Аналитика и Data Science</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/design.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Дизайн и контент</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/business.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Бизнес и менеджмент</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/marketing.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Маркетинг и продажи</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/finance.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Финансы и бухгалтерия</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/hr.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">HR и рекрутинг</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/hobby.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Хобби и творчество</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/wellness.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Красота и здоровье</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/cooking.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Кулинария</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/psychology.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Психология</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/growth.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Саморазвитие и soft skills</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/software.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Прикладные программы</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/pedagogy.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Педагогика</span></a>
      <a href="#c-catalog-menu" class="crs-catalog-menu__row"><img class="crs-catalog-menu__row-icon" src="../ui/assets/icons/catalog/languages.svg" alt="" width="24" height="24"><span class="crs-catalog-menu__row-label">Языки</span></a>
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
```

## Внешний вид

| что | значение |
|---|---|
| панель | сетка: колонка 270, разделитель 1, три колонки курсов поровну; промежуток 24, падинг 24 / 40 / 24 / 24 |
| переключатель | высота 48, фон `#f1f1f1`, падинг 4, радиус 16; выбранный сегмент белый, радиус 12, тень `Dropdown` — `elements/button group/onpage/*` |
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
- **Тексты.** Подписи — дословно из узла макета: пятнадцать направлений и начало трёх колонок курсов, по двенадцать строк из 27, 30 и 30. Колонки два и три в макете — наполнитель: «Haskell», «Microsoft Access» и «Middle Frontend-разработка» в них повторяются, а третья почти целиком повторяет вторую со сдвигом на строку. Настоящий список курсов по направлению даёт выдача. Свёрстан кадр 1024 для взрослых; в секции макета «меню каталога» (`14639:226536`) рядом лежат кадры 744 и 320 и те же три для детей (`14657:224732` — 1024), их вёрстка — шаг R4-13. Шапка `header / courses` над панелью — своя запись, здесь не повторяется.
- **Ассеты.** Иконки направлений — пятнадцать экспортов узла макета в `ui/assets/icons/catalog/`, а не символы общего спрайта: в спрайте продукта (22 символа) иконок направлений нет вовсе. Цвет `#A6A7A9` зашит в экспорт. Разделитель — не картинка, как вектор в макете, а полоса фона 1px того же цвета.
- **Состояния.** Свёрстано одно состояние — открытое (`open`): узел макета и есть раскрытый каталог. `default` и `closed` — свёрнутый каталог, то есть кнопка в шапке; отдельной вёрстки у записи для них нет. Текущее направление («Программирование и IT») нарисовано в макете серым — на витрине оно помечено модификатором `--current`, наведение остальных строк живое. Разбор — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md).
- **Статус терминальный.** Правило манифеста: `sourceScope: figma-only` не доходит до `complete`/`partial`. Пока компонент не найден в продукте, запись остаётся `figma-only`, сколько бы вёрстки к ней ни прибавилось.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14644:221760`
«Карточки — панель каталога для взрослых», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
