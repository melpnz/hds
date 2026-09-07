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

## Источники

- [`data/section.md`](../data/section.md) и production page composition.
- [`COMPONENT-ROADMAP.md`](../../COMPONENT-ROADMAP.md) §9.

