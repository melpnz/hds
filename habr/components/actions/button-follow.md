# ButtonFollow

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `.tm-button-follow` (модификатор поверх `.btn`) |
| **CSS** | `ui/components/button-follow.css` |
| **Production** | 6/16 страниц |
| **Добавлен** | Visual Foundations pass — закрывает разрыв: класс использовался в showcase/pages.html без реального CSS |

## Назначение

Кнопка «Подписаться» с анимированным переключением в состояние
«Отписаться» (хаб, компания, пользователь). Ширина зафиксирована
(112px), чтобы переключение состояний не сдвигало соседние элементы.

## Анатомия

Это **не самостоятельный компонент кнопки**, а модификатор, всегда
идущий вместе с базовыми классами `.btn`:

```html
<button class="btn btn_transparent btn_small tm-button_color-christi tm-button-follow">
  <span class="button-content">Подписаться</span>
</button>

<button class="btn btn_transparent btn_small tm-button_color-christi tm-button-follow">
  <span class="button-content subscribed">Подписан</span>
  <span class="close">×</span>
</button>
```

`tm-button_color-christi` — часть анатомии, не опция: подтверждено
реальной разметкой (`showcase/pages.html`, карточка хаба) — рамка/текст
зелёные уже в состоянии «Подписаться», не только после подписки.

Текст subscribed-состояния — не сфотографирован из реального DOM (только
CSS-геометрия), поэтому взят короткий пример («Подписан»); реальная длина
ограничена `calc(100% - 26px)` ≈ 86px при 12px шрифте — не показатель
точного production-текста.

## Состояния

| Класс | Поведение |
|---|---|
| (по умолчанию) | обычная кнопка `.btn`, `.button-content` занимает всю ширину |
| `.button-content.subscribed` + `.close` | зелёный фон `--accent-positive`, справа появляется зона крестика 26px — `.button-content` сужается до `calc(100% - 26px)` |

## Источники

Production: `button-follow-Bar2fZBL.css`. До этой правки класс упоминался
в `showcase/pages.html` без backing CSS — GAP закрыт.
