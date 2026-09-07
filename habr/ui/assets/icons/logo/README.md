# Логотипы Хабра

Два файла, снятые с production дословно:

| Файл | Production URL | viewBox |
|---|---|---|
| `habr-logo-ru.svg` | `/img/habr-logo-ru.svg` | `0 0 54 22` |
| `habr-logo-en.svg` | `/img/habr-logo-en.svg` | `0 0 51 22` |

**Логотип НЕ входит в `megazord.svg`.** В production это отдельные файлы,
каждый со своим `<symbol id="logo">` — то есть у обоих один и тот же id,
и подключается нужный язык, а не нужное имя символа. Разметка в шапке:

```html
<a class="tm-header__logo tm-header__logo_hl-ru" href="/ru/feed">
  <svg class="tm-svg-img tm-header__icon" height="16" width="16">
    <title>Хабр</title>
    <use xlink:href="/img/habr-logo-ru.svg#logo"></use>
  </svg>
</a>
```

Атрибуты `height="16" width="16"` на `<svg>` роли не играют: размер задаёт
CSS — `.tm-header__icon { width: 100%; height: 100% }` растягивает символ на
родительскую ссылку `.tm-header__logo`, у которой три состояния ширины:

| | ширина | высота |
|---|---|---|
| `_hl-ru` | 62 | 22 |
| `_hl-ru` на ≤767 | **52** | 22 |
| `_hl-ru` на ≥1024 | 62 | **24** |
| `_hl-en` | 57 | 22 |

Пропорции символа при этом не сохраняются один в один: `viewBox` у RU —
54×22, а ссылка 62×22. Растяжение по горизонтали заложено в продукте,
это не ошибка переноса.

Отдельно существуют праздничные варианты — `_twentieth-anniversary`
(ширина 90/87) и `_ny` (66×28 у RU). Их файлы в пакет не переносились:
на снятых страницах они не отдавались. **GAP.**
