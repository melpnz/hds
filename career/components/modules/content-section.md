# ContentSection · Контентная секция

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `content-section` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-content-section` |

## Назначение

Стабильная композиция Section + SectionHeader + body + optional footer. Она
задаёт внутренний ритм, но не определяет предметную сущность и не вводит новые
controls.

## Анатомия

```text
section.base-section.content-section
  header.section-header
  .content-section__body
  .content-section__footer
```

## Состояния

У модуля нет собственного interaction state. Во время загрузки `aria-busy`
ставится на секцию, а body композирует Skeleton/Loader. Ошибка композирует
Notification/ErrorState; пустой результат заменяется EmptySection.

## API

- `headingLevel`, `title`, `description` передаются в SectionHeader.
- slots: `headerActions`, `default`, `footer`.
- `aria-busy` допустим как состояние загружаемого региона, не visual variant.

## Responsive

Секция не меняет markup. Padding задаётся вариантами базового Section;
SectionHeader самостоятельно перестраивает actions на узкой ширине.

## Доступность

Используйте `<section aria-labelledby>` только с реальным heading. Без заголовка
корень должен быть `<div>`. Обновляемый body может получить `aria-live`, только
если изменение действительно требует объявления.

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-content-section`](../../showcase/components.html#r4-content-section).
Работает на пустой странице с одним `ui/career.css`.

```html
<section class="base-section base-section--background-white rounded-3xl content-section" aria-labelledby="about-role-title"><header class="section-header"><div class="section-header__content"><h3 class="section-header__title" id="about-role-title">О вакансии</h3></div></header><div class="content-section__body editor__content"><p>Команда развивает сервисы для IT-специалистов. В секции используется типографика Content.</p></div><div class="content-section__footer"><button type="button" class="base-button inline-flex appearance-main size-m is-sizeable"><span class="base-button__inner"><span class="base-button__content">Откликнуться</span></span></button></div></section>
```

## Источники

- [`data/section.md`](../data/section.md) и production page composition.
- [`research/component-roadmap.md`](../../research/component-roadmap.md) §9.

