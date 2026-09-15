# PersonHeader

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `flex` · `gap-5` · `rounded-3xl` · `border` · `border-solid` · `border-ui-black-100` · `p-6` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#person-header`](../../../viewer/index.html#person-header) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **1 узле**, страниц — **1 из 10**: author.

шапка профиля человека: аватар 100 круглый с бейджем компании 40 rounded-[14px], имя text-h1-mobile semibold, роль #909194, ряд соцссылок. На phone рамка и padding снимаются

**Правило.** Шапка профиля человека: аватар 100 с бейджем компании, имя, роль, соцссылки. В продукте 1 узел — на странице автора.

## Когда не использовать

- Для школы — `EntityHeader`.

## Как работает

`div` с рамкой; на `phone:` рамка и падинг снимаются, раскладка становится колонкой (`phone:flex-col`).

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. По Tab проходят: 2 ссылки. По корпусу (2 узла): `Link` — 2.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="flex gap-5 rounded-3xl border border-solid border-ui-black-100 p-6 phone:flex-col phone:border-none phone:p-0"><div class="relative h-[100px] w-[100px]"><img src="https://habrastorage.org/getpro/courses/8fc/9b4/f93/8fc9b4f930dd9f9a7681acbdc1c2e919.png" alt="" style="--avatar-size:100px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain"><div class="absolute -bottom-0.5 -right-0.5 flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-[14px] border-2 border-solid border-ui-white bg-ui-white"><img src="https://habrastorage.org/getpro/courses/08f/b62/a7a/08fb62a7ae9d3e65355081936d3b27e4.jpeg" alt="" style="--avatar-size:36px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover"></div></div><div class="flex flex-col gap-1"><div class="text-h1-mobile font-semibold">Степан Воеводин</div><div class="text-ui-black-500">Руководитель отдела дизайна</div><div class="flex gap-2 mt-2"><!--[--><a href="https://www.linkedin.com/in/stepan-voevodin-a923b959/" target="_blank" rel="noopener noreferrer" class="z-10 h-6 w-6 overflow-hidden rounded-full"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/external-profile.svg#linkedin.com"></use></svg></a><a href="https://career.habr.com/melpnz" target="_blank" rel="noopener noreferrer" class="z-10 h-6 w-6 overflow-hidden rounded-full"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/external-profile.svg#career.habr.com"></use></svg></a><!--]--></div></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `author`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **14**
- классов в поддереве: **41**
- селектор переписи: `div.flex.gap-5.rounded-3xl.border.border-solid.border-ui-black-100.p-6`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/author/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[0] > div[0]`), коробка **1076×150**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `150px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `padding` | `24px` |
| `gap` | `20px` |
| `position` | `static` |
| `overflow` | `visible` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:flex-col`, `phone:border-none`, `phone:p-0`. Условия префиксов: `phone:` — до 767 (`docs/guide/layout.md`).

## Ограничения

- **Заглушки содержимого.** 2 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [author](https://career.habr.com/courses/authors/23-stepan-voevodin)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** `13246:159568` (02_Education-NEW, узел 13246:159568)

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
