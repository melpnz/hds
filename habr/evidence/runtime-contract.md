# Runtime contract

Что глобально должно быть на странице, чтобы извлечённый CSS Habr отрисовался
верно на пустой HTML-странице без Storybook.

## Обязательный минимум

```html
<link rel="stylesheet" href="ui/themes/light-v2.css">
<link rel="stylesheet" href="ui/normalize.css">    <!-- normalize.css v8, без изменений -->
<link rel="stylesheet" href="ui/foundations.css">  <!-- добавки Habr поверх normalize -->
<!-- дальше — CSS конкретных компонентов, порядок не важен (см. ниже) -->
```

## Habr встраивает normalize.css v8 целиком, без изменений

Это главная поправка к первой версии документа (см. «История поправки»
ниже). `ui/normalize.css` — 36 правил, узнаваемых по сигнатурам:
`sub,sup{…}` + `sub{bottom:-.25em}` + `sup{top:-.5em}`, `abbr[title]{…dotted}`,
`summary{display:list-item}`, `[type=search]{-webkit-appearance:textfield}` —
это ровно normalize.css v8.0.1, известный сторонний файл, встроенный
в шелл-бандл (`index-C5LRQg16.css`) без единой правки.

Поверх него — Habr-специфичные добавления, все в `ui/foundations.css`:

```css
body { overscroll-behavior-y: contain; }
body { box-sizing: border-box;
       font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
       overflow-y: scroll; }
html, body { background-color: var(--background-gray);
             min-width: 320px; min-height: 100vh; }
a { margin: 0; font-family: inherit; font-size: 100%; line-height: 1.15; }
a:hover { color: var(--accent-primary); }
:lang(en) { quotes: "\201C" "\201D"; }
:lang(ru) { quotes: "\00AB" "\00BB"; }
[data-navigatable]:focus { outline: 1px solid var(--accent-primary); }
```

Три находки здесь легко пропустить, если искать только «сброс браузерных
стилей» и не читать весь глобальный слой целиком:

* **`a:hover`** — единственное глобальное правило цвета ссылки при наведении;
  ни один найденный компонент не переопределяет его точечно;
* **`:lang(en)`/`:lang(ru)`** — кавычки-«ёлочки» для русского текста против
  английских двойных кавычек. Продуктовая типографическая деталь, работает
  только там, где разметка использует `<q>` или `content: open-quote`;
* **`[data-navigatable]:focus`** — единственное найденное глобальное
  accessibility-правило: видимый контур фокуса при клавиатурной навигации
  привязан к атрибуту `data-navigatable`, а не к `:focus-visible` глобально.
  Новый интерактивный элемент получит стандартный фокус Habr, только если
  ему явно проставлен этот атрибут.

**Не перенесено намеренно:** `[data-roxot-placement-id]{max-width:100%}` —
селектор рекламной инфраструктуры (Roxot ad network), не продуктовый UI.

## История поправки — важно для методики, не только для факта

Первая версия этого документа утверждала: «нет reset для
`button`/`input`/`textarea`/`select`, единственное общее правило —
`textarea{overflow:auto}`». **Это было неверно.** Причина ошибки —
методическая: grep искал только одиночные простые селекторы
(`button{`, `input{`), и полностью пропустил составные
(`button,input,optgroup,select,textarea{margin:0;font-family:inherit;…}`)
и вообще весь normalize.css, разбросанный по бандлу такими составными
правилами.

Расхождение всплыло только на **copy-test витрины**: `showcase/components.html`
с одним `ui/foundations.css` (без normalize) давало `.btn` шрифт `Arial`
(единственное значение), а живой `habr.com` в `getComputedStyle` —
полный стек `-apple-system, BlinkMacSystemFont, Arial, sans-serif`.
Само по себе поведение не ломало вёрстку визуально (Arial — последний
элемент того же стека, разница не всегда заметна на глаз), но означало,
что документ **неверно описывал контракт** — не то же самое, что «контракт
работает случайно».

Исправлено полным программным проходом по всем топ-уровневым правилам
`index-C5LRQg16.css` с «голым» селектором (только теги/атрибуты, без
классов и `data-v-*`) — это надёжнее, чем grep по конкретным именам тегов,
потому что не зависит от того, какие теги пришло в голову проверить.

**Урок:** в разборе чужого бандла утверждение «reset отсутствует» требует
полного прохода по селекторам, а не проверки нескольких ожидаемых тегов —
составные селекторы прячут normalize не хуже, чем @media прячет брейкпоинт.

## Порядок подключения не имеет значения

В реальной production-странице `button-Ccclp6vQ.css` (цветовые модификаторы)
загружается **раньше** `button-base-BdvEVC2k.css` (базовый `.btn`) — порядок
в HTML определяется код-сплиттингом сборки, а не логической зависимостью.
Это работает, потому что модификаторы и база почти никогда не спорят за одно
и то же свойство с одинаковой специфичностью в противоречащем порядке.
**Вывод: в отличие от Career (где `:where()` и явный порядок каскада были
критичны), здесь порядок `<link>` можно не контролировать** — за одним
исключением: `ui/normalize.css` логично подключать до `ui/foundations.css`,
потому что оба трогают `body`/`a` и человеку легче читать «сначала база,
потом добавки», хотя на вычисленный результат порядок не влияет.

