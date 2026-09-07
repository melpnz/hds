# Badge · Бейдж и счётчик

| | |
|---|---|
| **Категория** | Метки и статусы |
| **Каноническое имя** | `Badge` |
| **Корневой класс** | `base-badge` |
| **CSS** | `ui/components.css` |
| **Живая реализация** | `showcase/components.html#l-badge` |
| **Storybook** | отдельного компонента нет |

## Назначение

Короткий числовой или точечный индикатор рядом с action, tab или avatar. Badge
не является самостоятельным действием и не получает focus.

Не использовать вместо StatusChip: Badge показывает количество или наличие
события, StatusChip — именованный статус сущности.

## Анатомия

```text
span.base-badge
  · короткое значение
```

Для dot-варианта текстового узла нет.

## Варианты

| Вариант | Класс | Назначение |
|---|---|---|
| count | `base-badge` | число или короткое значение вроде `99+` |
| dot | `base-badge--dot` | факт наличия события без количества |
| ring | `base-badge--ring` | отделяет Badge от цветной/графической подложки |

## Состояния

Badge статичен. Его единственное обязательное состояние — `default`.

`hover`, `focus-visible`, `pressed`, `selected`, `disabled` и `loading` принадлежат
родительскому интерактивному компоненту. Не переносить их на Badge.

## API

Если компонент будет оформлен в runtime, минимальный контракт:

| Prop | Тип | По умолчанию | Назначение |
|---|---|---|---|
| `value` | `string \| number` | — | отображаемое значение |
| `dot` | `boolean` | `false` | точечный вариант |
| `ring` | `boolean` | `false` | контрастное кольцо |
| `max` | `number` | — | форматирует превышение как `${max}+` |

Названия API — решение UI kit, а не копия Figma properties.

## Токены

- `--color-ui-primary`
- `--color-ui-white`
- `--font-base`

## Доступность

- Декоративный dot скрывается от assistive technology через `aria-hidden="true"`.
- Значение count должно входить в accessible name родительского элемента либо
  иметь понятную соседнюю подпись. Число `7` без контекста неинформативно.
- Badge внутри disabled action не должен отдельно объявлять `aria-disabled`.

## Разметка

```html
<span class="base-badge">7</span>
<span class="base-badge base-badge--dot" aria-hidden="true"></span>
```

## CSS

```css
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--color-ui-primary);
  color: var(--color-ui-white);
  font: 600 11px/16px var(--font-base);
}
.base-badge--dot { width: 12px; height: 12px; min-width: 12px; padding: 0; }
.base-badge--ring { box-shadow: 0 0 0 2px var(--color-ui-white); }
```

## Ограничения

- Отдельного Storybook component/API пока нет.
- Semantic color variants не подтверждены production и не добавляются по Figma.
- Overflow policy подтверждена только примером `99+`; автоматическое
  форматирование появится вместе с runtime API.

## Источники

- Production: счётчики внутри buttons и tabs.
- Локальный CSS: `ui/components.css`, секция «Бейдж-счётчик».
- Showcase: `showcase/components.html#l-badge`.
- Figma evidence: `new-career-lib`, `badge`, node `658:361`. Названия и API Figma
  не нормативны.
