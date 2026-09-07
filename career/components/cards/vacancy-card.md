# VacancyCard · Карточка вакансии

| | |
|---|---|
| **Категория** | Entity-модуль |
| **Корневой класс** | `vacancy-card` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#c-vacancy-prod` |
| **Evidence** | public listing + production measurements; legacy Storybook `VacancyCardWithCompanyAndDate` |

Карточка представляет одну вакансию в листинге. Она получает данные и композицию
из готовых primitives; не управляет откликом, авторизацией или загрузкой данных.

## Data contract

| Поле | Обязательность | Представление |
|---|---|---|
| `company`, `title`, `href`, `publishedAt` | обязательно | ссылка компании, заголовок вакансии, дата |
| `logo` | optional | без логотипа подставляется штатная заглушка `illustrations/avatar-default-company.svg`; место не схлопывается |
| `rating`, `accreditation` | optional | скрывать пустой элемент, а не показывать фиктивные данные |
| `salary` | optional | указанная сумма — зелёная; отсутствие — `Зарплата не указана` оранжевым |
| `grade`, `workFormat`, `locations`, `skills` | optional arrays | два независимых ряда: атрибуты вакансии и навыки |
| `saved` | optional presentation state | `aria-pressed` у отдельной кнопки «В избранном» |

`applied`, `hidden`, `promoted`, `loading`, `error`, `success` и авторизация —
business states контейнера или отдельного сценария. Они не являются состояниями
карточки.

## Варианты данных

| Variant | Контракт |
|---|---|
| `salary-known` | Показывает сумму или диапазон зарплаты. |
| `salary-unknown` | Вместо суммы показывает текст «Зарплата не указана». |
| `compact-metadata` | Не имеет rating и skills; на месте логотипа — заглушка. Оставшиеся данные не меняют порядок блоков. |
| `saved` | Кнопка избранного имеет `aria-pressed="true"`; выбор не выполняет сетевой запрос внутри карточки. |

## Семантика и доступность

- Корень — `article`; заголовок вакансии — единственная основная ссылка.
- Компания, рейтинг и tag/skill links остаются отдельными ссылками. Не оборачивайте
  всю карточку ссылкой: внутри есть независимые интерактивные элементы.
- Логотип имеет пустой `alt`, когда рядом выводится название компании; fallback
  изображает компанию без ложного текста. Заглушка — не «фиктивные данные»:
  это то, что продукт показывает сам, когда логотипа нет или он не загрузился
  (`ui/assets/README.md`, «Заглушки аватара»). Скрывать логотип целиком нельзя —
  колонка 48x48 держит выравнивание всей карточки.
- Кнопка избранного имеет имя, которое меняется вместе с `aria-pressed`.
- Кнопка «Откликнуться» — slot/action потребителя. Поведение, loading и результат
  принадлежат `QuickApply`, а не VacancyCard.

## Responsive

На ширине контейнера до 1023 px дата выходит первой строкой, логотип переезжает
вправо и текст обтекает его. Действия остаются отдельной строкой. Обе композиции
проверены в browser suite на 375 и 1440 px.

## Разметка

```html
<article class="vacancy-card" aria-labelledby="vacancy-title">
  <div class="vacancy-card__main">
    <a class="vacancy-card__icon-link" href="/companies/example" aria-label="Компания Example">
      <img class="vacancy-card__logo" src="../../ui/assets/illustrations/avatar-default-company.svg" alt="">
    </a>
    <div class="vacancy-card__info">
      <div class="vacancy-card__company">
        <a class="vacancy-card__company-name" href="/companies/example">Example</a>
        <time class="vacancy-card__date" datetime="2026-09-07">Сегодня</time>
      </div>
      <a class="vacancy-card__title" id="vacancy-title" href="/vacancies/1">Frontend developer</a>
      <p class="vacancy-meta"><span class="vacancy-card__salary">от 250 000 ₽</span></p>
      <div class="vacancy-card__skills" aria-label="Условия"><a class="base-chip" href="#">Senior</a></div>
      <div class="vacancy-card__skills" aria-label="Навыки"><a class="base-chip" href="#">TypeScript</a></div>
    </div>
  </div>
  <footer class="vacancy-card__footer">
    <button type="button">Откликнуться</button>
    <button type="button" aria-pressed="false" aria-label="Добавить в избранное">…</button>
  </footer>
</article>
```

## Legacy Storybook variant

`VacancyCardWithCompanyAndDate` — выделенный вариант с голубой подложкой и
внешней шириной 560 px. Он сохранён как `storybookName` и evidence, но не заменяет
каноническую карточку листинга. Его 12 snapshots подтверждают варианты неполных
данных; новый API не наследует его визуальную обёртку.

## Источники

- `evidence/source/production/list-vacancies.json`.
- `evidence/curated/listing/listing-vacancies-1440.png` и `listing-vacancies-375.png`.
- `Vacancies/VacancyCardWithCompanyAndDate` — 12/12 локальных Storybook snapshots.
- Публичный листинг: <https://career.habr.com/vacancies> (проверен 7 сентября 2026).
