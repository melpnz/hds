# Tabs · Вкладки с подчёркиванием

| | |
|---|---|
| **Категория** | Навигация |
| **Каноническое имя** | `Tabs` |
| **Корневой класс** | `tabs--underline` |
| **CSS** | `ui/components.css` |
| **Живая реализация** | `showcase/components.html#n-tabs` |
| **Storybook** | отдельного компонента нет; не путать с `BaseSegmentedTabs` |

## Назначение

Переключает равноправные разделы страницы. Визуальный индикатор текущего раздела
— подчёркивание.

`Tabs` и `SegmentedTabs` — разные компоненты:

- `Tabs` переключает раздел/route;
- `SegmentedTabs` переключает представление внутри раздела и выглядит как
  segmented control.

## Семантика

Если вкладки меняют URL, использовать `nav` и ссылки с `aria-current="page"`.
Если они переключают panels без навигации, нужен tab pattern: `role="tablist"`,
`role="tab"`, `aria-selected`, `aria-controls` и keyboard navigation стрелками.
Смешивать оба варианта в одном экземпляре нельзя.

## Анатомия

```text
nav.tabs--underline
  a.tabs__tab[aria-current="page"]
  a.tabs__tab
  a.tabs__tab
```

## Состояния

| Каноническое состояние | Текущая реализация | Статус |
|---|---|---|
| `default` | вторичный текст без underline | подтверждено |
| `hover` | текст становится `gray-1` | реализовано UI kit |
| `focus-visible` | кольцо `primary-60` толщиной 2px | реализовано UI kit |
| `pressed` | текст становится primary на время `:active` | реализовано UI kit |
| `current` | `aria-current="page"` + underline | подтверждено и реализовано; `.is-active` сохранён как legacy alias |
| `disabled` | `gray-4`, без pointer events | реализовано; ссылка должна быть без `href` |

Имя `.is-active` унаследовано от production. В нормативном языке это `current`,
поскольку вкладка обозначает текущий раздел. Переименование CSS требует
migration alias и выполняется отдельно.

## API

Предлагаемый минимальный контракт для будущего runtime-компонента:

| Prop | Тип | Назначение |
|---|---|---|
| `items` | `TabItem[]` | список вкладок |
| `currentId` | `string` | текущая вкладка |
| `ariaLabel` | `string` | имя navigation/tablist |

`TabItem`: `id`, `label`, `href` для navigation mode и необязательные `count`,
`disabled`.

## Responsive

При недостатке ширины список прокручивается горизонтально. Перенос названий на
две строки не допускается. Скрывать доступные вкладки без Menu нельзя.

## Доступность

- У navigation mode текущая ссылка получает `aria-current="page"`.
- У panel mode реализуется полный ARIA tabs pattern, а не только role.
- Focus indicator обязателен и не может состоять только из изменения цвета.
- Disabled link не должен оставаться переходом с `href`.

## Разметка

```html
<nav class="tabs--underline" aria-label="Разделы">
  <a class="tabs__tab is-active" href="/vacancies" aria-current="page">Вакансии</a>
  <a class="tabs__tab" href="/companies">Компании</a>
  <a class="tabs__tab" href="/salaries">Зарплаты</a>
</nav>
```

## CSS

Текущий production-derived слой:

```css
.tabs--underline {
  display: flex;
  align-items: stretch;
  gap: 16px;
  border-bottom: 1px solid var(--color-ui-gray-shadow);
}
.tabs--underline .tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 2px;
  font: 600 14px/20px var(--font-base);
  color: var(--color-ui-gray-2);
  text-decoration: none;
  background: none;
  border: 0;
  cursor: pointer;
  white-space: nowrap;
}
.tabs--underline .tabs__tab.is-active,
.tabs--underline .tabs__tab[aria-current="page"] { color: var(--color-ui-gray-1); }
.tabs--underline .tabs__tab:not(.is-active):not([aria-current="page"]):not(:disabled):not([aria-disabled="true"]):hover {
  color: var(--color-ui-gray-1);
}
.tabs--underline .tabs__tab:focus-visible {
  outline: 2px solid var(--color-ui-primary-60);
  outline-offset: 2px;
  border-radius: 4px;
}
.tabs--underline .tabs__tab:not(:disabled):not([aria-disabled="true"]):active {
  color: var(--color-ui-primary);
}
.tabs--underline .tabs__tab:disabled,
.tabs--underline .tabs__tab[aria-disabled="true"] {
  color: var(--color-ui-gray-4);
  cursor: default;
  pointer-events: none;
}
.tabs--underline .tabs__tab.is-active::after,
.tabs--underline .tabs__tab[aria-current="page"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--color-ui-primary);
}
```

## Ограничения

- Компонент пока существует как CSS pattern без Storybook API.
- Figma содержит несколько tab families, но их нельзя объединять с Tabs без
  проверки семантической роли.
- Добавленные UI kit states основаны на нормативном state contract и существующих
  Career tokens; они не заявлены как извлечённое поведение production.

## Источники

- Production: navigation tabs с underline.
- Локальный CSS: `ui/components.css`, секция «Вкладки с подчёркиванием».
- Showcase: `showcase/components.html#n-tabs`.
- Figma evidence: `new-career-lib`, `tab / 2-lvl / simple` и соседние наборы.
  Имена variants Figma не нормативны.
