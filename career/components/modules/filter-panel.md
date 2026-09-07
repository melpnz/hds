# FilterPanel · Панель фильтров

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `filter-panel` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-filters` |
| **Источник** | Production `/vacancies`, forms primitives |

## Назначение

Форма уточнения listing-результатов. Композирует FormField, TextInput, Select,
Checkbox, Chip и Button, но не создаёт локальные версии этих controls. Одинаковый
FilterPanel используется в desktop Sidebar и внутри FilterModal.

## Анатомия

```text
form.filter-panel
  header.filter-panel__header
    h2.filter-panel__title
    button.filter-panel__reset
  .filter-panel__body
    fieldset.filter-panel__group × N
  .filter-panel__actions
```

## Состояния

- `default`: форма доступна, применённые значения отражены в controls и URL.
- `loading`: `aria-busy="true"`; fieldset временно `disabled`, submit показывает
  Button loading, но выбранные значения остаются видимыми.
- Invalid принадлежит конкретному FormField. Empty/error относятся к результатам
  listing и не показываются внутри FilterPanel.

## API

- `value`: единая serializable-модель фильтров.
- `schema`: группы и controls; label/id/name обязательны.
- `resultCount`: число результатов для текста submit на mobile.
- events: `change`, `reset`, `submit`; изменение control не обязано сразу
  отправлять форму.
- slots: `header`, `group`, `actions` только для компоновки готовых primitives.

## Responsive

FilterPanel не знает viewport. В Sidebar он занимает 300px; FilterModal даёт ему
ширину modal body. Нельзя поддерживать две независимые копии состояния — при
перемещении между hosts используется одна model value.

## Доступность

- Корень — `<form>`; тематические группы — `<fieldset>` с `<legend>`.
- Каждый control имеет устойчивые `id`/`name` и видимый label.
- Reset — `type="reset"`, apply — `type="submit"`.
- После submit фокус остаётся на инициировавшей кнопке; число результатов
  обновляет внешний status region, а не объявляется на каждый input.

## Источники

- [`showcase/pages.html`](../../showcase/pages.html): sidebar фильтров листинга.
- [`evidence/README.md`](../../evidence/README.md): `forms-filter-sidebar-1440`.
- [`forms/checkbox.md`](../forms/checkbox.md), [`forms/select.md`](../forms/select.md),
  [`forms/text-input.md`](../forms/text-input.md).

