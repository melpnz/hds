# SectionName

| | |
|---|---|
| **Категория** | Контент |
| **Корневой класс** | `.tm-section-name` |
| **CSS** | `ui/components/section-name.css` |
| **Production** | 8/16 страниц |
| **Добавлен** | Visual Foundations pass — топ-1 по reuse среди непокрытых модулей |

## Назначение

Заголовок секции с опциональной кнопкой «назад» — типичен для сайдбар-
виджетов и мобильных подстраниц (переход вглубь одного раздела).

## Анатомия

```html
<div class="tm-section-name">
  <span class="tm-section-name__back" role="button" tabindex="0" aria-label="Назад">
    <svg class="tm-svg-img" height="24" width="24">
      <use xlink:href="#arrow-back-long"></use></svg>
  </span>
  <span class="tm-section-name__text">Заголовок раздела</span>
</div>
```

## Типографика

`.tm-section-name__text`/`__link` — **19.9px/28px, вес 700, системный
шрифт**. Ровно то же значение, что `.tm-hub-card__name` (см.
`ui/patterns.css`) — похоже на повторяющийся уровень «крупный заголовок
виджета/карточки», отдельный от заголовков статей (Fira Sans). Не
проверено, есть ли у этого уровня собственное имя в системе — GAP.

## Responsive

Padding растёт с 16px до 20px на ≥1024 — тот же паттерн, что у `Block`.

## Ограничения

`.tm-section-name__placeholder` (скелетон загрузки, CSS-переменные
`--line-placeholder-*`) не разобран — узкий, редкий случай.

**GAP:** `__back` не удалось увидеть отрисованным ни на одной странице,
доступной гостю (проверены `/events/`, хаб, профиль компании, публикации
пользователя, комментарии) — CSS-правило есть, разметки нет. Глиф
`arrow-back-long` указан владельцем пакета, это не замер. Из CSS следует
только геометрия: `margin-left: -10px` подтягивает иконку к краю
контейнера, цвет наследуется — `--text-main`.

## Источники

Production: `section-name-63iRq3Ei.css`.