## Чего в контракте по-прежнему нет

**Нет `*{box-sizing:border-box}`.** Единственный найденный глобальный
`*`-селектор во всём 111-файловом срезе — `*{transition:opacity .2s
ease-in-out,…}` (косметика перехода). `box-sizing:border-box` объявлен
**локально**, где реально нужен: `.btn{box-sizing:border-box;…}`,
`[type=checkbox],[type=radio]` (из normalize), `.tm-input-text-decorated__input`.

**Нет Tailwind, нет CSS-слоёв, нет `:where()`.** Специфичность обычная,
cascade — обычный.

## Темы — переключение атрибутом `<link media>`, не классом

```html
<link rel="stylesheet" href="ui/themes/light-v2.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="ui/themes/dark-v2.css"  media="(prefers-color-scheme: dark)">
```

Не `[data-theme]`, не класс на `<html>`. Обе темы объявляют **одинаковые 43
переменных** на голом `:root`; переключение — сменой `media`, которую браузер
разрешает нативно. Если нужно принудительно показать тему вне зависимости от
системной настройки — переопределить `media` на `all` у нужного `<link>`
и убрать/выключить второй.

## Именованный container для адаптивных компонентов

```css
.tm-page__wrapper { container: page / inline-size; }
```

Единственное найденное использование — `@container page not (max-width:1px)`
в `check-content-B5yILTmZ.css` (панель проверки правописания), это фича-детект,
не брейкпоинт. Реальная адаптивность Habr построена на `@media`, не на
`@container`. Обёртка `.tm-page__wrapper` нужна не для брейкпоинтов, а как
задел на будущее — переносится в `ui/layout.css`, но не является обязательным
условием для большинства компонентов.

## Шрифты — два регистра, не один

`body` наследует **системный стек** `-apple-system, BlinkMacSystemFont, Arial,
sans-serif`. `Fira Sans` (Google Fonts, `wght@400;500;700`) применяется
**точечно**, компонентами, которые сами объявляют `font-family:Fira Sans,sans-serif`
— заголовки статей, сниппеты, табы, комментарии, промо-блоки. Кнопки, шапка,
пагинация, `h1`/`h2` без обёртки контента набраны системным стеком.

Подтверждено дважды: перечнем `font-family` по всем файлам CSS **и** прямым
`getComputedStyle` на живой `habr.com/ru/feed/` — `.btn`, `.tm-header`, `h1`,
`.tm-title` (обёртка) дают системный стек; `a.tm-title__link` (заголовок статьи)
даёт `"Fira Sans", sans-serif`. После добавления `ui/normalize.css` локальная
витрина даёт тот же полный стек на `.btn`, что и живой production — copy-test
пройден (см. `showcase/components.html`).

**Правило переноса: не набирать интерфейсную хромку (кнопки, шапка, пагинация,
навигация) Fira Sans.** Это частая ошибка при вёрстке «на глаз» — Fira Sans
читается как основной шрифт продукта, но это шрифт контента, не интерфейса.

`Inter` также подключается через Google Fonts (`@font-face` preconnect в
`<head>` production), но использование в извлечённом CSS не найдено — вероятно,
задел на будущее или используется в редакторе статей вне снятого среза. Не
включать в обязательный контракт без дополнительного подтверждения — GAP.

## Сайдбар — фиксированная ширина через inline CSS-переменную

```html
<div class="tm-page__wrapper" style="--v6b5459bf: 300px;">
```

Ширина сайдбара **не в статическом CSS** — это скомпилированный Vue
`v-bind()`, значение приходит инлайновым `style`. Подтверждено на 7 разных
типах страниц (`feed`, `article`, `article-comments`, `articles-all`,
`authors`, `companies-list`, `company`) — везде одно и то же значение, **300px**.
При переносе в `ui/layout.css` это фиксируется как обычная переменная
`--sidebar-width: 300px`, а не воспроизводится хэшированное имя.

## Доказательство: минимальная страница

```html
<link rel="stylesheet" href="ui/themes/light-v2.css">
<link rel="stylesheet" href="ui/normalize.css">
<link rel="stylesheet" href="ui/foundations.css">
<link rel="stylesheet" href="ui/components/button.css">
<button class="btn btn_solid btn_small" type="button">Кнопка</button>
```

Проверено рендером: `72×32`, фон `rgb(84,142,171)` (= `--accent-primary`),
текст белый, шрифт `-apple-system, BlinkMacSystemFont, Arial, sans-serif`
(полный стек, не одно значение), радиус 3px, `box-sizing: border-box`.
Без темы — граница и фон чёрные (unresolved `var()` не проваливается
в ошибку, а даёт `currentColor`/`initial`, поэтому визуально выглядит
«просто чёрным», а не сломанным — осторожность при отладке).
