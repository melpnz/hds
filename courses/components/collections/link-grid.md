# LinkGrid

| | |
|---|---|
| **Категория** | Коллекции (`collections`) |
| **Корневой класс** | `grid` · `grid-cols-3` · `gap-x-4` · `gap-y-2` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`showcase/components.html#c-link-grid`](../../showcase/components.html#c-link-grid) |
| **Snapshot** | 2 из 3 состояний снято |

## Когда использовать

Компонент стоит в продукте на **5 узлах**, страниц — **3 из 10**: courses-listing, education-centers-listing, promocodes.

три колонки ссылок со счётчиком, свёрнутые до max-h 94 с раскрытием по кнопке. Это и есть «Популярные направления» — плиток с иллюстрациями в проде нет

**Правило.** Используйте для длинного списка ссылок-направлений со счётчиками, свёрнутого до трёх строк с раскрытием («Популярные направления», «Ещё онлайн-школы»). В продукте 5 узлов на 3 страницах.

## Когда не использовать

- Для иллюстрированных плиток — в продукте их нет, «Популярные направления» текстовые.
- Для коротких списков, которым свёртка не нужна.

## Как работает

`div` в три колонки (`tablet-only:` две, `phone:` одна) с `max-h-[94px]` и `overflow-hidden` — по умолчанию свёрнут.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. С клавиатуры доступны вложенные записи: `Link` ×129 — у каждой свой раздел.

## Анимация

Классов перехода и анимации в разметке нет: наведение и другие состояния сменяются мгновенно.

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="mt-4 grid grid-cols-3 gap-x-4 gap-y-2 phone:grid-cols-1 tablet-only:grid-cols-2"><!--[--><div class="flex gap-1.5 text-small"><a href="/courses/programmirovanie" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Программирование и IT</a><div class="text-ui-black-500">1379</div></div><div class="flex gap-1.5 text-small"><a href="/courses/analitika" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Аналитика и Data Science</a><div class="text-ui-black-500">741</div></div><div class="flex gap-1.5 text-small"><a href="/courses/dizajn" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Дизайн и контент</a><div class="text-ui-black-500">673</div></div><div class="flex gap-1.5 text-small"><a href="/courses/menedzhment" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Бизнес и менеджмент</a><div class="text-ui-black-500">1347</div></div><div class="flex gap-1.5 text-small"><a href="/courses/marketing" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Маркетинг и продажи</a><div class="text-ui-black-500">429</div></div><div class="flex gap-1.5 text-small"><a href="/courses/finansy" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Финансы и бухгалтерия</a><div class="text-ui-black-500">677</div></div><div class="flex gap-1.5 text-small"><a href="/courses/hr-upravlenie-personalom" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">HR и рекрутинг</a><div class="text-ui-black-500">327</div></div><div class="flex gap-1.5 text-small"><a href="/courses/creativity-hobby" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Хобби и творчество</a><div class="text-ui-black-500">370</div></div><div class="flex gap-1.5 text-small"><a href="/courses/krasota-zdorovie" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Красота и здоровье</a><div class="text-ui-black-500">577</div></div><div class="flex gap-1.5 text-small"><a href="/courses/kulinariya" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Кулинария</a><div class="text-ui-black-500">88</div></div><div class="flex gap-1.5 text-small"><a href="/courses/psihologiya" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Психология</a><div class="text-ui-black-500">883</div></div><div class="flex gap-1.5 text-small"><a href="/courses/samorazvitie" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Саморазвитие и soft skills</a><div class="text-ui-black-500">636</div></div><div class="flex gap-1.5 text-small"><a href="/courses/microsoft-office" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Прикладные программы</a><div class="text-ui-black-500">269</div></div><div class="flex gap-1.5 text-small"><a href="/courses/pedagogika" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Педагогика</a><div class="text-ui-black-500">773</div></div><div class="flex gap-1.5 text-small"><a href="/courses/inostrannye-yazyki" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Языки</a><div class="text-ui-black-500">141</div></div><div class="flex gap-1.5 text-small"><a href="/courses/povyshenie-kvalifikacii" class="max-w-[calc(100%_-36px)] truncate text-ui-black-850 hover:text-ui-black-850">Повышение квалификации</a><div class="text-ui-black-500">1079</div></div><!--]--></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **48**
- классов в поддереве: **15**
- селектор переписи: `div.overflow-hidden.max-h-\[94px\] > div.grid.grid-cols-3.gap-x-4.gap-y-2`

Корень этой записи в снимке `computed.json` не сопоставлен — вычисленные значения
не приводятся. Сопоставление ведётся по совпадению тега и всех классов селектора
переписи; здесь оно не сошлось, и подставлять вместо него значения браузера
по умолчанию нельзя.

## Состояния

Словарь и требуемость — [`components/STATES.md`](../STATES.md) (R1-01), снятость
каждой пары «запись × состояние» — [`components/STATE-CAPTURE.md`](../STATE-CAPTURE.md) (R1-02).
Таблица ниже — та же разметка, сведённая к этой записи.

| состояние | откуда | что есть в пакете |
|---|---|---|
| `default` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; разметка и правила — в разделах выше |
| `expanded` | дописано нормативом | `ui/state-contract.css` — не снимок продукта, а норматив пакета |
| `collapsed` | снято с продакшена (R1-02) | снятость доказана в `STATE-CAPTURE.md`; отдельного примера в этой спецификации нет — его ставит шаг R4-10 |

## Responsive

Классы с префиксом ширины в поддереве записи: `phone:grid-cols-1`, `tablet-only:grid-cols-2`. Условия префиксов: `small-phone:` — до 479, `phone:` — до 767, `tablet-only:` — 768–1023, `tablet:` — до 1023 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`) и `notes` реестра. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses) · [education-centers-listing](https://career.habr.com/education_centers) · [promocodes](https://career.habr.com/education/promocodes)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(1 файл: `author.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
