# PersonCard

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `relative` · `box-border` · `flex` · `max-h-[365px]` · `flex-col` · `gap-4` · `overflow-hidden` · `rounded-3xl` · `border` · `border-ui-black-100` · `p-6` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-person-card`](../../showcase/components.html#c-person-card) |
| **Snapshot** | 3 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **30 узлах**, страниц — **2 из 10**: authors, editors.

max-h 365 с обрезкой биографии и градиентной вуалью снизу (linear-gradient к #fff, h 56); аватар 68 круглый с бейджем компании 28 rounded-[8px]; имя text-h4, роль text-small #909194, ряд соцссылок 24×24

**Правило.** Используйте для эксперта или редактора: `Avatar`, имя, роль, биография в `Prose` со свёрткой. В продукте 30 узлов на 2 страницах, в `CardGrid`.

## Когда не использовать

- Для автора отзыва — `ReviewCard`.
- Для шапки профиля — `PersonHeader`.

## Как работает

`div` со сквозной ссылкой `a.z-2.absolute` на профиль; биография обрезана градиентной вуалью.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. С клавиатуры доступны вложенные записи: `Link` ×88 — у каждой свой раздел.

## Анимация

Классов перехода и анимации в разметке нет: наведение и другие состояния сменяются мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="relative box-border flex max-h-[365px] flex-col gap-4 overflow-hidden rounded-3xl border border-ui-black-100 p-6"><div class="flex flex-col gap-3"><div class="relative h-[68px] w-[68px]"><img src="https://habrastorage.org/getpro/courses/ff0/130/d34/ff0130d34b875f0ed9ff94b11f266998.jpeg" alt="" style="--avatar-size:68px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover overflow-hidden rounded-full object-contain"><div class="absolute -bottom-0.5 -right-0.5 flex h-[28px] w-[28px] items-center justify-center overflow-hidden rounded-[8px] border-2 border-solid border-ui-white bg-ui-white"><img src="https://habrastorage.org/getpro/courses/cc9/46f/78c/cc946f78c3e71f32a163d78a13c57ff3.png" alt="" style="--avatar-size:24px;" class="h-[var(--avatar-size)] w-[var(--avatar-size)] object-cover"></div></div><div class="flex flex-col gap-1"><div class="text-h4 font-semibold">Александр Ульяницкий</div><div class="text-small text-ui-black-500">Senior QA Engineer</div><div class="flex gap-2 mt-2"><!--[--><a href="https://www.linkedin.com/in/alexulyanitsky/" target="_blank" rel="noopener noreferrer" class="z-10 h-6 w-6 overflow-hidden rounded-full"><svg class="svg-icon" style="width:24px;height:24px;" width="24" height="24"><use xlink:href="/courses-web/images/sprites/external-profile.svg#linkedin.com"></use></svg></a><!--]--></div></div></div><div class="min-h-0 flex-1 overflow-hidden"><div class="style-ugc break-words !text-small"><p>Ведущий инженер-тестировщик (Senior QA / QA Automation Engineer) с глубокой экспертизой в автоматизации и ручном тестировании сложных корпоративных систем. Специализируется на создании стабильных тестовых фреймворков с нуля, оптимизации процессов обеспечения качества и развитии инженерной культуры в команде. </p>
<p>Обучил и адаптировал для реальных проектов более 20 QA-инженеров. Практикует гибкий подход к обучению — от проведения тестовых собеседований и корректировки резюме до комплексного многомесячного сопровождения по направлениям Manual и Automation QA.</p></div></div><div class="pointer-events-none absolute bottom-6 right-0 h-14 w-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#fff_100%)]"></div><a href="/courses/authors/25-aleksandr-ulyanickiy" class="z-2 absolute bottom-0 left-0 right-0 top-0"></a></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `authors`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **18**
- классов в поддереве: **57**
- селектор переписи: `div.relative.box-border.flex.max-h-\[365px\].flex-col.gap-4.overflow-hidden.rounded-3xl.border.border-ui-black-100.p-6`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/authors/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[1] > div[0] > section[1] > div[2] > div[0]`), коробка **260×365**:

| свойство | значение |
|---|---|
| `display` | `flex` |
| `flex-direction` | `column` |
| `width` | `260px` |
| `height` | `365px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `border` | `1px solid rgb(233, 233, 234)` |
| `border-radius` | `24px` |
| `padding` | `24px` |
| `gap` | `16px` |
| `position` | `relative` |
| `overflow` | `hidden` |
| `text-align` | `start` |

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `hover` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-06 |
| `focus-visible` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R5-06 |

## Responsive

Адаптивных классов в разметке нет: запись одинакова на всех ширинах, раскладку меняет контейнер вокруг неё.

## Ограничения

- **Классы без правила.** В разметке продукта стоят классы, у которых нет объявления ни в одном из 22 файлов корпуса: `z-2`. Это не пробел пакета, а находка о продукте: класс написан, правило отсутствует. В `ui/` они не заводятся.

- **Заглушки содержимого.** 2 ссылок на пользовательское и партнёрское содержимое (`habrastorage.org`, баннеры `assets.habr.com`) на витрине заменены локальной заглушкой `ui/assets/images/content-placeholder.svg`. Чужое содержимое в пакет не копируется; геометрия компонента от этого не меняется — размер задаёт он сам. В «Анатомии» ниже продовые пути сохранены как есть.

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [authors](https://career.habr.com/courses/authors) · [editors](https://career.habr.com/courses/editors)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `courses-listing.css`).

**Figma.** `карточка эксперта` (02_Education-NEW, узел 13221:152104) — карточка эксперта 235×365

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
