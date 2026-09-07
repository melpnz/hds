# Notice

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | `.tm-notice` |
| **CSS** | `ui/components/notice.css` |
| **Production** | 2/16 страниц |
| **Storybook** | нет собственных story |

## Назначение

Универсальный информер — ближайший аналог Career `notification`, но
устроен по-другому: акцент выражается **толстой полосой слева** (16px),
а не рамкой или сплошной заливкой.

## Анатомия

```html
<div class="tm-notice tm-notice_positive">
  <img class="tm-notice__icon" src="…" alt="">
  <div class="tm-notice__inner">
    <div class="tm-notice__title">Заголовок</div>
    <div class="tm-notice__content">Текст сообщения. <a href="/">Ссылка</a>.</div>
  </div>
</div>
```

## Варианты

| Класс | Устройство акцента |
|---|---|
| без модификатора | серая полоса слева (`--icon-secondary`) |
| `.tm-notice_positive` | полоса `--accent-positive-hover` |
| `.tm-notice_negative` | полоса `--accent-danger` |
| `.tm-notice_warning` | **заливка** всего блока `--background-orange`, полосы нет, padding сжимается до 16px |
| `.tm-notice_info` | **рамка** вместо полосы, padding 16px, radius 3px |

Три разных механики акцента в одном компоненте (полоса / заливка / рамка) —
не унифицированы, каждый вариант со своим набором свойств. Не пытаться
привести к одному приёму при переносе.

## Ограничения

Низкое покрытие (2 страницы) — набор видов может быть неполным. Иконка
(`.tm-notice__icon`, 24×24) — только геометрия подтверждена, содержимое
(какая иконка на какой вид) не найдено в снятой разметке.

## Источники

Production: `notice-CJMGtgdu.css`.
