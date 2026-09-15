# NumberedCourseItem

| | |
|---|---|
| **Категория** | Сущности (`entities`) |
| **Корневой класс** | `pt-6` · `border-b` · `border-solid` · `border-b-ui-black-100` · `pb-6` |
| **CSS** | утилиты `ui/utilities-components.css` |
| **Живая реализация** | [`viewer/index.html#numbered-course-item`](../../../viewer/index.html#numbered-course-item) |
| **Snapshot** | 1 из 1 состояний снято |

## Когда использовать

Компонент стоит в продукте на **9 узлах**, страниц — **1 из 10**: courses-listing.

элемент SEO-списка «ТОП онлайн-курсов»: h3 > a.text-h4 semibold с номером внутри текста, Prose !text-small, сетка характеристик grid-cols-3 gap-x-3 gap-y-0.5, разделитель border-bottom

**Правило.** Используйте для пункта нумерованного SEO-списка «ТОП онлайн-курсов»: заголовок-ссылка с номером, описание в `Prose`, сетка характеристик. В продукте 9 узлов — только на `/courses`.

## Когда не использовать

- Для курса в выдаче — `CourseCard`.

## Как работает

`div` с `h3 > a` (`text-h4`), `Prose !text-small` и сеткой `grid-cols-3`; пункты разделены линией снизу.

## Управление клавиатурой

Корень (`<div>`) в фокус не попадает. На один экземпляр по Tab проходят: 2 ссылки — так у всех 9. По корпусу (18 узлов): `Link` — 18.

## Анимация

Переходов и анимаций нет ни в классах разметки, ни в CSS корпуса (вычислено по страницам, отрисованным с их CSS на 1440).

## Разметка

Фрагмент вставляется на пустую страницу с одним `ui/courses.css` и выглядит
так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="pt-6 border-b border-solid border-b-ui-black-100 pb-6"><h3 class="m-0"><a class="text-h4 font-semibold" href="https://fas.st/InUkT?erid=2bL9aMPo2e49hMef4pfysZW5NS" rel="noopener noreferrer nofollow" target="_blank">1. 1C-программист: расширенный курс</a></h3><div class="style-ugc pt-1.5 !text-small">Обучение 1C-программистов с нуля на онлайн-курсах с дипломом. Дистанционный курс для начинающих поможет освоить востребованную профессию.</div><div class="grid grid-cols-3 gap-x-3 gap-y-0.5 pt-3 text-small phone:grid-cols-1 tablet-only:grid-cols-2"><div><span class="font-semibold">Школа: </span><a target="_blank" class="text-ui-black-850" href="/courses/education_centers/10-netologiya">Нетология</a></div><div><span class="font-semibold">Дата начала:</span> По мере набора группы</div><div><span class="font-semibold">Длительность:</span> 18 месяцев</div><div><span class="font-semibold">Стоимость курса: </span>129&nbsp;200 ₽</div><div><span class="font-semibold">Цена без скидки: </span>253&nbsp;400 ₽</div><div><span class="font-semibold">Рассрочка: </span>Да</div><div><span class="font-semibold">Формат занятий: </span>Онлайн</div><div><span class="font-semibold">Помощь с трудоустройством: </span>Да</div><div><span class="font-semibold">Сертификат об окончании: </span>Да</div></div></div>
```

## Анатомия

Дерево из снятого `dom.html` страницы `courses-listing`, фреймворк-скоуп
(`data-v-*`) снят, продовые пути к спрайтам и картинкам сохранены как есть —
это протокол снятого DOM.

- узлов внутри корня: **23**
- классов в поддереве: **20**
- селектор переписи: `div.pt-6.border-b.border-solid.border-b-ui-black-100.pb-6`

Вычисленные значения корня — из снимка живого продакшена
(`evidence/source/production/pages/courses-listing/computed.json`, ширина 1440,
узел `body > div[0] > div[0] > div[0] > div[1] > div[3] > div[0] > section[7] > div[1] > div[0]`), коробка **1076×175.33**:

| свойство | значение |
|---|---|
| `display` | `block` |
| `flex-direction` | `row` |
| `width` | `1076px` |
| `height` | `175.328px` |
| `background-color` | `rgba(0, 0, 0, 0)` |
| `color` | `rgb(44, 46, 52)` |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `20.8px` |
| `padding` | `24px 0px` |
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

Классы с префиксом ширины в поддереве записи: `phone:grid-cols-1`, `tablet-only:grid-cols-2`. Условия префиксов: `phone:` — до 767, `tablet-only:` — 768–1023 (`docs/guide/layout.md`).

## Ограничения

- **Проза выведена из переписи корпуса.** Правило применения, «Когда не использовать», «Как работает», клавиатура, анимация и адаптив написаны 11 сентября 2026 по переписи десяти снятых страниц, отрисованных с CSS корпуса на 1440 (`.pipeline/R2-bulk/corpus-facts.json`, генератор `gen-prose.mjs`), и `notes` реестра; пересмотрены по ревью выборки из 12 записей. Разделов «Название и текст», «Валидация», «Слоты · Props» нет: подтвердить их в снятом продукте нечем.

## Источники

**Production.** [courses-listing](https://career.habr.com/courses)

Снятые файлы — `evidence/source/production/pages/<страница>/dom.html` и
`computed.json`; правила класса — корпус `evidence/source/production/css`
(2 файла: `author.css`, `courses-listing.css`).

**Figma.** Узел для этой записи не сопоставлен.

**Storybook.** Story для этой записи в снимке `_sources/courses/` нет.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-specs.mjs` из снятых доказательств.
Числа — из `components/selector-census.json` (измерение браузером), правила —
из корпуса прод-CSS парсером `postcss`. Ни одно значение здесь не написано
от руки._
