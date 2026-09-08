# FilterModal · Мобильные фильтры

| | |
|---|---|
| **Категория** | Каркасные модули |
| **Корневой класс** | `filter-modal` |
| **CSS** | `ui/modules.css` |
| **Живая реализация** | `showcase/components.html#r4-filters` |

## Назначение

Modal adapter для того же FilterPanel, который на desktop находится в Sidebar.
FilterModal владеет только overlay, focus lifecycle, заголовком и нижней панелью
действий; поля и их model принадлежат FilterPanel.

## Состояния

- `closed`: overlay скрыт/размонтирован, trigger имеет `aria-expanded="false"`.
- `open`: `role="dialog"`, `aria-modal="true"`, доступное имя и focus trap;
  trigger имеет `aria-expanded="true"`.
- `loading`: dialog и вложенный FilterPanel получают `aria-busy="true"`, submit
  блокируется и показывает Loader.

## API

- `open`: controlled state; события `open`, `close`, `submit`, `reset`.
- `title`, `resultCount` и `triggerId`.
- slot `default`: ровно один FilterPanel с общей model value.
- Закрытие без submit сохраняет draft только если это явно решено продуктом;
  default — откат к последним применённым значениям.

## Responsive

На `≤479` dialog становится bottom sheet с радиусом только сверху и высотой не
больше viewport. На большей ширине — центрированное окно до 480px. Это варианты
раскладки одного dialog, не отдельные `mobile/tablet` компоненты.

## Доступность

- Trigger: FilterButton с `aria-haspopup="dialog"`, `aria-expanded` и
  `aria-controls`.
- Dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- При открытии фокус переходит на первый control; Tab остаётся внутри.
- Escape/close возвращают фокус trigger. Фоновый документ становится inert в
  приложении; showcase ограничивает trap самим примером.

## Разметка

Снято с живого примера витрины — [`showcase/components.html#r4-filters`](../../showcase/components.html#r4-filters).
Работает на пустой странице с одним `ui/career.css`.

```html
<div class="filter-modal" id="r4-filter-modal" data-filter-modal data-state="closed" hidden>
      <div class="filter-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="r4-filter-modal-title">
        <header class="filter-modal__header"><h3 class="filter-modal__title" id="r4-filter-modal-title">Фильтры вакансий</h3><button type="button" class="icon-button" aria-label="Закрыть фильтры" data-filter-modal-close><svg class="svg-icon icon-inline" width="24" height="24" aria-hidden="true" data-icon-src="../../ui/assets/icons/single/sprite/close.svg" viewBox="0 0 24 24">
  <path d="M16.2929 6.29287C16.6834 5.90237 17.3166 5.90237 17.7071 6.29287C18.0976 6.68338 18.0976 7.31658 17.7071 7.70708L13.4142 12L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L12 13.4142L7.70708 17.7071C7.31658 18.0976 6.68338 18.0976 6.29287 17.7071C5.90237 17.3166 5.90237 16.6834 6.29287 16.2929L10.5858 12L6.29278 7.70708C5.90248 7.31658 5.90247 6.68337 6.29287 6.29297C6.68348 5.90247 7.31667 5.90247 7.70718 6.29297L12 10.5858L16.2929 6.29287Z" />
</svg></button></header>
        <div class="filter-modal__body">
          <form class="filter-panel" id="r4-filter-form-modal">
            <div class="filter-panel__body">
              <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Специализация</legend><label class="filter-panel__field" for="r4-modal-specialization"><span class="filter-panel__field-label">Направление</span><span class="text-input"><input class="text-input__input" id="r4-modal-specialization" name="specialization" autocomplete="off" placeholder="Выберите специализацию"></span></label></fieldset>
              <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Квалификация</legend><span class="base-select"><select class="base-select__input" name="level" aria-label="Квалификация"><option value="">Любая</option><option>Junior</option><option>Middle</option><option>Senior</option></select></span></fieldset>
              <fieldset class="filter-panel__group"><legend class="filter-panel__legend">Формат работы</legend><span class="checkbox"><label class="checkbox-label"><span class="checkbox-icon"><input class="checkbox-input visually-hidden" type="checkbox" name="remote" checked><span class="checkbox-button"></span></span><span class="checkbox-text">Можно удалённо</span></label></span><span class="checkbox"><label class="checkbox-label"><span class="checkbox-icon"><input class="checkbox-input visually-hidden" type="checkbox" name="office"><span class="checkbox-button"></span></span><span class="checkbox-text">В офисе</span></label></span></fieldset>
            </div>
          </form>
        </div>
        <footer class="filter-modal__footer"><button type="reset" form="r4-filter-form-modal" class="base-button inline-flex appearance-passive size-l is-sizeable"><span class="base-button__inner"><span class="base-button__content">Сбросить</span></span></button><button type="submit" form="r4-filter-form-modal" class="base-button inline-flex appearance-main size-l is-sizeable"><span class="base-button__inner"><span class="base-button__content">Показать 1 272</span></span></button></footer>
      </div>
    </div>
```

## Источники

- [`overlays/modal.md`](../overlays/modal.md): modal lifecycle.
- [`actions/filter-button.md`](../actions/filter-button.md): trigger contract.
- [`ui/layout.css`](../../ui/layout.css): R-3/R-4, скрытие desktop sidebar.

