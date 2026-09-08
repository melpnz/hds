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

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-filters`](../../showcase/components.html#r4-filters).
Работает на пустой странице с одним `ui/career.css`.

```html
<form class="filter-panel" id="r4-filter-form-desktop">
  <header class="filter-panel__header"><h3 class="filter-panel__title">Фильтры</h3><button class="filter-panel__reset" type="reset">Сбросить</button></header>
  <div class="filter-panel__body">
    <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Специализация</legend><label class="filter-panel__field"><span class="filter-panel__field-label">Направление</span><span class="text-input"><input class="text-input__input" name="specialization" autocomplete="off" placeholder="Выберите специализацию"></span></label></fieldset>
    <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Квалификация</legend><span class="base-select"><select class="base-select__input" name="level"><option value="">Любая</option><option>Junior</option><option>Middle</option><option>Senior</option></select></span></fieldset>
    <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Зарплата</legend><div class="filter-panel__inline"><label class="filter-panel__field"><span class="visually-hidden">Зарплата от</span><span class="text-input"><input class="text-input__input" inputmode="numeric" name="salaryFrom" placeholder="От"></span></label><label class="filter-panel__compact"><span class="visually-hidden">Валюта</span><span class="base-select"><select class="base-select__input" name="currency"><option>₽</option><option>$</option><option>€</option></select></span></label></div><span class="checkbox"><label class="checkbox-label"><span class="checkbox-icon"><input class="checkbox-input visually-hidden" type="checkbox" name="salarySpecified"><span class="checkbox-button"></span></span><span class="checkbox-text">Только с указанной зарплатой</span></label></span></fieldset>
    <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Формат работы</legend><span class="checkbox"><label class="checkbox-label"><span class="checkbox-icon"><input class="checkbox-input visually-hidden" type="checkbox" name="remote" checked><span class="checkbox-button"></span></span><span class="checkbox-text">Можно удалённо</span></label></span><span class="checkbox"><label class="checkbox-label"><span class="checkbox-icon"><input class="checkbox-input visually-hidden" type="checkbox" name="office"><span class="checkbox-button"></span></span><span class="checkbox-text">В офисе</span></label></span></fieldset>
  </div>
  <div class="filter-panel__actions"><button type="submit" class="base-button inline-flex appearance-main size-l is-sizeable"><span class="base-button__inner"><span class="base-button__content">Показать 1 272</span></span></button></div>
</form>
```

## Источники

- [`showcase/pages.html`](../../showcase/pages.html): sidebar фильтров листинга.
- [`evidence/README.md`](../../evidence/README.md): `forms-filter-sidebar-1440`.
- [`forms/checkbox.md`](../forms/checkbox.md), [`forms/select.md`](../forms/select.md),
  [`forms/text-input.md`](../forms/text-input.md).

